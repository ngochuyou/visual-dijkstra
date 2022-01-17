import {
	createContext, useContext, useCallback
} from 'react';

import { useDispatch } from './utils-hooks';

import { spread, isEmpty, flip } from '../utils';

const DijkstraContext = createContext({});

export const useDijkstra = () => useContext(DijkstraContext);

const I = Infinity;

const STORE = {
	vertexMap: {
		"a": 0,
		"b": 1,
		"c": 2,
		"d": 3,
		"e": 4,
	},
	neighbors: [
		[Infinity, 1, 5, 2, Infinity],
		[1, Infinity, Infinity, 2, 3],
		[5, Infinity, Infinity, 1, 1],
		[2, 2, 1, Infinity, 7],
		[Infinity, 3, 1, 7, Infinity]
	],
	start: -1,
	shortestPath: {},
	unvisited: {},
	visited: {},
	prev: {}
};

const ADD_VERTEX = "ADD_VERTEX";
const SET_WEIGHT = "SET_WEIGHT";
const DEL_VERTEX = "DEL_VERTEX";
const RUN = "RUN";

export default function DijkstraContextProvider({ children }) {
	const [store, dispatch] = useDispatch({ ...STORE }, dispatchers);

	const addVertex = useCallback((vertex) => {
		if (vertex == null) {
			return;
		}

		dispatch({
			type: ADD_VERTEX,
			payload: vertex
		});
	}, [dispatch]);

	const setWeight = useCallback((edge) => {
		if (edge == null) {
			return;
		}

		dispatch({
			type: SET_WEIGHT,
			payload: edge
		});
	}, [dispatch]);

	const deleteVertex = useCallback((vertex) => {
		if (vertex == null) {
			return;
		}

		dispatch({
			type: DEL_VERTEX,
			payload: vertex
		});
	}, [dispatch]);

	const run = useCallback((start = 0) => dispatch({
		type: RUN,
		payload: start
	}), [dispatch]);

	return <DijkstraContext.Provider value={{
		store, addVertex, setWeight,
		deleteVertex, run
	}}>
		{ children }
	</DijkstraContext.Provider>;
}

const dispatchers = {
	[RUN]: (payload, oldState) => {
		const { vertexMap, neighbors } = oldState;
		const flippedVertexMap = flip(vertexMap);
		let start = payload;
		let shortestPath = Object.fromEntries(Object.entries(vertexMap).map(([key, val]) => val !== start ? [key, I] : [key, 0]));
		let unvisited = Object.fromEntries(Object.values(vertexMap).map(ele => [ele, true]));
		let prev = {
			[start]: null
		};
		let visited = {};
		let s, c;

		while (!isEmpty(unvisited)) {
			if (start === -1) {
				break;
			}

			for (let i of neighbors[start].keys()) {
				if (neighbors[start][i] !== I && unvisited[i] === true) {
					s = shortestPath[flippedVertexMap[i]];
					c = shortestPath[flippedVertexMap[start]] + neighbors[start][i];

					if (c < s) {
						shortestPath[flippedVertexMap[i]] = c;
						prev[i] = flippedVertexMap[start];
					}
				}
			}

			visited[start] = true;
			delete unvisited[start];

			start = +Object.keys(unvisited).reduce(([minIndex, minValue], current) => {
				if (shortestPath[flippedVertexMap[current]] < minValue) {
					return [current, shortestPath[flippedVertexMap[current]]];
				}

				return [minIndex, minValue];
			}, [-1, Infinity])[0];
		}
		
		return {
			...oldState,
			start,
			shortestPath,
			unvisited,
			visited,
			prev
		};
	},
	[DEL_VERTEX]: (payload, oldState) => {
		const { vertexMap, neighbors } = oldState;
		const vertexIndex = vertexMap[payload.id];

		return {
			...oldState,
			neighbors: neighbors
				.map((row, i) => i !== vertexIndex ? row.filter((col, j) => j !== vertexIndex) : null)
				.filter(row => row != null),
			vertexMap: Object.fromEntries(
				Object.entries(vertexMap)
					.filter(([key, val]) => val !== vertexIndex)
					.map(([key, val]) => val > vertexIndex ? [key, val - 1] : [key, val])
			)
		};
	},
	[SET_WEIGHT]: (payload, oldState) => {
		const { vertexMap, neighbors } = oldState;
		const { vertexAId, vertexBId, weight } = payload;

		console.log(vertexAId);
		console.log(vertexBId);
		console.log(weight);

		const [ i, j ] = [vertexMap[vertexAId], vertexMap[vertexBId]];
		const newNeighbors = [...neighbors];

		newNeighbors[i][j] = weight;
		newNeighbors[j][i] = weight;

		return {
			...oldState,
			neighbors: newNeighbors
		};
	},
	[ADD_VERTEX]: (payload, oldState) => {
		const { vertexMap, neighbors } = oldState;
		const { id } = payload;

		return {
			...oldState,
			vertexMap: {
				...vertexMap,
				[id]: neighbors.length
			},
			neighbors: [
				...(neighbors.map(ele => [...ele, Infinity])),
				spread(neighbors.length + 1, Infinity)
			]
		};
	}
};