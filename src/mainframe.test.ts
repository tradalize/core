import { describe, expect, test, vi } from "vitest";

import { Candle, Datafeed, Mainframe, Strategy } from "./index";

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
      } as Candle)
  );

const secondPartData = [candle4, candle5];

class TestFeed extends Datafeed {
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
    const testStrat = new TestStrat();

    const mf = new Mainframe(testDf, testStrat);

    await mf.start();

    expect(testStrat.update).toHaveBeenCalledTimes(5);
    expect(testStrat.update).toHaveBeenNthCalledWith(1, candle1);
    expect(testStrat.update).toHaveBeenLastCalledWith(candle5);
  });
});
