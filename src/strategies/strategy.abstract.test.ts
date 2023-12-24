import { describe, expect, test, vi } from "vitest";
import { MockBroker } from "../brokers/mocks";
import { Strategy } from "./strategy.abstract";
import { Candle } from "../datafeeds";
import { Broker, Position, PositionDirection } from "../brokers";

const mockBroker = new MockBroker();

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
      const strat = new MockStrategy(mockBroker);

      const openSpy = vi.spyOn(strat, "checkOpenOnNext");
      const closeSpy = vi.spyOn(strat, "checkCloseOnNext");

      await strat.onBeforeUpdate(mockCandle);

      expect(openSpy).toHaveBeenCalledWith(mockCandle);
      expect(closeSpy).toHaveBeenCalledWith(mockCandle);
    });
  });

  describe("checkOpenOnNext", () => {
    test("should not call brokers openPosition method if openOnNext is null", async () => {
      const strat = new MockStrategy(mockBroker, null);

      await strat.checkOpenOnNext(mockCandle);

      expect(mockBroker.openPosition).not.toHaveBeenCalled();
    });

    test("should call brokers openPosition method if openOnNext is set", async () => {
      const strat = new MockStrategy(mockBroker, 1);

      await strat.checkOpenOnNext(mockCandle);

      expect(mockBroker.openPosition).toHaveBeenCalledWith({
        direction: 1,
        price: mockCandle.open,
        time: mockCandle.openTime,
      });
    });
  });

  describe("checkCloseOnNext", () => {
    test("should not call brokers closePosition method if closeOnNext is false", async () => {
      const strat = new MockStrategy(mockBroker, null, false);

      await strat.checkCloseOnNext(mockCandle);

      expect(mockBroker.closePosition).not.toHaveBeenCalled();
    });

    test("should not call brokers closePosition method if closeOnNext is true but no current position", async () => {
      const strat = new MockStrategy(mockBroker, null, true);

      await strat.checkCloseOnNext(mockCandle);

      expect(mockBroker.closePosition).not.toHaveBeenCalled();
    });

    test("should call brokers closePosition method if closeOnNext is true and current position exists", async () => {
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
