import { AxiosError, AxiosInstance, AxiosStatic } from "axios";
import type { Candle } from "../index.js";
import { POSITION_DIRECTION } from "../brokers/broker.abstract.js";
import { ObjectValues } from "../utils/utility.types.js";
import {
  FXOpenAccountInfo,
  FXOpenBar,
  FXOpenPosition,
} from "./fxOpen.types.js";
import { ExchangePosition } from "./types.js";
import { handleNotFoundError } from "../utils/errors.js";

export type FXOpenProps = {
  apiHost: string;
  apiId: string;
  apiKey: string;
  apiSecret: string;
};

export const FX_TIMEFRAME = {
  OneMinute: "M1",
  FiveMinutes: "M5",
  FifteenMinutes: "M15",
  OneHour: "H1",
  FourHours: "H4",
  OneDay: "D1",
  OneWeek: "W1",
} as const;

export type FxTimeframe = ObjectValues<typeof FX_TIMEFRAME>;

const API_PREFIX = "api/v2";

export class FXOpenClient {
  client: AxiosInstance;

  constructor(
    { apiHost, apiId, apiKey, apiSecret }: FXOpenProps,
    axios: AxiosStatic
  ) {
    const authHeader = this.generateBasicAuthHeader({
      apiId,
      apiKey,
      apiSecret,
    });

    this.client = axios.create({
      baseURL: apiHost,
      headers: {
        Authorization: authHeader,
      },
    });
  }

  public async getDataForPeriod(
    symbol: string,
    timeframe: FxTimeframe,
    startFrom: number,
    limit = 1000
  ) {
    console.info(
      `Start loading data for ${symbol} ${timeframe} since ${new Date(
        startFrom
      )}`
    );

    const { data } = await this.client.get<{ Bars: FXOpenBar[] }>(
      `${API_PREFIX}/quotehistory/${symbol}/${timeframe}/bars/ask?timestamp=${startFrom}&count=${limit}`
    );

    console.info(`Loaded ${data.Bars.length} items`);

    return data.Bars.map((bar) => fxOpenBarToCandle(bar, timeframe));
  }

  public async getOpenPositions(): Promise<ExchangePosition[]> {
    const { data } = await this.client.get<FXOpenPosition[]>(
      `${API_PREFIX}/position`
    );

    return data.map(fxOpenPositionToExchangePosition);
  }

  public async getPosition(id: number): Promise<ExchangePosition | void> {
    try {
      const { data } = await this.client.get<FXOpenPosition>(
        `${API_PREFIX}/position/${id}`
      );

      return fxOpenPositionToExchangePosition(data);
    } catch (error) {
      return handleNotFoundError(error as AxiosError);
    }
  }

  public async getAccountInfo() {
    const { data } = await this.client.get<FXOpenAccountInfo>(
      `${API_PREFIX}/account`
    );

    return {
      id: data.Id,
      leverage: data.Leverage,
      balance: data.Balance,
    };
  }

  private generateBasicAuthHeader({
    apiId,
    apiKey,
    apiSecret,
  }: Pick<FXOpenProps, "apiId" | "apiKey" | "apiSecret">): string {
    return `Basic ${apiId}:${apiKey}:${apiSecret}`;
  }
}

const timeDifByTimeframe = new Map<FxTimeframe, number>([
  ["M1", 59999],
  ["M5", 299999],
  ["M15", 899999],
  ["H1", 3599999],
  ["H4", 14399999],
  ["D1", 86399999],
  ["W1", 604799999],
]);

function fxOpenBarToCandle(
  fxOpenBar: FXOpenBar,
  timeframe: FxTimeframe
): Candle {
  return {
    openTime: fxOpenBar.Timestamp,
    open: fxOpenBar.Open,
    high: fxOpenBar.High,
    low: fxOpenBar.Low,
    close: fxOpenBar.Close,
    closeTime: fxOpenBar.Timestamp + (timeDifByTimeframe.get(timeframe) ?? 0),
    volume: fxOpenBar.Volume,
  };
}

function fxOpenPositionToExchangePosition(
  fxPosition: FXOpenPosition
): ExchangePosition {
  const {
    Id,
    Symbol,
    LongAmount,
    LongPrice,
    ShortAmount,
    ShortPrice,
    Commission,
    Profit,
    Created,
  } = fxPosition;

  const direction = LongAmount
    ? POSITION_DIRECTION.Long
    : ShortAmount
      ? POSITION_DIRECTION.Short
      : (0 as never);

  const openPrice =
    direction === POSITION_DIRECTION.Long
      ? LongPrice
      : direction === POSITION_DIRECTION.Short
        ? ShortPrice
        : (0 as never);

  return {
    id: Id,
    symbol: Symbol,
    openTime: Created,
    openPrice,
    direction,
    fee: Commission,
    profit: Profit,
  };
}
