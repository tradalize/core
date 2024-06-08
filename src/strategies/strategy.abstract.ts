import {
  Broker,
  Candle,
  MainframeProps,
  OpenPositionPayload,
  POSITION_DIRECTION,
  PositionDirection,
} from "../index.js";

export abstract class Strategy<TBroker extends Broker = Broker> {
  /**
   * Used for open the position "on next candle open"
   * You can set `symbol`, `timeframe` and `direction` of position you want to open
   * Additionally you can set `sl` - stop loss and `tp` - take profit options
   * If you set it directly here it will override your dynamic calculations
   */
  protected openOnNext: Omit<OpenPositionPayload, "price" | "openTime"> | null;

  /**
   * Used to close position "on next candle open"
   */
  protected closeOnNext: boolean;

  constructor(protected broker: TBroker) {}

  public async onBeforeUpdate(candle: Candle): Promise<void> {
    if (this.broker?.currentPosition?.sl) {
      await this.checkSl(candle);
    }

    if (this.broker?.currentPosition?.tp) {
      await this.checkTp(candle);
    }

    await this.checkCloseOnNext(candle);

    await this.checkOpenOnNext(candle);

    return;
  }

  /**
   * Main method of each strategy. Receives new candle on each iteration
   * You can set `openOnNext` and `closeOnNext` properties here to open and close positions on next candle
   * Or you can open and close positions here directly, using `broker`, which is avaliable in `this` context
   * But be carefull with "look ahead" bias
   */
  public abstract update(
    candle: Candle,
    props: MainframeProps
  ): void | Promise<void>;

  public async checkOpenOnNext(candle: Candle): Promise<void> {
    if (!this.openOnNext) {
      return;
    }

    const { openTime, open } = candle;

    await this.broker.openPosition({
      time: openTime,
      price: open,
      sl: this.calcSl(open, this.openOnNext.direction),
      tp: this.calcTp(open, this.openOnNext.direction),
      ...this.openOnNext,
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

  /**
   * Method for dynamic stop loss calculation
   * May be usefull to calculate stop loss based on some indicatir value
   */
  protected abstract calcSl(
    price: number,
    direction: PositionDirection
  ): number | undefined;

  /**
   * Method for dynamic calculation of take profit
   * Same as `calcSl`, but for the take profit
   */
  protected abstract calcTp(
    price: number,
    direction: PositionDirection
  ): number | undefined;
}
