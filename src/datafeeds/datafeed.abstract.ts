import { LinkedList } from "../utils/linkedList.js";

export type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  openTime: number;
  closeTime: number;
  volume: number;
};

export const enum Timeframe {
  OneMinute = "1m",
  FiveMinutes = "5m",
  FifteenMinutes = "15m",
  OneHour = "1h",
  FourHours = "4h",
  OneDay = "1d",
  OneWeek = "1w",
}

export abstract class Datafeed<T = Candle> {
  list = new LinkedList<T>();

  constructor(data: T[] = []) {
    this.list.pushBulk(data);
  }

  public async next(): Promise<T> {
    const nextItem = this.list.shift();

    if (this.isLast) {
      this.list.pushBulk(await this.loadNextChunk());
    }

    return nextItem;
  }

  public async loadNextChunk(): Promise<T[]> {
    return [];
  }

  get isLast(): boolean {
    return this.list.head === null;
  }
}
