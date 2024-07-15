import { LinkedList } from "../dataStructures//linkedList.js";
import { Candle, Timeframe } from "../exchangeClients/types.js";

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
