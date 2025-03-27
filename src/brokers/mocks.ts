import { vi } from "vitest";
import { Broker } from "./broker.abstract.js";
import type { Position } from "../interface.js";

export class MockBroker extends Broker {
  public currentPosition: Position | null = null;

  public openPosition = vi.fn();

  public closePosition = vi.fn();
}
