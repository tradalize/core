import { AxiosStatic, AxiosInstance } from "axios";
import type { FXOpenBar, FXOpenPublicProps } from "./fxOpen.types.js";
import { fxOpenBarToCandle, getFXOpenTimeframe } from "./helpers.js";
import { ExchangeClient } from "../exchangeClient.abstract.js";
import { GetDataForPeriodProps } from "../types.js";

export class FXOpenPublicClient implements ExchangeClient {
  client: AxiosInstance;

  constructor({ apiHost }: FXOpenPublicProps, axios: AxiosStatic) {
    this.client = axios.create({
      baseURL: apiHost,
    });
  }

  /**
   * Get candles for the period
   */
  public async getDataForPeriod({
    symbol,
    timeframe,
    startTime,
    limit = 1000,
  }: GetDataForPeriodProps) {
    const fxTimeframe = getFXOpenTimeframe(timeframe);

    console.info(
      `Start loading data for ${symbol} ${fxTimeframe} since ${startTime}`
    );

    const { data } = await this.client.get<{ Bars: FXOpenBar[] }>(
      `/public/quotehistory/${symbol}/${fxTimeframe}/bars/ask?timestamp=${startTime.getTime()}&count=${limit}`
    );

    console.info(`Loaded ${data.Bars.length} items`);

    return data.Bars.map((bar) => fxOpenBarToCandle(bar, fxTimeframe));
  }
}
