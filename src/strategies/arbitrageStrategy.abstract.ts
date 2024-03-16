import { Broker, Candle, MainframeProps } from "../index.js";

export abstract class ArbitrageStrategy {
  constructor(protected brokers: [Broker, Broker]) {}

  public abstract update(
    candles: [Candle, Candle],
    props: [MainframeProps, MainframeProps]
  ): void | Promise<void>;
}
