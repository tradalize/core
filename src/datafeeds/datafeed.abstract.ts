import { LinkedList } from "../dataStructures//linkedList.js";
import type { ObjectValues } from "../utils/utility.types.js";

export type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  openTime: number;
  closeTime: number;
  volume: number;
};

export const TIMEFRAME = {
  OneMinute: "1m",
  FiveMinutes: "5m",
  FifteenMinutes: "15m",
  OneHour: "1h",
  FourHours: "4h",
  OneDay: "1d",
  OneWeek: "1w",
} as const;

export type Timeframe = ObjectValues<typeof TIMEFRAME>;

export abstract class Datafeed<T = Candle> {
  public list = new LinkedList<T>();

  public abstract symbol: string;

  public abstract timeframe: Timeframe;

  constructor(data: T[] = []) {
    this.list.pushBulk(data);
  }

  public async preloadData() {
    this.list.pushBulk(await this.loadNextChunk());
  }

  public async next(): Promise<T> {
    const nextItem = this.list.shift();

    if (this.isLast) {
      this.list.pushBulk(await this.loadNextChunk());
    }

    return nextItem;
  }

  public abstract loadNextChunk(): T[] | Promise<T[]>;

  get isLast(): boolean {
    return this.list.head === null;
  }
}
