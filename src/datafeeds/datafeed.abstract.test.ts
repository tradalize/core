import { describe, expect, test } from "vitest";
import { Datafeed } from ".";

const testArray = [4, 5];

class TestDatafeed extends Datafeed<number> {
	constructor() {
		super([1, 2, 3]);
	}

	public async loadNextChunk() {
		return testArray.splice(0);
	}
}

describe("Datafeed abstract", () => {
	test("should iterate over given list item by item", async () => {
		const testDatafeed = new TestDatafeed();

		const resultArray: number[] = [];

		while (!testDatafeed.isLast) {
			const next = await testDatafeed.next();

			resultArray.push(next);
		}

		expect(resultArray).toStrictEqual([1, 2, 3, 4, 5]);
	});
});
