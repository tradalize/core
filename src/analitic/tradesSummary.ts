import { POSITION_DIRECTION, Position } from "../brokers/broker.abstract.js";
import { average } from "../utils/math.js";
import { milisendsToDuration } from "../utils/timeFormatters.js";

export type TradesSummary = {
  averageWin: number;
  averageLoss: number;
  winrate: number;
  profitFactor: number;
  expectancy: number;
  maxGain: number;
  maxLoss: number;
  cumulativePnl: number;
  profitResult: number;
  tradesCount: number;
  winsCount: number;
  longsCount: number;
  shortsCount: number;
  averageTimeInTrade: number;
  averageTimeInTradeLabel: string;
};

/**
 * @description Calculate and summarize the result of the given list of trades
 */
export function getTradesSummary<T extends Position>(
  trades: T[]
): TradesSummary {
  const { longs, shorts, pnls, winPnls, loosePnls, timesInTrade } =
    trades.reduce(
      (acc, trade) => {
        if (!trade.closePrice || !trade.closeTime) {
          return acc;
        }

        const pnl = calcRelativeTradePnlWithFee(trade);

        acc.pnls.push(pnl);
        acc.timesInTrade.push(trade.closeTime - trade.openTime);

        if (trade.direction === POSITION_DIRECTION.Long) {
          acc.longs.push(trade);
        } else {
          acc.shorts.push(trade);
        }

        if (pnl > 0) {
          acc.winingTrades.push(trade);
          acc.winPnls.push(pnl);
        } else {
          acc.loosingTrades.push(trade);
          acc.loosePnls.push(pnl);
        }

        return acc;
      },
      {
        longs: [] as T[],
        shorts: [] as T[],
        winingTrades: [] as T[],
        loosingTrades: [] as T[],
        pnls: [] as number[],
        winPnls: [] as number[],
        loosePnls: [] as number[],
        timesInTrade: [] as number[],
      }
    );

  const averageWin = winPnls.length === 0 ? 0 : average(winPnls);
  const averageLoss = loosePnls.length === 0 ? 0 : average(loosePnls);

  const { balance: cumulativePnl, percentage: profitResult } = calcCumPnl(pnls);

  const averageTimeInTrade = Number(average(timesInTrade).toFixed(0));

  const tradesCount = pnls.length;
  const winrate = Number((winPnls.length / tradesCount).toFixed(2));

  return {
    averageWin: averageWin,
    averageLoss: averageLoss,
    winrate,
    profitFactor: calcProfitFactor(winPnls, loosePnls),
    expectancy: calcExpectancy({ averageWin, averageLoss, winrate }),
    maxGain: Math.max(...winPnls),
    maxLoss: Math.min(...loosePnls),
    cumulativePnl,
    profitResult,
    tradesCount,
    winsCount: winPnls.length,
    longsCount: longs.length,
    shortsCount: shorts.length,
    averageTimeInTrade,
    averageTimeInTradeLabel: milisendsToDuration(averageTimeInTrade),
  };
}

export function calcRelativeTradePnl(trade: Position): number {
  return (
    ((trade.closePrice - trade.openPrice) / trade.openPrice) * trade.direction
  );
}

/**
 * @returns Relative PnL in precentage (between 0 and 1)
 */
export function calcRelativeTradePnlWithFee(trade: Position, feeRate = 0) {
  return calcRelativeTradePnl(trade) - feeRate;
}

function calcCumPnl(
  pnls: number[],
  startBalance = 1000
): { balance: number; percentage: number } {
  let balance = startBalance;

  for (const pnl of pnls) {
    balance = balance * (1 + pnl);
  }

  return { balance, percentage: (balance - startBalance) / startBalance };
}

function calcProfitFactor(wins: number[], loses: number[]): number {
  const grossProfit = wins.reduce((acc, trade) => acc + trade, 0);
  const grossLoss = Math.abs(loses.reduce((acc, trade) => acc + trade, 0));

  if (grossLoss === 0) {
    return grossProfit > 0 ? Infinity : 0;
  } else {
    return Number((grossProfit / grossLoss).toFixed(2));
  }
}

type ExpectncyParams = {
  averageWin: number;
  averageLoss: number;
  winrate: number;
};

function calcExpectancy({
  averageWin,
  averageLoss,
  winrate,
}: ExpectncyParams): number {
  return Number(
    (winrate * averageWin - (1 - winrate) * averageLoss).toFixed(2)
  );
}
