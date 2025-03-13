import { Candle } from "../types.js";
import { HLCandle } from "./hyperliquid.types.js";

export function hlCandleTocandle(hlCandle: HLCandle): Candle {
  return {
    openTime: hlCandle.t,
    open: parseFloat(hlCandle.o),
    high: parseFloat(hlCandle.h),
    low: parseFloat(hlCandle.l),
    close: parseFloat(hlCandle.c),
    closeTime: hlCandle.T,
    volume: parseFloat(hlCandle.v),
  };
}
