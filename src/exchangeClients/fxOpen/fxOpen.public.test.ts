import { describe, expect, test } from "vitest";
import { mockAxiosClient, getAxiosStatic } from "../../mocks.js";
import { FXOpenBar } from "./fxOpen.types.js";
import { FXOpenPublicClient } from "./fxOpen.public.js";

const apiHost = "api-host";
const apiId = "api-id";
const apiKey = "api-key";
const apiSecret = "api-secret";

const fxOpenClientParams = { apiHost, apiId, apiKey, apiSecret };

const mockFxOpenBars: FXOpenBar[] = [
  {
    Volume: 1,
    Close: 2,
    Low: 3,
    High: 4,
    Open: 5,
    Timestamp: 1,
  },
  {
    Volume: 1,
    Close: 2,
    Low: 3,
    High: 4,
    Open: 5,
    Timestamp: 1,
  },
];

describe("fxOpen public client", () => {
  describe("getDataForPeriod", () => {
    test("should call FXOpen API with propper params and return transformed value", async () => {
      const client = new FXOpenPublicClient(
        fxOpenClientParams,
        getAxiosStatic(mockAxiosClient)
      );

      mockAxiosClient.get.mockResolvedValueOnce({
        data: { Bars: mockFxOpenBars },
      });

      const symbol = "EURUSD";
      const timeframe = "5m";
      const startTime = new Date();
      const limit = -10;

      const result = await client.getDataForPeriod({
        symbol,
        timeframe,
        startTime,
        limit,
      });

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        `/public/quotehistory/${symbol}/M5/bars/ask?timestamp=${startTime.getTime()}&count=${limit}`
      );
      expect(result).toStrictEqual([
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
      ]);
    });
  });
});
