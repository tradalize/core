import { Timeframe } from "./index.js";
import { ObjectValues } from "./utils/utility.types.js";

export const RUN_STATUSES = ["backtest", "live", "stopped"] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

export const STRATEGY_TYPES = ["simple", "complex"] as const;
export type StrategyType = (typeof STRATEGY_TYPES)[number];

export type Run<
  StratType extends StrategyType = "simple",
  Settings = unknown,
> = {
  id: number;
  status: RunStatus;
  strategy: string;
  strategyType: StratType;
  settings?: Settings;
  comment?: string;
  positions?: StratType extends "simple" ? Position[] : ComplexPosition[];
};

export const POSITION_DIRECTION = {
  Long: 1,
  Short: -1,
} as const;
export type PositionDirection = ObjectValues<typeof POSITION_DIRECTION>;

export const POSITION_STATUSES = ["open", "closed"] as const;

export type PositionStatus = (typeof POSITION_STATUSES)[number];

export type ComplexPosition = {
  id: number;
  /**
   * In compare to simple position, where `closeTime` === `undefined` means the position is still open,
   * here `status` is used to determine if the complex position is still open or closed.
   * Even if all related posiions are closed, the complex position can still be open.
   */
  status: PositionStatus;

  positions: Position[];
};

export type Position<
  OpenConditions = unknown,
  CloseConditions = OpenConditions,
> = {
  id: number;

  /**
   * Join column for complex position relation.
   * If this position is part of a complex position, this will be the id of the complex position.
   */
  complexPositionId?: number;

  exchange: string;
  symbol: string;

  /**
   * The timeframe used by the to enter the position.
   * Used to pull correct data for the charts.
   */
  timeframe?: Timeframe;

  direction: PositionDirection;

  openTime: number;
  openPrice: number;
  openConditions?: OpenConditions;

  closeTime?: number;
  closePrice?: number;
  closeConditions?: CloseConditions;

  stopLoss?: number;
  takeProfit?: number;

  comment?: string;
};
