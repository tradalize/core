import { Position } from "../brokers/broker.abstract.js";
import { ObjectValues } from "../utils/utility.types.js";

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

export type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  openTime: number;
  closeTime: number;
  volume: number;
};

export const TIMEFRAME = {
  OneMinute: "1m",
  FiveMinutes: "5m",
  FifteenMinutes: "15m",
  OneHour: "1h",
  FourHours: "4h",
  OneDay: "1d",
  OneWeek: "1w",
} as const;

export type Timeframe = ObjectValues<typeof TIMEFRAME>;

export type GetDataForPeriodProps = {
  symbol: string;
  timeframe: Timeframe;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
};
