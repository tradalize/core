import type { Position } from "../interface.js";

export type BrokerProps = {
  exchage: string;
};

export type OpenPositionPayload = Pick<
  Position,
  "symbol" | "direction" | "stopLoss" | "takeProfit"
> & {
  price: number;
  time?: number;
};

export type ClosePositionPayload = {
  price: number;
  time?: number;
};

export abstract class Broker {
  public currentPosition: Position | null;

  constructor(public props: BrokerProps) {
    this.currentPosition = null;
  }

  public abstract openPosition(
    payload: OpenPositionPayload
  ): void | Promise<void>;

  public abstract closePosition(
    payload: ClosePositionPayload
  ): void | Promise<void>;

  get isInPosition() {
    return Boolean(this.currentPosition);
  }
}
