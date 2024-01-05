import { LinkedList } from "../dataStructures/linkedList.js";
import {
  Broker,
  ClosePositionPayload,
  OpenPositionPayload,
  Position,
} from "./broker.abstract.js";

export class MemoryBroker extends Broker {
  public positionsList = new LinkedList<Position>();

  private positionCounter = 0;

  public openPosition({
    symbol,
    timeframe,
    price,
    time,
    direction,
  }: OpenPositionPayload): void | Promise<void> {
    if (this.isInPosition) {
      throw new Error("Already have open position");
    }

    this.positionCounter++;

    const newPosition: Position = {
      id: this.positionCounter,
      symbol,
      timeframe,
      direction,
      openTime: time,
      openPrice: price,
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
