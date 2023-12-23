import { Datafeed, Strategy } from "./index.js";

export class Mainframe {
  constructor(private datafeed: Datafeed, private strategy: Strategy) {}

  public async start() {
    do {
      this.strategy.update(await this.datafeed.next());
    } while (!this.datafeed.isLast);
  }
}
