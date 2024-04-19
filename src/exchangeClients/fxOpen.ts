import { AxiosInstance, AxiosStatic } from "axios";
import { Candle } from "../index.js";
import { ObjectValues } from "../utils/utility.types.js";

export type FXOpenProps = {
  apiHost: string;
  apiId: string;
  apiKey: string;
  apiSecret: string;
};

type FXOpenBar = {
  Volume: number;
  Close: number;
  Low: number;
  High: number;
  Open: number;
  Timestamp: number;
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

const timeDifByTimeframe = new Map<FxTimeframe, number>([
  ["M1", 59999],
  ["M5", 299999],
  ["M15", 899999],
  ["H1", 3599999],
  ["H4", 14399999],
  ["D1", 86399999],
  ["W1", 604799999]
]);

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
      `api/v2/quotehistory/${symbol}/${timeframe}/bars/ask?timestamp=${startFrom}&count=${limit}`
    );

    console.info(`Loaded ${data.Bars.length} items`);

    return data.Bars.map((bar) => fxOpenBarToCandle(bar, timeframe));
  }

  private generateBasicAuthHeader({
    apiId,
    apiKey,
    apiSecret,
  }: Pick<FXOpenProps, "apiId" | "apiKey" | "apiSecret">): string {
    return `Basic ${apiId}:${apiKey}:${apiSecret}`;
  }
}


function fxOpenBarToCandle(fxOpenBar: FXOpenBar, timeframe: FxTimeframe): Candle {
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
