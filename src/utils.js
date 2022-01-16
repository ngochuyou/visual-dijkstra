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