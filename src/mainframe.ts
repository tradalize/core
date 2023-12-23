import { Datafeed, Strategy } from ".";

export class Mainframe {
  constructor(private datafeed: Datafeed, private strategy: Strategy) {}

  public async start() {
    do {
      this.strategy.update(await this.datafeed.next());
    } while (this.datafeed.isLast);
  }
}
