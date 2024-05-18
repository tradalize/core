import { describe, expect, test } from "vitest";
import { FXOpenClient } from "./fxOpen.js";
import { mockAxiosClient, getAxiosStatic } from "../mocks.js";
import { FXOpenBar, FXOpenPosition } from "./fxOpen.types.js";
import { HttpStatusCode } from "axios";

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

const mockFxOpenPositions: FXOpenPosition[] = [
  {
    Id: 0,
    Symbol: "EURUSD",
    LongAmount: 1,
    LongPrice: 0,
    ShortAmount: 0,
    ShortPrice: 0,
    Commission: 0,
    AgentCommission: 0,
    Swap: 0,
    Modified: 1713807621839,
    Margin: 0,
    Profit: 0,
    CurrentBestAsk: 0,
    CurrentBestBid: 0,
    TransferringCoefficient: 0,
    Created: 1713807621839,
  },
];

describe("fxOpen client", () => {
  describe("getDataForPeriod", () => {
    test("should call FXOpen API with propper params and return transformed value", async () => {
      const client = new FXOpenClient(
        fxOpenClientParams,
        getAxiosStatic(mockAxiosClient)
      );

      mockAxiosClient.get.mockResolvedValueOnce({
        data: { Bars: mockFxOpenBars },
      });

      const symbol = "EURUSD";
      const timeframe = "M5";
      const startFrom = Date.now();
      const limit = -10;

      const result = await client.getDataForPeriod(
        symbol,
        timeframe,
        startFrom,
        limit
      );

      expect(mockAxiosClient.get).toHaveBeenCalledWith(
        `api/v2/quotehistory/${symbol}/${timeframe}/bars/ask?timestamp=${startFrom}&count=${limit}`
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

  describe("getOpenPositions", () => {
    test("should return transformed positions", async () => {
      const client = new FXOpenClient(
        fxOpenClientParams,
        getAxiosStatic(mockAxiosClient)
      );

      mockAxiosClient.get.mockResolvedValueOnce({
        data: mockFxOpenPositions,
      });

      const result = await client.getOpenPositions();

      expect(mockAxiosClient.get).toHaveBeenCalledWith("api/v2/position");
      expect(result).toStrictEqual([
        {
          id: 0,
          symbol: "EURUSD",
          openTime: 1713807621839,
          openPrice: 0,
          direction: 1,
          fee: 0,
          profit: 0,
        },
      ]);
    });
  });

  describe("getPosition", () => {
    test("should return transformed position", async () => {
      const client = new FXOpenClient(
        fxOpenClientParams,
        getAxiosStatic(mockAxiosClient)
      );

      mockAxiosClient.get.mockResolvedValueOnce({
        data: mockFxOpenPositions[0],
      });

      const result = await client.getPosition(0);

      expect(result).toStrictEqual({
        direction: 1,
        fee: 0,
        id: 0,
        openPrice: 0,
        openTime: 1713807621839,
        profit: 0,
        symbol: "EURUSD",
      });
    });

    test("should return undefined if position not found", async () => {
      const client = new FXOpenClient(
        fxOpenClientParams,
        getAxiosStatic(mockAxiosClient)
      );

      mockAxiosClient.get.mockRejectedValueOnce({
        status: HttpStatusCode.NotFound,
      });

      const result = await client.getPosition(0);

      expect(result).toBeUndefined();
    });
  });

  describe("getAccountInfo", () => {
    test("should return account info", async () => {
      const client = new FXOpenClient(
        fxOpenClientParams,
        getAxiosStatic(mockAxiosClient)
      );

      mockAxiosClient.get.mockResolvedValueOnce({
        data: { Id: 0, Leverage: 10, Balance: 10 },
      });

      const result = await client.getAccountInfo();

      expect(result).toStrictEqual({
        id: 0,
        leverage: 10,
        balance: 10,
      });
    });
  });
});
