import { describe, test, expect } from "vitest";
import { average } from "./math.js";

describe("math", () => {
  describe("average", () => {
    test("should calc average correctly", () => {
      expect(average([1, 5])).toBe(3);
    });

    test("should return 0 if empty array provided", () => {
      expect(average([])).toBe(0);
    });
  });
});
