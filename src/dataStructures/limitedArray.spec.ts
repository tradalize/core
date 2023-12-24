import { describe, test, expect } from "vitest";
import { LimitedArray } from "./limitedArray.js";

describe("Limited array", () => {
	test("should remove first array item if reached limit", () => {
		const limit = 3;
		const testArray = new LimitedArray<number>(limit);

		testArray.pushWithLimit(0, 1, 2);

		testArray.pushWithLimit(3);

		expect(testArray.length).toBe(limit);
		expect([...testArray]).toStrictEqual([1, 2, 3]);
	});

	test("should return correct items on slice", () => {
		const limArr = new LimitedArray(5);

		limArr.push(1, 2, 3, 4, 5);

		expect([...limArr.slice(-5, -2)]).toEqual([1, 2, 3]);
		expect([...limArr.slice(-2)]).toEqual([4, 5]);
		expect([...limArr]).toEqual([1, 2, 3, 4, 5]);
	});
});
