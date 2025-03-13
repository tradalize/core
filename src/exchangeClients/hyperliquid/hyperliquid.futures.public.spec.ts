import { describe, test, expect, vi } from "vitest";
import { HyperliquidFuturesPublicClient } from "./hyperliquid.futures.public.js";
import { FetchClient } from "../../fetchClient/fetchClient.js";
import { HLCandle, HLSymbol } from "./hyperliquid.types.js";
import { Candle } from "../../../dist/index.js";

const baseUrl = "https://api.hyperliquid.xyz";
describe("HyperliquidFuturesPublicClient", () => {
  describe("getDataForPeriod", () => {
    test("should call HL info endpoint and return transformed results", async () => {
      const symbol = "BTC";
      const timeframe = "1h";
      const startTime = new Date("2025-01-01");
      const endTime = new Date("2025-01-02");

      const mockResponse: HLCandle[] = [
        {
          t: 1640995200000,
          T: 1640998800000,
          s: symbol,
          i: timeframe,
          o: "10000",
          c: "11000",
          h: "12000",
          l: "9000",
          v: "1000",
          n: 10,
        },
      ];

      const fetchSpy = vi.spyOn(FetchClient.prototype, "post");

      fetchSpy.mockResolvedValue(mockResponse);

      const client = new HyperliquidFuturesPublicClient(baseUrl, FetchClient);

      const result = await client.getDataForPeriod({
        symbol,
        timeframe,
        startTime,
        endTime,
      });

      expect(fetchSpy).toHaveBeenCalledWith("info", {
        type: "candleSnapshot",
        req: {
          coin: symbol,
          interval: timeframe,
          startTime: startTime.getTime(),
          endTime: endTime.getTime(),
        },
      });

      const expectedResult: Candle[] = [
        {
          openTime: 1640995200000,
          open: 10000,
          high: 12000,
          low: 9000,
          close: 11000,
          closeTime: 1640998800000,
          volume: 1000,
        },
      ];

      expect(result).toEqual(expectedResult);
    });
  });

  test("should call getSymbols with proper params", async () => {
    const mockResponse = {
      universe: [
        { name: "BTC", isDelisted: false },
        { name: "ETH", isDelisted: false },
        { name: "LTC", isDelisted: true },
      ] as HLSymbol[],
    };

    const fetchSpy = vi.spyOn(FetchClient.prototype, "post");

    fetchSpy.mockResolvedValue(mockResponse);

    const client = new HyperliquidFuturesPublicClient(baseUrl, FetchClient);

    const result = await client.getSymbols();

    expect(fetchSpy).toHaveBeenCalledWith("info", {
      type: "meta",
    });

    expect(result).toEqual(["BTC", "ETH"]);
  });
});
