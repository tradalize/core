import { describe, test, expect } from "bun:test";
import {
  generateTimeframeTrees,
  milisendsToDuration,
} from "./timeFormatters.js";
import { TIMEFRAME } from "../exchangeClients/types.js";

describe("timeFormatters", () => {
  describe("milisendsToDuration", () => {
    test("should return '-' when the input is undefined", () => {
      expect(milisendsToDuration(undefined)).toBe("-");
    });

    test("should return only minutes when the duration is less than an hour", () => {
      expect(milisendsToDuration(30 * 60 * 1000)).toBe("30m"); // 30 minutes
    });

    test("should return hours and minutes when the duration is less than a day", () => {
      expect(milisendsToDuration(2 * 60 * 60 * 1000 + 15 * 60 * 1000)).toBe(
        "2h 15m"
      ); // 2 hours 15 minutes
    });

    test("should return days, hours, and minutes when the duration is more than a day", () => {
      expect(
        milisendsToDuration(
          1 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 45 * 60 * 1000
        )
      ).toBe("1d 3h 45m"); // 1 day 3 hours 45 minutes
    });

    test("should handle edge cases like exactly one hour or one day", () => {
      expect(milisendsToDuration(60 * 60 * 1000)).toBe("1h 0m"); // Exactly 1 hour
      expect(milisendsToDuration(24 * 60 * 60 * 1000)).toBe("1d 0h 0m"); // Exactly 1 day
    });
  });

  describe("generateTimeframeTrees", () => {
    test("should generate a single-level tree when only one timeframe is provided", () => {
      const startTime = new Date("2025-01-01");
      const endTime = new Date("2025-01-03");
      const timeframes = [TIMEFRAME.OneDay];

      const result = generateTimeframeTrees(timeframes, startTime, endTime);

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        timeframe: TIMEFRAME.OneDay,
        time: startTime.getTime(),
      });
    });

    test("should generate a multi-level tree when multiple timeframes are provided", () => {
      const startTime = new Date("2023-01-01");
      const endTime = new Date("2023-01-02");
      const timeframes = [TIMEFRAME.OneHour, TIMEFRAME.OneDay];

      const result = generateTimeframeTrees(timeframes, startTime, endTime);

      expect(result.length).toBe(1); // 1 day
      expect(result[0].children?.length).toBe(24); // 24 hours in a day
    });

    test("should correctly calculate intervals based on the timeframe", () => {
      const startTime = new Date("2025-01-01T00:00:00Z");
      const endTime = new Date("2025-01-01T00:15:00Z");
      const timeframes = [TIMEFRAME.FiveMinutes];

      const result = generateTimeframeTrees(timeframes, startTime, endTime);

      expect(result.length).toBe(3); // 15 minutes divided into 5-minute intervals
      expect(result[0].time).toBe(startTime.getTime());
      expect(result[1].time).toBe(startTime.getTime() + 5 * 60 * 1000);
    });

    test("should return an empty tree when the timeframe range is invalid", () => {
      const startTime = new Date("2025-01-01T01:00:00Z");
      const endTime = new Date("2024-01-01T00:00:00Z");
      const timeframes = [TIMEFRAME.OneMinute];

      const result = generateTimeframeTrees(timeframes, startTime, endTime);

      expect(result).toEqual([]);
    });
  });
});
