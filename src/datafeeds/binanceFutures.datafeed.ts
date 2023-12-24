import { BinanceFuturesClient } from "../exchangeClients/binanceFutures.js";
import { Candle, Datafeed, Timeframe } from "./datafeed.abstract.js";
import axios from "axios";
import type { AxiosStatic } from "axios";

type BinanceFuturesParams = {
  /**
   * Symbol to load
   * @example "BTCUSDT"
   */
  symbol: string;
  /**
   * Timeframe
   * @example "1d", "1h"
   */
  interval: Timeframe;
  /**
   * Date to start load from
   */
  startTime?: Date;
  /**
   * Load until that date
   */
  endTime?: Date;
};

export class BinanceFuturesDatafeed extends Datafeed {
  private client: BinanceFuturesClient;

  private adjustedStartTime?: Date;

  constructor(
    private params: BinanceFuturesParams,
    axiosStatic: AxiosStatic = axios
  ) {
    super();

    this.adjustedStartTime = params.startTime;

    this.client = new BinanceFuturesClient(axiosStatic);
  }

  public async loadNextChunk(): Promise<Candle[]> {
    const candles = await this.client.getDataForPeriod({
      symbol: this.params.symbol,
      interval: this.params.interval,
      startTime: this.adjustedStartTime,
      endTime: this.params.endTime,
    });

    if (candles.length !== 0) {
      this.adjustedStartTime = new Date(candles.at(-1).closeTime);
    }

    return candles;
  }
}
