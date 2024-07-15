import {
  ByBitPublicClient,
  ByBitSymbolCategory,
} from "../exchangeClients/index.js";
import { Candle, Timeframe } from "../exchangeClients/types.js";
import { MainframeProps } from "../mainframe.js";
import { Datafeed } from "./datafeed.abstract.js";
import axios from "axios";
import type { AxiosStatic } from "axios";

type ByBitParams = MainframeProps & {
  /**
   * Date to start load from
   */
  startTime?: Date;
  /**
   * Load until that date
   */
  endTime?: Date;
  /**
   * Category of asset
   * @default linear
   */
  category?: ByBitSymbolCategory;
};

export class ByBitDatafeed extends Datafeed {
  private client: ByBitPublicClient;

  public symbol: string;

  public timeframe: Timeframe;

  private startTime?: Date;

  private endTime?: Date;

  private category: ByBitSymbolCategory;

  constructor(
    { symbol, timeframe, endTime, startTime, category = "linear" }: ByBitParams,
    axiosStatic: AxiosStatic = axios
  ) {
    super();

    this.symbol = symbol;
    this.timeframe = timeframe;
    this.startTime = startTime;
    this.endTime = endTime;
    this.category = category;

    this.client = new ByBitPublicClient(axiosStatic);
  }

  public async loadNextChunk(): Promise<Candle[]> {
    const candles = await this.client.getDataForPeriod({
      symbol: this.symbol,
      timeframe: this.timeframe,
      startTime: this.startTime,
      endTime: this.endTime,
      category: this.category,
    });

    if (candles.length !== 0) {
      this.startTime = new Date(candles.at(-1).closeTime);
    }

    return candles;
  }
}
