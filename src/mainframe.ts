import { Datafeed, Strategy } from "./index.js";

export class Mainframe {
  constructor(
    private datafeed: Datafeed,
    private strategy: Strategy
  ) {}

  public async backtest() {
    await this.datafeed.preloadData();

    while (!this.datafeed.isLast) {
      this.strategy.update(await this.datafeed.next());
    }
  }
}
