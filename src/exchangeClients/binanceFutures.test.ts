import { beforeEach, describe, expect, test, vi } from "vitest";
import { BinanceFuturesClient, BinanceRawKline } from "./binanceFutures.js";

import type { AxiosStatic } from "axios";

let axiosStaticMock: AxiosStatic;
const axiosGetMock = vi.fn();

describe("Binance futures client", () => {
  beforeEach(() => {
    axiosStaticMock = {
      create: () => ({
        get: axiosGetMock,
      }),
    } as unknown as AxiosStatic;
  });

  describe("getDataForPeriod", () => {
    test("should call api with get method with minimum possible params", async () => {
      axiosGetMock.mockResolvedValueOnce({ data: [] });

      const client = new BinanceFuturesClient(axiosStaticMock);

      const symbol = "BTCUSDT";
      const interval = "1d";

      await client.getDataForPeriod({ symbol, interval });

      expect(axiosGetMock).toHaveBeenCalledWith(
        `/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=1500`,
        {
          timeout: 2000,
        }
      );
    });

    test("should call api with get method with maximum possible params", async () => {
      axiosGetMock.mockResolvedValueOnce({ data: [] });

      const client = new BinanceFuturesClient(axiosStaticMock);

      const symbol = "BTCUSDT";
      const interval = "1d";
      const startTime = new Date("01 01 2020");
      const endTime = new Date("01 01 2021");
      const limit = 100;

      await client.getDataForPeriod({
        symbol,
        interval,
        startTime,
        endTime,
        limit,
      });

      expect(axiosGetMock).toHaveBeenCalledWith(
        `/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}&startTime=${startTime.getTime()}&endTime=${endTime.getTime()}`,
        {
          timeout: 2000,
        }
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

      axiosGetMock.mockResolvedValueOnce({
        data: [
          [
            openTime,
            String(open),
            String(high),
            String(low),
            String(close),
            String(volume),
            closeTime,
          ],
        ] as Partial<BinanceRawKline>[],
      });

      const client = new BinanceFuturesClient(axiosStaticMock);

      const symbol = "BTCUSDT";
      const interval = "1d";

      const result = await client.getDataForPeriod({ symbol, interval });

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
      const openTime = new Date("01 01 2020").getTime();
      const open = 100;
      const high = 150;
      const low = 50;
      const close = 110;
      const volume = 1000;
      const closeTime = new Date("01 02 2020").getTime();

      axiosGetMock.mockRejectedValueOnce(new Error());

      axiosGetMock.mockResolvedValueOnce({
        data: [
          [
            openTime,
            String(open),
            String(high),
            String(low),
            String(close),
            String(volume),
            closeTime,
          ],
        ] as Partial<BinanceRawKline>[],
      });

      const client = new BinanceFuturesClient(axiosStaticMock);

      const symbol = "BTCUSDT";
      const interval = "1d";

      const result = await client.getDataForPeriod({ symbol, interval });

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
      axiosGetMock.mockRejectedValue(new Error("Axios error"));

      const client = new BinanceFuturesClient(axiosStaticMock);

      const symbol = "BTCUSDT";
      const interval = "1d";

      await expect(() =>
        client.getDataForPeriod({ symbol, interval })
      ).rejects.toThrowError("Axios error");
    });
  });

  describe("getExchangeInfo", () => {
    test("should call api endpoint with propper params and return data", async () => {
      const mockReturnData = {
        symbol: "BTCUSDT",
        quoteAsset: "USDT",
        contractType: "PERPETUAL",
      };
      axiosGetMock.mockResolvedValueOnce({ data: [mockReturnData] });

      const client = new BinanceFuturesClient(axiosStaticMock);

      const result = await client.getExchangeInfo();

      expect(axiosGetMock).toHaveBeenCalledWith("/fapi/v1/exchangeInfo", {
        timeout: 2000,
      });
      expect(result).toStrictEqual([mockReturnData]);
    });
  });
});
