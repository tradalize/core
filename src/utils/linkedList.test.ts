import { describe, test, expect } from "vitest";
import { LinkedList } from "./linkedList";

describe("Linked list", () => {
  test("should push item to list", () => {
    const linkedList = new LinkedList();

    linkedList.push(1);
    linkedList.push(2);
    linkedList.push(3);

    const head = linkedList.head;
    const secondItem = head.next;
    const therdItem = secondItem.next;

    expect(head.value).toBe(1);
    expect(secondItem.value).toBe(2);
    expect(therdItem.value).toBe(3);
    expect(therdItem.next).toBeNull();
  });

  test("should push array of items in list", () => {
    const testData = [1, 2, 3, 4, 5];

    const linkedList = new LinkedList();

    linkedList.pushBulk(testData);

    let listItem = linkedList.head;
    for (const item of testData) {
      expect(listItem.value).toBe(item);

      listItem = listItem.next;
    }

    expect(linkedList.tail.next).toBeNull();
    expect(listItem).toBeNull();
  });
});
