import { v4 } from 'uuid';

const UNKNOWN = "UNKNOWN";

export default class Vertex {
	constructor({
		id = v4(),
		top = 100,
		left = 100,
		name = UNKNOWN,
		selected = false
	}) {
		this.id = id;
		this.top = top;
		this.left = left;
		this.name = name;
		this.selected = selected;
	}

}