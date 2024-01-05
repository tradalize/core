import { Broker, Candle, PositionDirection, Timeframe } from "../index.js";

export abstract class Strategy {
  protected openOnNext: PositionDirection | null;

  protected closeOnNext: boolean;

  constructor(private broker: Broker) {}

  public async onBeforeUpdate(
    symbol: string,
    timeframe: Timeframe,
    candle: Candle
  ): Promise<void> {
    await this.checkCloseOnNext(candle);

    await this.checkOpenOnNext(symbol, timeframe, candle);

    return;
  }

  public abstract update(candle: Candle): void | Promise<void>;

  public async checkOpenOnNext(
    symbol: string,
    timeframe: Timeframe,
    candle: Candle
  ): Promise<void> {
    if (!this.openOnNext) {
      return;
    }

    const { openTime, open } = candle;

    await this.broker.openPosition({
      symbol,
      timeframe,
      price: open,
      direction: this.openOnNext,
      time: openTime,
    });

    this.openOnNext = null;
  }

  public async checkCloseOnNext(candle: Candle) {
    if (!this.closeOnNext || !this.broker.isInPosition) {
      return;
    }

    const { openTime, open } = candle;

    await this.broker.closePosition({
      price: open,
      time: openTime,
    });

    this.closeOnNext = false;
  }
}
