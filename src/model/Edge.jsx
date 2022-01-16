export default class Edge {
	constructor({
		vertexA = null,
		vertexB = null,
		weight = 1,
		selected = false,
		id,
		vertexAId,
		vertexBId,
		vertexATop,
		vertexALeft,
		vertexBTop,
		vertexBLeft
	} = {}) {
		if (vertexA == null || vertexB == null) {
			this.id = id;
			this.vertexAId = vertexAId;
			this.vertexBId = vertexBId;
			this.vertexATop = vertexATop;
			this.vertexALeft = vertexALeft;
			this.vertexBTop = vertexBTop;
			this.vertexBLeft = vertexBLeft;
		} else {
			this.id = `${vertexA.id}&${vertexB.id}`;
			this.vertexAId = vertexA.id;
			this.vertexBId = vertexB.id;
			this.vertexATop = vertexA.top;
			this.vertexALeft = vertexA.left;
			this.vertexBTop = vertexB.top;
			this.vertexBLeft = vertexB.left;
		}

		this.weight = weight;
		this.selected = selected;
		this.onVertexUpdated();
	}

	onVertexUpdated() {
		this.textTop = (this.vertexATop + this.vertexBTop) / 2;
		this.textLeft = (this.vertexALeft + this.vertexBLeft) / 2;
	}

	contains(vertexId) {
		return this.vertexAId === vertexId || this.vertexBId === vertexId;
	}

}