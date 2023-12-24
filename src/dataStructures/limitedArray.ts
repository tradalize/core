/**
 * @description Array with limited length. Save the order of the items
 */
export class LimitedArray<T = unknown> extends Array<T> {
	constructor(private limit: number) {
		super();
	}

	pushWithLimit(...items: T[]) {
		this.push(...items);

		if (this.length > this.limit) {
			this.splice(0, this.length - this.limit);
		}
	}
}
