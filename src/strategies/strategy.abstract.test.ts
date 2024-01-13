import { describe, expect, test, vi } from "vitest";
import { MockBroker } from "../brokers/mocks";
import { Strategy } from "./strategy.abstract";
import { Candle } from "../datafeeds";
import {
  Broker,
  POSITION_DIRECTION,
  Position,
  PositionDirection,
} from "../brokers";

class MockStrategy extends Strategy {
  constructor(
    broker: Broker,
    protected openOnNext: PositionDirection | null = null,
    protected closeOnNext = false
  ) {
    super(broker);
  }

  public update = vi.fn();
}

const symbol = "BTCUSDT";
const timeframe = "1d";

const mockCandle: Candle = {
  openTime: new Date("01 01 2020").getTime(),
  open: 100,
  high: 150,
  low: 50,
  close: 110,
  closeTime: new Date("01 02 2020").getTime(),
  volume: 1000,
};

describe("Strategy abstract", () => {
  describe("onBeforeUpdate", () => {
    test("should call propper methods with propper params", async () => {
      const mockBroker = new MockBroker();
      const strat = new MockStrategy(mockBroker);

      const openSpy = vi.spyOn(strat, "checkOpenOnNext");
      const closeSpy = vi.spyOn(strat, "checkCloseOnNext");

      await strat.onBeforeUpdate(symbol, timeframe, mockCandle);

      expect(openSpy).toHaveBeenCalledWith(symbol, timeframe, mockCandle);
      expect(closeSpy).toHaveBeenCalledWith(mockCandle);
    });

    test("should close long position if candle low lower than sl", async () => {
      const mockBroker = new MockBroker();

      mockBroker.currentPosition = {
        direction: POSITION_DIRECTION.Long,
        sl: 60,
      } as Position;

      const strat = new MockStrategy(mockBroker);

      await strat.onBeforeUpdate(symbol, timeframe, mockCandle);

      expect(mockBroker.closePosition).toHaveBeenCalledWith({
        price: 60,
        time: mockCandle.closeTime,
      });
    });

    test("should close short position if candle high higher than sl", async () => {
      const mockBroker = new MockBroker();

      mockBroker.currentPosition = {
        direction: POSITION_DIRECTION.Short,
        sl: 130,
      } as Position;

      const strat = new MockStrategy(mockBroker);

      await strat.onBeforeUpdate(symbol, timeframe, mockCandle);

      expect(mockBroker.closePosition).toHaveBeenCalledWith({
        price: 130,
        time: mockCandle.closeTime,
      });
    });

    test("should close long position if candle high higher than tp", async () => {
      const mockBroker = new MockBroker();

      mockBroker.currentPosition = {
        direction: POSITION_DIRECTION.Long,
        tp: 130,
      } as Position;

      const strat = new MockStrategy(mockBroker);

      await strat.onBeforeUpdate(symbol, timeframe, mockCandle);

      expect(mockBroker.closePosition).toHaveBeenCalledWith({
        price: 130,
        time: mockCandle.closeTime,
      });
    });

    test("should close short position if candle low lower than tp", async () => {
      const mockBroker = new MockBroker();

      mockBroker.currentPosition = {
        direction: POSITION_DIRECTION.Short,
        tp: 60,
      } as Position;

      const strat = new MockStrategy(mockBroker);

      await strat.onBeforeUpdate(symbol, timeframe, mockCandle);

      expect(mockBroker.closePosition).toHaveBeenCalledWith({
        price: 60,
        time: mockCandle.closeTime,
      });
    });
  });

  describe("checkOpenOnNext", () => {
    test("should not call brokers openPosition method if openOnNext is null", async () => {
      const mockBroker = new MockBroker();

      const strat = new MockStrategy(mockBroker, null);

      await strat.checkOpenOnNext(symbol, timeframe, mockCandle);

      expect(mockBroker.openPosition).not.toHaveBeenCalled();
    });

    test("should call brokers openPosition method if openOnNext is set", async () => {
      const mockBroker = new MockBroker();

      const strat = new MockStrategy(mockBroker, 1);

      await strat.checkOpenOnNext(symbol, timeframe, mockCandle);

      expect(mockBroker.openPosition).toHaveBeenCalledWith({
        symbol,
        timeframe,
        direction: 1,
        price: mockCandle.open,
        time: mockCandle.openTime,
      });
    });
  });

  describe("checkCloseOnNext", () => {
    test("should not call brokers closePosition method if closeOnNext is false", async () => {
      const mockBroker = new MockBroker();

      const strat = new MockStrategy(mockBroker, null, false);

      await strat.checkCloseOnNext(mockCandle);

      expect(mockBroker.closePosition).not.toHaveBeenCalled();
    });

    test("should not call brokers closePosition method if closeOnNext is true but no current position", async () => {
      const mockBroker = new MockBroker();

      const strat = new MockStrategy(mockBroker, null, true);

      await strat.checkCloseOnNext(mockCandle);

      expect(mockBroker.closePosition).not.toHaveBeenCalled();
    });

    test("should call brokers closePosition method if closeOnNext is true and current position exists", async () => {
      const mockBroker = new MockBroker();

      mockBroker.currentPosition = {} as Position;
      const strat = new MockStrategy(mockBroker, null, true);

      await strat.checkCloseOnNext(mockCandle);

      expect(mockBroker.closePosition).toHaveBeenCalledWith({
        price: mockCandle.open,
        time: mockCandle.openTime,
      });
    });
  });
});
