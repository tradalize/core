import {
  Broker,
  Candle,
  POSITION_DIRECTION,
  PositionDirection,
  Timeframe,
} from "../index.js";

export abstract class Strategy {
  protected openOnNext: PositionDirection | null;

  protected closeOnNext: boolean;

  constructor(private broker: Broker) {}

  public async onBeforeUpdate(
    symbol: string,
    timeframe: Timeframe,
    candle: Candle
  ): Promise<void> {
    if (this.broker?.currentPosition?.sl) {
      await this.checkSl(candle);
    }

    if (this.broker?.currentPosition?.tp) {
      await this.checkTp(candle);
    }

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

  private async checkSl(candle: Candle) {
    if (
      (this.broker.currentPosition.direction === POSITION_DIRECTION.Long &&
        this.broker.currentPosition.sl > candle.low) ||
      (this.broker.currentPosition.direction === POSITION_DIRECTION.Short &&
        this.broker.currentPosition.sl < candle.high)
    ) {
      await this.broker.closePosition({
        price: this.broker.currentPosition.sl,
        time: candle.closeTime,
      });
    }
  }

  private async checkTp(candle: Candle) {
    if (
      (this.broker.currentPosition.direction === POSITION_DIRECTION.Long &&
        this.broker.currentPosition.tp < candle.high) ||
      (this.broker.currentPosition.direction === POSITION_DIRECTION.Short &&
        this.broker.currentPosition.tp > candle.low)
    ) {
      await this.broker.closePosition({
        price: this.broker.currentPosition.tp,
        time: candle.closeTime,
      });
    }
  }
}
