import { describe, expect, test } from "vitest";
import { MemoryBroker } from "./memory.broker";

describe("Memory broker", () => {
  test("should open and close position and keep it in the list", () => {
    const broker = new MemoryBroker();

    broker.openPosition({ price: 123, direction: 1, time: 100 });
    broker.closePosition({ price: 456, time: 200 });

    broker.openPosition({ price: 234, direction: -1, time: 200 });
    broker.closePosition({ price: 567, time: 300 });

    expect(broker.positionsList.head?.value).toMatchObject({
      direction: 1,
      openTime: 100,
      openPrice: 123,
      closePrice: 456,
      closeTime: 200,
    });

    expect(broker.positionsList.tail?.value).toMatchObject({
      direction: -1,
      openTime: 200,
      openPrice: 234,
      closePrice: 567,
      closeTime: 300,
    });

    expect(broker.currentPosition).toBeNull();
  });

  test("should throw on attempt to open new position when current is not closed", () => {
    const broker = new MemoryBroker();

    broker.openPosition({ price: 123, direction: 1, time: 100 });

    expect(() =>
      broker.openPosition({ price: 123, direction: 1, time: 100 })
    ).toThrow("Already have open position");
  });
});
