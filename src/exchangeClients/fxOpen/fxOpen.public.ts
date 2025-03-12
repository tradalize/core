import type { FXOpenBar, FXOpenSymbol } from "./fxOpen.types.js";
import { fxOpenBarToCandle, getFXOpenTimeframe } from "./helpers.js";
import { ExchangeClient } from "../exchangeClient.abstract.js";
import { GetDataForPeriodProps } from "../types.js";

export class FXOpenPublicClient extends ExchangeClient {
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

    const data = await this.client.get<{ Bars: FXOpenBar[] }>(
      `/public/quotehistory/${symbol}/${fxTimeframe}/bars/ask?timestamp=${startTime.getTime()}&count=${limit}`
    );

    console.info(`Loaded ${data.Bars.length} items`);

    return data.Bars.map((bar) => fxOpenBarToCandle(bar, fxTimeframe));
  }

  public async getSymbols(): Promise<string[]> {
    const data = await this.client.get<FXOpenSymbol[]>("/public/symbol");

    return data
      .filter(
        ({ StatusGroupId, SecurityDescription }) =>
          StatusGroupId === "Forex" &&
          ["Major Forex symbols", "Regular Forex symbols"].includes(
            SecurityDescription
          )
      )
      .map(({ Symbol }) => Symbol);
  }
}
