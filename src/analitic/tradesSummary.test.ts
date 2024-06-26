import { describe, expect, test } from "vitest";
import { POSITION_DIRECTION, Position } from "../brokers/broker.abstract.js";
import { getTradesSummary } from "./tradesSummary.js";

const mockTrades: Position[] = [
  {
    id: 1,
    symbol: "BTCUSDT",
    timeframe: "1d",
    direction: POSITION_DIRECTION.Long,
    openPrice: 100,
    openTime: 1 * 1000,
    closePrice: 150, // 50 points gain
    closeTime: 1 * 1000 + 120 * 1000, // 120 sec duration
  },
  {
    id: 2,
    symbol: "BTCUSDT",
    timeframe: "1d",
    direction: POSITION_DIRECTION.Long,
    openPrice: 100,
    openTime: 100 * 1000,
    closePrice: 75, // 30 points loss
    closeTime: 100 * 1000 + 90 * 1000, // 90 sec duration
  },
  {
    id: 3,
    symbol: "BTCUSDT",
    timeframe: "1d",
    direction: POSITION_DIRECTION.Short,
    openPrice: 100,
    openTime: 10 * 1000,
    closePrice: 50, // 50 points gain
    closeTime: 10 * 1000 + 60 * 1000, // 60 sec duration
  },
];

const mockUnclosedTrades: Position[] = [
  {
    id: 4,
    symbol: "BTCUSDT",
    timeframe: "1d",
    direction: POSITION_DIRECTION.Short,
    openPrice: 100,
    openTime: 10 * 1000,
  },
];

describe("Trades summary", () => {
  test("should calculate all fields properly", () => {
    const result = getTradesSummary(mockTrades);

    expect(result).toStrictEqual({
      averageWin: 0.5,
      averageLoss: -0.25,
      winrate: 0.67,
      profitFactor: 4,
      expectancy: 0.4175,
      maxGain: 0.5,
      maxLoss: -0.25,
      cumulativePnl: 1687.5,
      profitResult: 0.6875,
      tradesCount: 3,
      winsCount: 2,
      longsCount: 2,
      shortsCount: 1,
      averageTimeInTrade: 90 * 1000,
      averageTimeInTradeLabel: "1.50 minutes",
    });
  });

  test("should ignore not closed trades and  calculate all fields properly", () => {
    const result = getTradesSummary([...mockTrades, ...mockUnclosedTrades]);

    expect(result).toStrictEqual({
      averageWin: 0.5,
      averageLoss: -0.25,
      winrate: 0.67,
      profitFactor: 4,
      expectancy: 0.4175,
      maxGain: 0.5,
      maxLoss: -0.25,
      cumulativePnl: 1687.5,
      profitResult: 0.6875,
      tradesCount: 3,
      winsCount: 2,
      longsCount: 2,
      shortsCount: 1,
      averageTimeInTrade: 90 * 1000,
      averageTimeInTradeLabel: "1.50 minutes",
    });
  });

  test("should not throw error when provide empty array", () => {
    const result = getTradesSummary([]);

    expect(result).toStrictEqual({
      averageWin: 0,
      averageLoss: 0,
      winrate: 0,
      profitFactor: 0,
      expectancy: 0,
      maxGain: 0,
      maxLoss: 0,
      cumulativePnl: 1000,
      profitResult: 0,
      tradesCount: 0,
      winsCount: 0,
      longsCount: 0,
      shortsCount: 0,
      averageTimeInTrade: 0,
      averageTimeInTradeLabel: "0",
    });
  });
});
