import { BinanceFuturesClient } from "../exchangeClients/binanceFutures/binanceFutures.js";
import { Candle, Timeframe } from "../exchangeClients/types.js";
import { MainframeProps } from "../mainframe.js";
import { Datafeed } from "./datafeed.abstract.js";

type BinanceFuturesParams = MainframeProps & {
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
  public static readonly client: BinanceFuturesClient =
    new BinanceFuturesClient();

  public symbol: string;

  public timeframe: Timeframe;

  constructor({ symbol, timeframe }: BinanceFuturesParams) {
    super({ timeframe, preserveCandlesLimit: 10 });

    this.symbol = symbol;
    this.timeframe = timeframe;
  }

  public async loadNextChunk(): Promise<Candle[]> {
    const candles = await BinanceFuturesDatafeed.client.getDataForPeriod({
      symbol: this.symbol,
      timeframe: this.timeframe,
      startTime: new Date(this.time),
      limit: this.limit,
    });

    if (candles.length < this.limit) {
      this.dataExceed = true;
    }

    return candles;
  }
}
