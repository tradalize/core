import { Timeframe } from "./index.js";
import { Datafeed, Strategy, ArbitrageStrategy } from "./index.js";

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

export class ArbitrageMainframe {
  df1: Datafeed;
  df2: Datafeed;

  constructor(
    datafeeds: [Datafeed, Datafeed],
    protected strategy: ArbitrageStrategy,
    private props: [MainframeProps, MainframeProps]
  ) {
    const [df1, df2] = datafeeds;

    this.df1 = df1;
    this.df2 = df2;
  }

  public async backtest() {
    await this.tearUp();

    while (!this.df1.isLast && !this.df2.isLast) {
      const candle1 = await this.df1.next();
      const candle2 = await this.df2.next();

      await this.strategy.update([candle1, candle2], this.props);
    }
  }

  private async tearUp() {
    await Promise.all([this.df1.preloadData(), this.df2.preloadData()]);
  }
}
