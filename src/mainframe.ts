import { Datafeed, Strategy } from "./index.js";

export class Mainframe {
  constructor(
    private datafeed: Datafeed,
    private strategy: Strategy
  ) {}

  public async backtest() {
    await this.tearUp();

    while (!this.datafeed.isLast) {
      const candle = await this.datafeed.next();

      await this.strategy.onBeforeUpdate(candle);

      await this.strategy.update(candle);
    }
  }

  private async tearUp() {
    await this.datafeed.preloadData();
  }
}
