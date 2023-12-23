import { describe, test, expect } from "vitest";
import { LinkedList } from "./linkedList";

describe("Linked list", () => {
	describe("push", () => {
		test("should push item to list", () => {
			const linkedList = new LinkedList();

			linkedList.push(1);
			linkedList.push(2);
			linkedList.push(3);

			const head = linkedList.head;
			const secondItem = head?.next;
			const therdItem = secondItem?.next;

			expect(head?.value).toBe(1);
			expect(secondItem?.value).toBe(2);
			expect(therdItem?.value).toBe(3);
			expect(therdItem?.next).toBeNull();
		});

		test("should push array of items in list", () => {
			const testData = [1, 2, 3, 4, 5];

			const linkedList = new LinkedList<number>();

			linkedList.pushBulk(testData);

			let listItem = linkedList.head;
			for (const item of testData) {
				expect(listItem?.value).toBe(item);

				listItem = listItem?.next ?? null;
			}

			expect(linkedList?.tail?.next).toBeNull();
			expect(listItem).toBeNull();
		});
	});

	describe("shift", () => {
		test("should remove first imet from list and return", () => {
			const list = new LinkedList();

			list.pushBulk([1, 2]);

			const shiftedItem = list.shift();

			expect(shiftedItem).toBe(1);
			expect(list?.head?.value).toBe(2);
			expect(list.tail).toBeNull();
		});

		test("should work with objects", () => {
			const testItem1 = { test: 1 };
			const testItem2 = { test2: 2 };

			const list = new LinkedList();

			list.pushBulk([testItem1, testItem2]);

			const shiftedItem = list.shift();

			expect(shiftedItem).toBe(testItem1);
			expect(list?.head?.value).toBe(testItem2);
			expect(list.tail).toBeNull();
		});
	});
});
