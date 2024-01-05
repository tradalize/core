import { LinkedList } from "../dataStructures/linkedList.js";
import {
  Broker,
  ClosePositionPayload,
  OpenPositionPayload,
  Position,
} from "./broker.abstract.js";

export class MemoryBroker extends Broker {
  public positionsList = new LinkedList<Position>();

  public openPosition(payload: OpenPositionPayload): void | Promise<void> {
    if (this.isInPosition) {
      throw new Error("Already have open position");
    }

    const newPosition: Position = {
      id: "string | number",
      symbol: "String",
      timeframe: "1d",
      direction: payload.direction,
      openTime: payload.time,
      openPrice: payload.price,
    };

    this.positionsList.push(newPosition);
    this.currentPosition = newPosition;
  }

  public closePosition({
    price,
    time,
  }: ClosePositionPayload): void | Promise<void> {
    Object.assign(this.currentPosition, {
      closePrice: price,
      closeTime: time,
    });

    this.currentPosition = null;
  }
}
