import { ObjectValues } from "../../utils/utility.types.js";

/**
 * ByBit symbol category
 * @see https://bybit-exchange.github.io/docs/v5/enum#category
 * @default linear
 */
export type ByBitSymbolCategory = "spot" | "linear" | "inverse";

/**
 * ByBit time intervals
 * @see https://bybit-exchange.github.io/docs/v5/enum#interval
 */
export const BYBIT_TIMEFRAME = {
  OneMinute: "1",
  FiveMinutes: "5",
  FifteenMinutes: "15",
  OneHour: "60",
  FourHours: "240",
  OneDay: "D",
  OneWeek: "W",
} as const;

export type ByBitTimeframe = ObjectValues<typeof BYBIT_TIMEFRAME>;

export type ByBitKline = [
  startTime: string,
  openPrice: string,
  highPrice: string,
  lowPrice: string,
  closePrice: string,
  volume: string,
  turnover: string,
];

export type ByBitKlineResponse = {
  result: {
    category: ByBitSymbolCategory;
    symbol: string;
    list: ByBitKline[];
  };
};
