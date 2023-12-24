class ListNode<T> {
	public next: ListNode<T> | null = null;

	constructor(public value: T) {}
}

export class LinkedList<T> {
	public head: ListNode<T> | null = null;
	public tail: ListNode<T> | null = null;

	/**
	 *
	 * @description Push new item in the end of the list
	 */
	public push(value: T): boolean {
		const newNode = new ListNode<T>(value);

		if (!this.head) {
			this.head = newNode;
			return true;
		}

		if (!this.tail) {
			this.tail = newNode;
			this.head.next = newNode;
			return true;
		}

		this.tail.next = newNode;
		this.tail = newNode;

		return true;
	}

	public pushBulk(values: T[]) {
		for (const value of values) {
			this.push(value);
		}
	}

	/**
	 * @description Remove first item from list and return it.
	 */
	public shift() {
		const prevHead = this.head;

		if (!prevHead) {
			return null;
		}

		if (prevHead.next === this.tail) {
			this.tail = null;
		}

		this.head = prevHead.next;

		return prevHead.value;
	}
}
