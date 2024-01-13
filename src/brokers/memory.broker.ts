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
    price,
    time,
    ...restPositionPayload
  }: OpenPositionPayload): void | Promise<void> {
    if (this.isInPosition) {
      console.warn(
        "Already have open position. New position can not be open. Position:",
        this.currentPosition
      );
      return;
    }

    this.positionCounter++;

    const newPosition: Position = {
      id: this.positionCounter,
      openTime: time,
      openPrice: price,
      ...restPositionPayload,
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
