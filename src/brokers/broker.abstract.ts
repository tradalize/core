import { Timeframe } from "../index.js";
import { ObjectValues } from "../utils/utility.types.js";

export const POSITION_DIRECTION = {
  Long: 1,
  Short: -1,
} as const;

export type PositionDirection = ObjectValues<typeof POSITION_DIRECTION>;

export type Position = {
  id: string | number;
  symbol: string;
  timeframe: Timeframe;
  direction: PositionDirection;
  openTime: number;
  openPrice: number;
  sl?: number;
  tp?: number;
  closeTime?: number;
  closePrice?: number;
};

export type OpenPositionPayload = Pick<
  Position,
  "symbol" | "timeframe" | "direction" | "sl" | "tp"
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
