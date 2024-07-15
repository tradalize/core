import { describe, expect, test, vi } from "vitest";
import { FXOpenPublicClient } from "../exchangeClients/fxOpen/index.js";
import { mockAxiosClient, getAxiosStatic } from "../mocks.js";
import { FXOpenDatafeed } from "./fxOpen.datafeed.js";
import { TIMEFRAME } from "../exchangeClients/types.js";

const apiHost = "api-host";

const mockCandles = [
  {
    openTime: 1,
    open: 5,
    high: 4,
    low: 3,
    close: 2,
    closeTime: 300000,
    volume: 1,
  },
  {
    openTime: 1,
    open: 5,
    high: 4,
    low: 3,
    close: 2,
    closeTime: 300000,
    volume: 1,
  },
];

describe("FXOpenDatafeed", () => {
  test("should call propper FXCloient method and return candles on loadNextChunk", async () => {
    const symbol = "EURUSD";
    const timeframe = TIMEFRAME.FiveMinutes;
    const startTime = new Date(0);

    const df = new FXOpenDatafeed(
      {
        apiHost,
        symbol,
        timeframe,
        startTime,
      },
      getAxiosStatic(mockAxiosClient)
    );

    const getDataSpy = vi
      .spyOn(FXOpenPublicClient.prototype, "getDataForPeriod")
      .mockResolvedValueOnce(mockCandles);

    const result = await df.loadNextChunk();

    expect(getDataSpy).toHaveBeenCalledWith({ symbol, timeframe, startTime });
    expect(result).toBe(mockCandles);
    expect(df.startTime.getTime()).toBe(300001);
  });
});
