import { Timeframe } from "../types.js";

export type HLCandle = {
  /**
   * Open time, milliseconds
   */
  t: number;
  /**
   * Close time, milliseconds
   */
  T: number;
  /**
   * Symbol
   */
  s: string;
  /**
   * Interval | Timeframe
   */
  i: Timeframe;
  /**
   * Open price
   */
  o: string;
  /**
   * Close price
   */
  c: string;
  /**
   * High price
   */
  h: string;
  /**
   * Low price
   */
  l: string;
  /**
   * Volume
   */
  v: string;
  n: number;
};

export type HLSymbol = {
  szDecimals: number;
  name: string;
  maxLeverage: number;
  onlyIsolated?: boolean;
  isDelisted?: boolean;
};
