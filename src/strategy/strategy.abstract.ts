import { Candle } from "..";

export const enum PositionDirection {
  Long = 1,
  Short = -1,
}

export abstract class Strategy {
  public abstract update(candle: Candle): void | Promise<void>;
}
