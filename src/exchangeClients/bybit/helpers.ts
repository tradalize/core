import { Candle, TIMEFRAME, Timeframe } from "../types.js";
import { BYBIT_TIMEFRAME, ByBitKline, ByBitTimeframe } from "./bybit.types.js";

const timeframesMap = new Map<Timeframe, ByBitTimeframe>([
  [TIMEFRAME.OneMinute, BYBIT_TIMEFRAME.OneMinute],
  [TIMEFRAME.FiveMinutes, BYBIT_TIMEFRAME.FiveMinutes],
  [TIMEFRAME.FifteenMinutes, BYBIT_TIMEFRAME.FifteenMinutes],
  [TIMEFRAME.OneHour, BYBIT_TIMEFRAME.OneHour],
  [TIMEFRAME.FourHours, BYBIT_TIMEFRAME.FourHours],
  [TIMEFRAME.OneDay, BYBIT_TIMEFRAME.OneDay],
  [TIMEFRAME.OneWeek, BYBIT_TIMEFRAME.OneWeek],
]);

export function getByBitTimeframe(timeframe: Timeframe): ByBitTimeframe {
  const byBitTimeframe = timeframesMap.get(timeframe);

  if (!byBitTimeframe) {
    throw new Error(`Unsupported timeframe ${timeframe}`);
  }

  return byBitTimeframe;
}

export const timeDifByTimeframe = new Map<ByBitTimeframe, number>([
  ["1", 59999],
  ["5", 299999],
  ["15", 899999],
  ["60", 3599999],
  ["240", 14399999],
  ["D", 86399999],
  ["W", 604799999],
]);

export function byBitKlineToCandle(
  byBitKline: ByBitKline,
  timeframe: ByBitTimeframe
): Candle {
  const [startTime, openPrice, highPrice, lowPrice, closePrice, volume] =
    byBitKline;

  return {
    openTime: Number(startTime),
    open: Number(openPrice),
    high: Number(highPrice),
    low: Number(lowPrice),
    close: Number(closePrice),
    closeTime: Number(startTime) + (timeDifByTimeframe.get(timeframe) ?? 0),
    volume: Number(volume),
  };
}
