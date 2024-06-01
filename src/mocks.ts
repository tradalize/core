import { AxiosInstance, AxiosStatic } from "axios";
import { vi } from "vitest";

export const mockAxiosClient = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
  interceptors: { request: { use: vi.fn() } },
};

export function getAxiosStatic(mockAxiosClient) {
  return {
    create: () => mockAxiosClient as unknown as AxiosInstance,
  } as AxiosStatic;
}
