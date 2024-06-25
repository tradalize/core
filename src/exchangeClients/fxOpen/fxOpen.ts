import { AxiosError, AxiosInstance, AxiosStatic } from "axios";
import type { ExchangeTrade } from "../../index.js";
import {
  CancelFXOpenTradePayload,
  CancelFXOpenTradeType,
  CreateFXOpenTradePayload,
  FXOpenAccountInfo,
  FXOpenBar,
  FXOpenPosition,
  FXOpenTrade,
} from "./fxOpen.types.js";
import { ExchangePosition } from "../types.js";
import { handleNotFoundError } from "../../utils/errors.js";
import type { FXOpenProps, FxTimeframe } from "./fxOpen.types.js";
import {
  fxOpenBarToCandle,
  fxOpenPositionToExchangePosition,
  fxOpenTradeToExchangeTrade,
  createHMACSignature,
} from "./helpers.js";

/**
 * CLient for the interaction with FX Open broket via TickerTrader API
 * @see https://fxopen.com
 * @see https://ttlivewebapi.fxopen.net:8443/api/doc/index Swager
 * @host https://ttlivewebapi.fxopen.net:8443/api/v2 Live API
 * @host https://ttdemowebapi.fxopen.net:8443/api/v2 Demo API
 */
export class FXOpenClient {
  client: AxiosInstance;

  constructor(
    { apiHost, apiId, apiKey, apiSecret }: FXOpenProps,
    axios: AxiosStatic
  ) {
    this.client = axios.create({
      baseURL: apiHost,
    });

    this.client.interceptors.request.use(async (config) => {
      const timestamp = Date.now();

      const signature = await createHMACSignature(
        apiSecret,
        `${timestamp}${apiId}${apiKey}${config.method.toUpperCase()}${config.baseURL}${config.url}${config.data ? JSON.stringify(config.data) : ""}`
      );

      config.headers.set(
        "Authorization",
        `HMAC ${apiId}:${apiKey}:${timestamp}:${signature}`
      );

      return config;
    });
  }

  /**
   * Get candles for the period
   */
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
      `/quotehistory/${symbol}/${timeframe}/bars/ask?timestamp=${startFrom}&count=${limit}`
    );

    console.info(`Loaded ${data.Bars.length} items`);

    return data.Bars.map((bar) => fxOpenBarToCandle(bar, timeframe));
  }

  /**
   * Get list of the open positions
   */
  public async getOpenPositions(): Promise<ExchangePosition[]> {
    const { data } = await this.client.get<FXOpenPosition[]>("/position");

    return data.map(fxOpenPositionToExchangePosition);
  }

  /**
   * Get position by ID
   * @param idOrSymbol Id of position or Symbol (EURUSD etc.)
   */
  public async getPosition(
    idOrSymbol: number | string
  ): Promise<ExchangePosition | void> {
    try {
      const { data } = await this.client.get<FXOpenPosition>(
        `/position/${idOrSymbol}`
      );

      return fxOpenPositionToExchangePosition(data);
    } catch (error) {
      return handleNotFoundError(error as AxiosError);
    }
  }

  /**
   * Get account info
   */
  public async getAccountInfo() {
    const { data } = await this.client.get<FXOpenAccountInfo>("/account");

    return {
      id: data.Id,
      leverage: data.Leverage,
      balance: data.Balance,
    };
  }

  /**
   * Create trade
   * Market trades will be executed immiedtelly
   * Note that your position ID will not be equal to the order ID that creates this position
   */
  public async createTrade(
    payload: CreateFXOpenTradePayload
  ): Promise<ExchangeTrade | void> {
    try {
      const { data } = await this.client.post<FXOpenTrade>("/trade", payload);

      return fxOpenTradeToExchangeTrade(data);
    } catch (error) {
      return handleNotFoundError(error as AxiosError);
    }
  }

  /**
   * Cancel trade by ID
   * Can be usefull with limit orders
   */
  public async cancelTrade(
    payload: CancelFXOpenTradePayload
  ): Promise<ExchangeTrade | void> {
    try {
      const { data } = await this.client.delete<{
        Type: CancelFXOpenTradeType;
        Trade: FXOpenTrade;
      }>(`/trade?trade.type=${payload.Type}&trade.id=${payload.Id}`);

      return fxOpenTradeToExchangeTrade(data.Trade);
    } catch (error) {
      return handleNotFoundError(error);
    }
  }
}
