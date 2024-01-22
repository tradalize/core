import { Timeframe } from "./index.js";
import { Datafeed, Strategy } from "./index.js";

export type MainframeProps = {
  /**
   * Symbol to load
   * @example "BTCUSDT"
   */
  symbol: string;
  /**
   * Timeframe
   * @example "1d", "1h"
   */
  timeframe: Timeframe;
};

export class Mainframe {
  constructor(
    private datafeed: Datafeed,
    private strategy: Strategy,
    private props: MainframeProps
  ) {}

  public async backtest() {
    await this.tearUp();
    while (!this.datafeed.isLast) {
      const candle = await this.datafeed.next();

      await this.strategy.onBeforeUpdate(candle);

      await this.strategy.update(candle, this.props);
    }
  }

  private async tearUp() {
    await this.datafeed.preloadData();
  }
}
