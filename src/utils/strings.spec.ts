import { describe, test, expect } from "vitest";

import { joinUrl } from "./strings.js";

describe("strings", () => {
  describe("joinUrl", () => {
    test("should join strings with slashes", () => {
      expect(joinUrl("a", "b", "c")).toBe("a/b/c");
    });

    test("should remove leading and trailing slashes", () => {
      expect(joinUrl("/a", "b/", "/c/")).toBe("a/b/c");
    });

    test("should remove empty parts", () => {
      expect(joinUrl("", "a", "", "b", "", "c", "")).toBe("a/b/c");
    });
  });
});
