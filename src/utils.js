export const I = Infinity;

export const asIf = (predicate = false) => new AsIf(predicate);

class AsIf {
	#predicate;
	#callbackWhenTrue;

	constructor(predicate = false) {
		this.predicate = predicate;
	}

	then(callback = () => null) {
		this.callbackWhenTrue = callback;
		
		return this;
	}

	else(callback = () => null) {
		if (this.predicate) {
			return this.callbackWhenTrue(this.predicate);
		}

		return callback(this.predicate);
	}
}

export const hasLength = (payload = null) => payload != null && payload.length !== 0;

export const linear = (list = [], propName = null, value = null, producer = null) => {
	const comparator = propName != null ? (ele) => ele[propName] === value : (ele) => ele === value;
	let n = list.length;

	for (let i = 0; i < n; i++) {
		if (comparator(list[i])) {
			return producer == null ? list[i] : producer(list[i], i);
		}
	}

	return null;
}

export const isBool = (payload) => typeof payload === 'boolean';

export const atom = (array, identifier = "id") => {
	const keyMapper = hasLength(identifier) ?
		ele => ele[identifier] :
		ele => ele;
		
	return Object.fromEntries(array.map(ele => [keyMapper(ele), ele]));
};

export const spread = (max = 0, value = {}) => [...Array(max)].map(ele => value);

export const isEmpty = (obj = {}) => {
	for (let i in obj) {
		return false;
	}

	return true;
}

export const flip = (obj) => Object.fromEntries(Object.entries(obj).map(([key, val]) => [val, key]));

class Node {
	constructor(data) {
		this.data = data;
		this.nextNode = null;
	}

	chain(nextNode) {
		this.nextNode = nextNode;
		return this;
	}

	next() {
		return this.nextNode;
	}

}

export class Stack {
	#head = null;

	push(data) {
		this.head = new Node(data).chain(this.head);
		return this;		
	}

	map(mapper) {
		let product = [];
		let cursor = this.head;

		while (cursor != null) {
			product = [...product, mapper(cursor.data)];
			cursor = cursor.next();
		}

		if (product.length === 1) {
			return [];
		}

		return product;
	}
}