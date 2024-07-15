import { describe, test, beforeEach, vi, expect } from "vitest";
import { ByBitPublicClient } from "./bybit.public";
import { AxiosResponse, AxiosStatic } from "axios";
import { ByBitKline, ByBitKlineResponse } from "./bybit.types";

let axiosStaticMock: AxiosStatic;
const axiosGetMock = vi.fn();

const mockByBitKline: ByBitKline = [
  new Date("01 01 2020").getTime().toString(), // startTime
  "100", // openPrice
  "150", // highPrice
  "90", // lowPrice
  "110", // closePrice
  "100", // volume
  "0", // turnover
];

describe("ByBitPublicClient", () => {
  beforeEach(() => {
    axiosStaticMock = {
      create: () => ({
        get: axiosGetMock,
      }),
    } as unknown as AxiosStatic;
  });

  describe("getDataForPeriod", () => {
    test("should make propper api call and return transformed data", async () => {
      axiosGetMock.mockResolvedValueOnce({
        data: {
          result: {
            list: [mockByBitKline],
          },
        },
      } as AxiosResponse<ByBitKlineResponse>);

      const client = new ByBitPublicClient(axiosStaticMock);

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

      expect(axiosGetMock).toHaveBeenCalledWith(
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
          closeTime: 1577829899999,
        },
      ]);
    });
  });
});
