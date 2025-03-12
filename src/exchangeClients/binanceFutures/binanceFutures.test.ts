import { afterEach, describe, expect, test, vi } from "vitest";
import { FetchClient } from "../../fetchClient/fetchClient.js";
import { BinanceFuturesClient } from "./binanceFutures.js";
import { BinanceRawKline } from "./binance.types.js";

const baseUrl = "https://test.com";
describe("Binance futures client", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getDataForPeriod", () => {
    test("should call api with get method with minimum possible params", async () => {
      const fetchSpy = vi.spyOn(FetchClient.prototype, "get");
      fetchSpy.mockResolvedValueOnce([]);

      const client = new BinanceFuturesClient(baseUrl, FetchClient);

      const symbol = "BTCUSDT";
      const timeframe = "1d";

      await client.getDataForPeriod({ symbol, timeframe });

      expect(fetchSpy).toHaveBeenCalledWith(
        `/klines?symbol=${symbol}&interval=${timeframe}&limit=1500`
      );
    });

    test("should call api with get method with maximum possible params", async () => {
      const fetchSpy = vi.spyOn(FetchClient.prototype, "get");

      fetchSpy.mockResolvedValueOnce([]);

      const client = new BinanceFuturesClient(baseUrl, FetchClient);

      const symbol = "BTCUSDT";
      const timeframe = "1d";
      const startTime = new Date("01 01 2020");
      const endTime = new Date("01 01 2021");
      const limit = 100;

      await client.getDataForPeriod({
        symbol,
        timeframe,
        startTime,
        endTime,
        limit,
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        `/klines?symbol=${symbol}&interval=${timeframe}&limit=${limit}&startTime=${startTime.getTime()}&endTime=${endTime.getTime()}`
      );
    });

    test("should return correctly transformed data", async () => {
      const openTime = new Date("01 01 2020").getTime();
      const open = 100;
      const high = 150;
      const low = 50;
      const close = 110;
      const volume = 1000;
      const closeTime = new Date("01 02 2020").getTime();

      const fetchSpy = vi.spyOn(FetchClient.prototype, "get");

      fetchSpy.mockResolvedValueOnce([
        [
          openTime,
          String(open),
          String(high),
          String(low),
          String(close),
          String(volume),
          closeTime,
        ],
      ] as Partial<BinanceRawKline>[]);

      const client = new BinanceFuturesClient(baseUrl, FetchClient);

      const symbol = "BTCUSDT";
      const timeframe = "1d";

      const result = await client.getDataForPeriod({ symbol, timeframe });

      expect(result).toStrictEqual([
        {
          openTime,
          open,
          high,
          low,
          close,
          volume,
          closeTime,
        },
      ]);
    });

    test("should retry on fail and load data from second attempt", async () => {
      const fetchSpy = vi.spyOn(FetchClient.prototype, "get");

      const openTime = new Date("01 01 2020").getTime();
      const open = 100;
      const high = 150;
      const low = 50;
      const close = 110;
      const volume = 1000;
      const closeTime = new Date("01 02 2020").getTime();

      fetchSpy.mockRejectedValueOnce(new Error());

      fetchSpy.mockResolvedValueOnce([
        [
          openTime,
          String(open),
          String(high),
          String(low),
          String(close),
          String(volume),
          closeTime,
        ],
      ] as Partial<BinanceRawKline>[]);

      const client = new BinanceFuturesClient(baseUrl, FetchClient);

      const symbol = "BTCUSDT";
      const timeframe = "1d";

      const result = await client.getDataForPeriod({ symbol, timeframe });

      expect(result).toStrictEqual([
        {
          openTime,
          open,
          high,
          low,
          close,
          volume,
          closeTime,
        },
      ]);
    });

    test("should fail on >5 attempts to load data", async () => {
      const fetchSpy = vi.spyOn(FetchClient.prototype, "get");

      fetchSpy.mockRejectedValue(new Error("Fetch error"));

      const client = new BinanceFuturesClient(baseUrl, FetchClient);

      const symbol = "BTCUSDT";
      const timeframe = "1d";

      await expect(
        client.getDataForPeriod({ symbol, timeframe })
      ).rejects.toThrowError("Fetch error");
    });
  });

  describe("getSymbols", () => {
    test("should call api endpoint with propper params and return data", async () => {
      const fetchSpy = vi.spyOn(FetchClient.prototype, "get");

      const mockReturnData = {
        symbol: "BTCUSDT",
        quoteAsset: "USDT",
        contractType: "PERPETUAL",
      };
      fetchSpy.mockResolvedValueOnce({ symbols: [mockReturnData] });

      const client = new BinanceFuturesClient(baseUrl, FetchClient);

      const result = await client.getSymbols();

      const expectedResult = [mockReturnData.symbol];

      expect(fetchSpy).toHaveBeenCalledWith("/exchangeInfo");
      expect(result).toStrictEqual(expectedResult);
    });
  });
});
