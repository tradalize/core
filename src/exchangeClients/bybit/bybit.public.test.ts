import { describe, test, afterEach, vi, expect } from "vitest";
import { FetchClient } from "../../fetchClient/fetchClient";
import { ByBitPublicClient } from "./bybit.public";
import { ByBitKline, ByBitKlineResponse } from "./bybit.types";

const mockByBitKline: ByBitKline = [
  "1", // startTime
  "100", // openPrice
  "150", // highPrice
  "90", // lowPrice
  "110", // closePrice
  "100", // volume
  "0", // turnover
];

const baseUrl = "https://test.com";

describe("ByBitPublicClient", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getDataForPeriod", () => {
    test("should make propper api call and return transformed data", async () => {
      const fetchSpy = vi.spyOn(FetchClient.prototype, "get");

      fetchSpy.mockResolvedValueOnce({
        result: {
          list: [mockByBitKline],
        },
      } as ByBitKlineResponse);

      const client = new ByBitPublicClient(baseUrl, FetchClient);

      const symbol = "BTCUSDT";
      const timeframe = "5m";
      const startTime = new Date("01 01 2020");
      const endTime = new Date("01 01 2021");

      const result = await client.getDataForPeriod({
        symbol,
        timeframe,
        startTime,
        endTime,
      });

      const [openTime, openPrice, highPrice, lowPrice, closePrice, volume] =
        mockByBitKline;

      expect(fetchSpy).toHaveBeenCalledWith(
        `market/kline?category=linear&symbol=${symbol}&interval=5&limit=1000&start=${startTime.getTime()}&end=${endTime.getTime()}`
      );
      expect(result).toStrictEqual([
        {
          openTime: Number(openTime),
          open: Number(openPrice),
          high: Number(highPrice),
          low: Number(lowPrice),
          close: Number(closePrice),
          volume: Number(volume),
          closeTime: 300000,
        },
      ]);
    });
  });

  describe("getSymbols", () => {
    test("should make propper api call and return transformed symbols", async () => {
      const fetchSpy = vi.spyOn(FetchClient.prototype, "get");

      fetchSpy.mockResolvedValueOnce({
        result: {
          list: [
            {
              symbol: "BTCUSDT",
              contractType: "LinearPerpetual",
              quoteCoin: "USDT",
            },
          ],
        },
      });

      const client = new ByBitPublicClient(baseUrl, FetchClient);

      const result = await client.getSymbols();

      expect(fetchSpy).toHaveBeenCalledWith(
        "/market/instruments-info?category=linear&limit=1000"
      );
      expect(result).toStrictEqual(["BTCUSDT"]);
    });
  });
});
