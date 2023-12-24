import { vi } from "vitest";
import { Broker, Position } from "./broker.abstract.js";

export class MockBroker extends Broker {
  public currentPosition: Position | null = null;

  public openPosition = vi.fn();

  public closePosition = vi.fn();
}
