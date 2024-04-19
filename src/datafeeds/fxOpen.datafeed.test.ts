import { describe, expect, test, vi } from "vitest";
import { FXOpenClient, FX_TIMEFRAME } from "../exchangeClients/fxOpen.js";
import { mockAxiosClient, getAxiosStatic } from "../mocks.js";
import { FXOpenDatafeed } from "./fxOpen.datafeed.js";
import { TIMEFRAME, Timeframe } from "./datafeed.abstract.js";

const apiHost = "api-host";
const apiId = "api-id";
const apiKey = "api-key";
const apiSecret = "api-secret";

const fxOpenClientParams = { apiHost, apiId, apiKey, apiSecret };

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
  test("should throw on unsupported timeframe", () => {
    expect(
      () =>
        new FXOpenDatafeed(
          {
            ...fxOpenClientParams,
            symbol: "EURUSD",
            timeframe: "unsupported" as Timeframe,
            startTime: 0,
          },
          getAxiosStatic(mockAxiosClient)
        )
    ).toThrow();
  });

  test("should call propper FXCloient method and return candles on loadNextChunk", async () => {
    const symbol = "EURUSD";
    const timeframe = TIMEFRAME.FiveMinutes;
    const startTime = 0;

    const df = new FXOpenDatafeed(
      {
        ...fxOpenClientParams,
        symbol,
        timeframe,
        startTime,
      },
      getAxiosStatic(mockAxiosClient)
    );

    const getDataSpy = vi
      .spyOn(FXOpenClient.prototype, "getDataForPeriod")
      .mockResolvedValueOnce(mockCandles);

    const result = await df.loadNextChunk();

    expect(getDataSpy).toHaveBeenCalledWith(
      symbol,
      FX_TIMEFRAME.FiveMinutes,
      startTime
    );
    expect(result).toBe(mockCandles);
    expect(df.startTime).toBe(300001);
  });
});
