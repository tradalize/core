import { Broker, Candle, PositionDirection } from "../index.js";

export abstract class Strategy {
  protected abstract openOnNext: PositionDirection | null;

  protected abstract closeOnNext: boolean;

  constructor(private broker: Broker) {}

  public async onBeforeUpdate(candle: Candle): Promise<void> {
    await this.checkCloseOnNext(candle);

    await this.checkOpenOnNext(candle);

    return;
  }

  public abstract update(candle: Candle): void | Promise<void>;

  public async checkOpenOnNext(candle: Candle): Promise<void> {
    if (!this.openOnNext) {
      return;
    }

    const { openTime, open } = candle;

    await this.broker.openPosition({
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
