import { describe, expect, test } from "vitest";
import { FXOpenClient } from "./fxOpen.js";
import { mockAxiosClient, getAxiosStatic } from "../mocks.js";
import {
  CancelFXOpenTradePayload,
  CreateFXOpenTradePayload,
  FXOpenBar,
  FXOpenPosition,
  FXOpenTrade,
} from "./fxOpen.types.js";
import { HttpStatusCode } from "axios";
import { POSITION_DIRECTION } from "../brokers/broker.abstract.js";

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

const mockFxOpenPosition: FXOpenPosition = {
  Id: 0,
  Symbol: "EURUSD",
  LongAmount: 1,
  LongPrice: 0,
  ShortAmount: 0,
  ShortPrice: 0,
  Commission: 0.1,
  AgentCommission: 0,
  Swap: 0,
  Modified: 1713807621839,
  Margin: 0,
  Profit: 0,
  CurrentBestAsk: 0,
  CurrentBestBid: 0,
  TransferringCoefficient: 0,
  Created: 1713807621839,
};

const mockFxOpenTrade: Partial<FXOpenTrade> = {
  Id: 1,
  Side: "Buy",
  Symbol: "EURUSD",
  Price: 100,
  Filled: 123,
  FilledAmount: 1,
};

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
        `/quotehistory/${symbol}/${timeframe}/bars/ask?timestamp=${startFrom}&count=${limit}`
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
        data: [mockFxOpenPosition],
      });

      const result = await client.getOpenPositions();

      expect(mockAxiosClient.get).toHaveBeenCalledWith("/position");
      expect(result).toStrictEqual([
        {
          id: mockFxOpenPosition.Id,
          symbol: mockFxOpenPosition.Symbol,
          openTime: mockFxOpenPosition.Modified,
          openPrice: mockFxOpenPosition.LongPrice,
          direction: POSITION_DIRECTION.Long,
          fee: mockFxOpenPosition.Commission,
          profit: mockFxOpenPosition.Profit,
          ammount: mockFxOpenPosition.LongAmount,
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
        data: mockFxOpenPosition,
      });

      const result = await client.getPosition(0);

      expect(result).toStrictEqual({
        id: mockFxOpenPosition.Id,
        symbol: mockFxOpenPosition.Symbol,
        openTime: mockFxOpenPosition.Modified,
        openPrice: mockFxOpenPosition.LongPrice,
        direction: POSITION_DIRECTION.Long,
        fee: mockFxOpenPosition.Commission,
        profit: mockFxOpenPosition.Profit,
        ammount: mockFxOpenPosition.LongAmount,
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

      expect(mockAxiosClient.get).toBeCalledWith("/account");
      expect(result).toStrictEqual({
        id: 0,
        leverage: 10,
        balance: 10,
      });
    });
  });

  describe("createTrade", () => {
    test("should create trade and return it", async () => {
      const client = new FXOpenClient(
        fxOpenClientParams,
        getAxiosStatic(mockAxiosClient)
      );

      mockAxiosClient.post.mockResolvedValueOnce({
        data: mockFxOpenTrade,
      });

      const payload: CreateFXOpenTradePayload = {
        Side: "Buy",
        Symbol: "EURUSD",
        Type: "Market",
        Amount: 0.1,
      };

      const result = await client.createTrade(payload);

      expect(mockAxiosClient.post).toBeCalledWith("/trade", payload);
      expect(result).toStrictEqual({
        id: mockFxOpenTrade.Id,
        ammount: mockFxOpenTrade.FilledAmount,
        direction: POSITION_DIRECTION.Long,
        openPrice: mockFxOpenTrade.Price,
        openTime: mockFxOpenTrade.Filled,
        symbol: mockFxOpenTrade.Symbol,
      });
    });
  });

  describe("cancelTrade", () => {
    test("should cancel the given trade", async () => {
      const client = new FXOpenClient(
        fxOpenClientParams,
        getAxiosStatic(mockAxiosClient)
      );

      mockAxiosClient.delete.mockResolvedValueOnce({
        data: { Trade: mockFxOpenTrade },
      });

      const payload: CancelFXOpenTradePayload = {
        Type: "Cancel",
        Id: 123,
      };

      const result = await client.cancelTrade(payload);

      expect(mockAxiosClient.delete).toBeCalledWith(
        `/trade?trade.type=${payload.Type}&trade.id=${payload.Id}`
      );
      expect(result).toStrictEqual({
        id: mockFxOpenTrade.Id,
        ammount: mockFxOpenTrade.FilledAmount,
        direction: POSITION_DIRECTION.Long,
        openPrice: mockFxOpenTrade.Price,
        openTime: mockFxOpenTrade.Filled,
        symbol: mockFxOpenTrade.Symbol,
      });
    });
  });
});
