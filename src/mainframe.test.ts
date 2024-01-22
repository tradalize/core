import { describe, expect, test, vi } from "vitest";

import { Candle, Datafeed, Mainframe, MainframeProps, Strategy } from "./index";

import { MockBroker } from "./brokers/mocks";

const [candle1, candle2, candle3, candle4, candle5] = new Array(5)
  .fill(0, 0)
  .map(
    (_, index) =>
      ({
        open: index + 1,
        high: index + 1,
        low: index + 1,
        close: index + 1,
        openTime: index + 1,
        closeTime: index + 1,
        volume: index + 1,
      }) as Candle
  );

const secondPartData = [candle4, candle5];

const mockProps: MainframeProps = {
  symbol: "BTCUSDT",
  timeframe: "1d",
} as const;

class TestFeed extends Datafeed {
  public symbol = mockProps.symbol;
  public timeframe = mockProps.timeframe;

  public async loadNextChunk() {
    return secondPartData.splice(0);
  }
}

class TestStrat extends Strategy {
  update = vi.fn();
}

describe("Mainframe", () => {
  test("should iterate over given datafeed and provide each candle to the strategy", async () => {
    const testDf = new TestFeed([candle1, candle2, candle3]);
    const testStrat = new TestStrat(new MockBroker());

    const mf = new Mainframe(testDf, testStrat, mockProps);

    await mf.backtest();

    expect(testStrat.update).toHaveBeenCalledTimes(5);
    expect(testStrat.update).toHaveBeenNthCalledWith(1, candle1, mockProps);
    expect(testStrat.update).toHaveBeenLastCalledWith(candle5, mockProps);
  });
});
