import { describe, expect, test, vi } from "vitest";
import type { Candle } from "../index.js";
import { BinanceFuturesClient } from "../exchangeClients/binanceFutures/index.js";
import { BinanceFuturesDatafeed } from "./binanceFutures.datafeed";

const mockCandle: Candle = {
  openTime: new Date("01 01 2020").getTime(),
  open: 100,
  high: 150,
  low: 50,
  close: 110,
  closeTime: new Date("01 02 2020").getTime(),
  volume: 1000,
};

describe("Binance Futures datafeed", () => {
  describe("loadNextChunk", () => {
    test("should call correct client method with correct params", async () => {
      const symbol = "BTCUSDT";
      const timeframe = "1d";
      const startTime = new Date("01 01 2020");
      const endTime = new Date("01 02 2020");

      const getDataForPeriodSpy = vi
        .spyOn(BinanceFuturesClient.prototype, "getDataForPeriod")
        .mockResolvedValueOnce([mockCandle]);

      const df = new BinanceFuturesDatafeed({
        symbol,
        timeframe,
        startTime,
        endTime,
      });

      const result = await df.loadNextChunk();

      expect(result).toStrictEqual([mockCandle]);
      expect(getDataForPeriodSpy).toHaveBeenCalledWith({
        symbol,
        timeframe,
        startTime,
        endTime,
      });
    });
  });
});
