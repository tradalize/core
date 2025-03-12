import { describe, test, expect, vi, beforeEach } from "vitest";
import { FetchClient } from "./fetchClient.js";

// TODO: Add tests for FetchClient
describe.skip("FetchClient", () => {
  const baseUrl = "https://api.example.com";
  const fetchClient = new FetchClient(baseUrl);

  beforeEach(() => {
    global.fetch = vi.fn() as never;
  });

  describe("create", () => {
    test("should return a new FetchClient instance", () => {
      const newBaseUrl = "https://api.example2.com";
      const newFetchClient = FetchClient.create(newBaseUrl);

      expect(newFetchClient).toBeInstanceOf(FetchClient);
      expect(newFetchClient).not.toBe(fetchClient);
      expect(newFetchClient.baseUrl).toBe(newBaseUrl);
    });
  });

  describe("get", () => {
    test("should call fetch with the correct URL", async () => {
      const endpoint = "/data";
      const responseData = { key: "value" };

      // (global.fetch as Mock).mockResolvedValue({
      //   json: vi.fn().mockResolvedValue(responseData),
      // });

      const result = await fetchClient.get(endpoint);

      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}${endpoint}`);
      expect(result).toEqual(responseData);
    });
  });

  describe("post", () => {
    test("should call fetch with the correct URL and body", async () => {
      const endpoint = "/data";
      const requestBody = { name: "test" };
      const responseData = { success: true };
      // (global.fetch as Mock).mockResolvedValue({
      //   json: vi.fn().mockResolvedValue(responseData),
      // });

      const result = await fetchClient.post(endpoint, requestBody);

      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}${endpoint}`, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      expect(result).toEqual(responseData);
    });
  });
});
