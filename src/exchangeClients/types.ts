import { Position } from "../brokers/broker.abstract.js";

export type ExchangePosition = Pick<
  Position,
  "id" | "openTime" | "openPrice" | "symbol" | "direction"
> & {
  profit?: number;
  fee?: number;
};
