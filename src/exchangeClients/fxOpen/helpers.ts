import { POSITION_DIRECTION } from "../../brokers/broker.abstract.js";
import { Candle } from "../../datafeeds/datafeed.abstract.js";
import { ExchangePosition, ExchangeTrade } from "../types.js";
import type { FxTimeframe } from "./fxOpen.types.js";
import { FXOpenBar, FXOpenPosition, FXOpenTrade } from "./fxOpen.types.js";

export const timeDifByTimeframe = new Map<FxTimeframe, number>([
  ["M1", 59999],
  ["M5", 299999],
  ["M15", 899999],
  ["H1", 3599999],
  ["H4", 14399999],
  ["D1", 86399999],
  ["W1", 604799999],
]);

export function fxOpenBarToCandle(
  fxOpenBar: FXOpenBar,
  timeframe: FxTimeframe
): Candle {
  return {
    openTime: fxOpenBar.Timestamp,
    open: fxOpenBar.Open,
    high: fxOpenBar.High,
    low: fxOpenBar.Low,
    close: fxOpenBar.Close,
    closeTime: fxOpenBar.Timestamp + (timeDifByTimeframe.get(timeframe) ?? 0),
    volume: fxOpenBar.Volume,
  };
}

export function fxOpenPositionToExchangePosition(
  fxPosition: FXOpenPosition
): ExchangePosition {
  const {
    Id,
    Symbol,
    LongAmount,
    LongPrice,
    ShortAmount,
    ShortPrice,
    Commission,
    Profit,
    Modified,
  } = fxPosition;

  const direction = LongAmount
    ? POSITION_DIRECTION.Long
    : ShortAmount
      ? POSITION_DIRECTION.Short
      : (0 as never);

  const openPrice =
    direction === POSITION_DIRECTION.Long
      ? LongPrice
      : direction === POSITION_DIRECTION.Short
        ? ShortPrice
        : (0 as never);

  return {
    id: Id,
    symbol: Symbol,
    openTime: Modified,
    openPrice,
    direction,
    ammount: LongAmount ? LongAmount : ShortAmount ?? 0,
    fee: Commission,
    profit: Profit,
  };
}

export function fxOpenTradeToExchangeTrade({
  Id,
  Symbol,
  Side,
  Price,
  Filled,
  FilledAmount,
}: FXOpenTrade): ExchangeTrade {
  const direction =
    Side === "Buy"
      ? POSITION_DIRECTION.Long
      : Side === "Sell"
        ? POSITION_DIRECTION.Short
        : undefined;

  return {
    id: Id,
    symbol: Symbol,
    direction,
    openPrice: Price,
    openTime: Filled,
    ammount: FilledAmount,
  };
}

export async function createHMACSignature(
  apiSecret: string,
  dataToSign: string
) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiSecret);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(dataToSign)
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
