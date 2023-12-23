import { Candle } from "../index.js";

export const enum PositionDirection {
  Long = 1,
  Short = -1,
}

export abstract class Strategy {
  public abstract update(candle: Candle): void | Promise<void>;
}
