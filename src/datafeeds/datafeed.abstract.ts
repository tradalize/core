import {
  type Candle,
  TIMEFRAME,
  type Timeframe,
} from "../exchangeClients/types.js";

export type DatafeedProps = {
  timeframe: Timeframe;

  /**
   * The ammount of candles to keep backwards in memory.
   * Typicaly should be equal to the bigest length used in the indicators.
   * @default 1000
   */
  preserveCandlesLimit?: number;
};

const timeframeMiliseconds: Record<Timeframe, number> = Object.freeze({
  [TIMEFRAME.OneMinute]: 60 * 1000,
  [TIMEFRAME.FiveMinutes]: 5 * 60 * 1000,
  [TIMEFRAME.FifteenMinutes]: 15 * 60 * 1000,
  [TIMEFRAME.OneHour]: 60 * 60 * 1000,
  [TIMEFRAME.FourHours]: 4 * 60 * 60 * 1000,
  [TIMEFRAME.OneDay]: 24 * 60 * 60 * 1000,
  [TIMEFRAME.OneWeek]: 7 * 24 * 60 * 60 * 1000,
});

export abstract class Datafeed {
  #candles: Map<number, Candle> = new Map();

  #time = 0;

  #timeframeMiliseconds: number;

  #limit: number;

  public dataExceed: boolean = false;

  get time() {
    return this.#time;
  }

  set time(time: number) {
    this.#time = time;

    const firstCandleIndex = this.keys.findIndex(
      (key) => key >= this.firstCandleTime
    );

    if (firstCandleIndex > 0) {
      const removableIndices = this.keys.slice(0, firstCandleIndex + 1);

      for (const removableIndex of removableIndices) {
        this.#candles.delete(removableIndex);
      }
    }
  }

  get limit() {
    return this.#limit;
  }

  get firstCandleTime() {
    return this.#time - this.#timeframeMiliseconds * this.#limit;
  }

  get candle() {
    return this.#candles.get(this.#time);
  }

  get size() {
    return this.#candles.size;
  }

  get keys() {
    return Array.from(this.#candles.keys());
  }

  constructor({ timeframe, preserveCandlesLimit = 1000 }: DatafeedProps) {
    this.#timeframeMiliseconds = timeframeMiliseconds[timeframe];
    this.#limit = preserveCandlesLimit;
  }

  public abstract loadNextChunk(): Promise<Candle[]>;

  public async tick(time: number) {
    this.time = time;

    if (this.candle === undefined && !this.dataExceed) {
      const nextChunk = await this.loadNextChunk();

      if (nextChunk.length === 0) {
        this.dataExceed = true;
        return;
      }

      for (const candle of nextChunk) {
        this.#candles.set(candle.openTime, candle);
      }
    }

    return this.candle;
  }

  public getPastCandles(limit: number = this.limit) {
    const absoluteLimit = Math.abs(limit);
    const mapKeys = this.keys;

    const targetIndex = mapKeys.findIndex((key) => key >= this.time) + 1;
    const indices = mapKeys.slice(
      Math.max(targetIndex - absoluteLimit, 0),
      targetIndex
    );

    return indices.map((index) => this.#candles.get(index));
  }
}
