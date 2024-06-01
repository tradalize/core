import { Position } from "../brokers/broker.abstract.js";

export type ExchangeTrade = Pick<
  Position,
  "id" | "openTime" | "openPrice" | "symbol" | "direction"
> & {
  ammount: number;
};

export type ExchangePosition = ExchangeTrade & {
  profit?: number;
  fee?: number;
};
