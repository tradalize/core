import { describe, test, expect } from "vitest";
import { average } from "./math.js";

describe("math", () => {
  describe("average", () => {
    test("should calc average correctly", () => {
      expect(average([1, 5])).toBe(3);
    });
  });
});
