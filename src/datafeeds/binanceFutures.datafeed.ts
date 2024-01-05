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
  timeframe: Timeframe;
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

  public symbol: string;

  public timeframe: Timeframe;

  private startTime?: Date;

  private endTime?: Date;

  constructor(
    { symbol, timeframe, endTime, startTime }: BinanceFuturesParams,
    axiosStatic: AxiosStatic = axios
  ) {
    super();

    this.symbol = symbol;
    this.timeframe = timeframe;
    this.startTime = startTime;
    this.endTime = endTime;

    this.client = new BinanceFuturesClient(axiosStatic);
  }

  public async loadNextChunk(): Promise<Candle[]> {
    const candles = await this.client.getDataForPeriod({
      symbol: this.symbol,
      interval: this.timeframe,
      startTime: this.startTime,
      endTime: this.endTime,
    });

    if (candles.length !== 0) {
      this.startTime = new Date(candles.at(-1).closeTime);
    }

    return candles;
  }
}
