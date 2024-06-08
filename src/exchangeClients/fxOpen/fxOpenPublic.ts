import { AxiosStatic, AxiosInstance } from "axios";
import type { FxTimeframe } from "./fxOpen.types.js";
import type { FXOpenBar } from "./fxOpen.types.js";
import { fxOpenBarToCandle } from "./helpers.js";

export type FXOpenPublicProps = {
  apiHost: string;
};

export class FXOpenPublicClient {
  client: AxiosInstance;

  constructor({ apiHost }: FXOpenPublicProps, axios: AxiosStatic) {
    this.client = axios.create({
      baseURL: apiHost,
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
      `/public/quotehistory/${symbol}/${timeframe}/bars/ask?timestamp=${startFrom}&count=${limit}`
    );

    console.info(`Loaded ${data.Bars.length} items`);

    return data.Bars.map((bar) => fxOpenBarToCandle(bar, timeframe));
  }
}
