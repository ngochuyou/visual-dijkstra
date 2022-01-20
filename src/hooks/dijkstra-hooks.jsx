import {
	createContext, useContext, useCallback
} from 'react';

import { useDispatch } from './utils-hooks';

import { spread, isEmpty, flip } from '../utils';

const DijkstraContext = createContext({});

export const useDijkstra = () => useContext(DijkstraContext);

const I = Infinity;

export const STEP_INITIAL = "STEP_INITIAL";
export const STEP_CALCULATE_COSTS = "STEP_CALCULATE_COSTS";
export const STEP_LOCATE_MIN = "STEP_LOCATE_MIN";
export const STEP_END = "STEP_END";

const STORE = {
	vertexMap: {
		"a": 0,
		"b": 1,
		"c": 2,
		"d": 3,
		"e": 4
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
	prev: {},
	simulator: {
		step: STEP_INITIAL
	}
};

const ADD_VERTEX = "ADD_VERTEX";
const SET_WEIGHT = "SET_WEIGHT";
const DEL_VERTEX = "DEL_VERTEX";
const RUN = "RUN";
const RESET = "RESET";
const DO_STEP = "DO_STEP";

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

	const reset = useCallback((start = 0) => dispatch({ type: RESET }), [dispatch]);

	const doStep = useCallback((start = 0) => dispatch({
		type: DO_STEP,
		payload: start
	}), [dispatch]);

	return <DijkstraContext.Provider value={{
		store, addVertex, setWeight,
		deleteVertex, run, reset,
		doStep
	}}>
		{ children }
	</DijkstraContext.Provider>;
}

const dispatchers = {
	[DO_STEP]: (payload, oldState) => {
		const {
			simulator: { step },
			vertexMap
		} = oldState;

		switch (step) {
			case STEP_INITIAL: {
				const { simulator } = oldState;

				return {
					...oldState,
					start: payload,
					shortestPath: Object.fromEntries(Object.entries(vertexMap).map(([key, val]) => val !== payload ? [key, I] : [key, 0])),
					unvisited: Object.fromEntries(Object.values(vertexMap).map(ele => [ele, true])),
					visited: {},
					prev: Object.fromEntries(Object.entries(vertexMap).map(([key, val]) => [val, []])),
					simulator: { ...simulator, step: STEP_CALCULATE_COSTS }
				};
			}
			case STEP_CALCULATE_COSTS: {
				const {
					neighbors, vertexMap,
					unvisited: oldUnvisited,
					visited: oldVisited,
					shortestPath: oldShortestPath, prev,
					start, simulator
				} = oldState;
				const unvisited = {...oldUnvisited};
				const visited = {...oldVisited};
				const shortestPath = {...oldShortestPath};
				const newPrev = {...prev};
				let currentCost, calculatedCost;
				const flippedVertexMap = flip(vertexMap);

				for (let i of neighbors[start].keys()) {
					if (neighbors[start][i] !== I && unvisited[i] === true) {
						currentCost = +shortestPath[flippedVertexMap[i]];
						calculatedCost = +(shortestPath[flippedVertexMap[start]] + neighbors[start][i]);

						if (calculatedCost < currentCost) {
							shortestPath[flippedVertexMap[i]] = calculatedCost;
							newPrev[i] = [
								...newPrev[i],
								flippedVertexMap[start]
							];
						}
					}
				}

				visited[start] = true;
				delete unvisited[start];

				return {
					...oldState,
					visited, unvisited, shortestPath,
					prev: newPrev,
					simulator: { ...simulator, step: STEP_LOCATE_MIN }
				};
			}
			case STEP_LOCATE_MIN: {
				const {
					unvisited, vertexMap,
					shortestPath, start, simulator, prev
				} = oldState;
				const flippedVertexMap = flip(vertexMap);

				let newStart = +Object.keys(unvisited).reduce(([minIndex, minValue], current) => {
					if (shortestPath[flippedVertexMap[current]] < minValue) {
						return [current, shortestPath[flippedVertexMap[current]]];
					}

					return [minIndex, minValue];
				}, [-1, Infinity])[0];

				if (newStart === -1) {
					return {
						...oldState,
						simulator: { ...simulator, step: STEP_END }
					};
				}

				return {
					...oldState,
					start: newStart,
					simulator: { ...simulator, step: STEP_CALCULATE_COSTS }
				};
			}
			case STEP_END: {
				const { simulator } = oldState;

				return { ...oldState, simulator: { ...simulator, step: STEP_INITIAL } };
			}
			default: return oldState;
		};
	},
	[RESET]: (payload, oldState) => {
		return {
			...oldState,
			start: -1,
			shortestPath: {},
			unvisited: {},
			visited: {},
			prev: {},
			simulator: { step: STEP_INITIAL }
		};
	},
	[RUN]: (payload, oldState) => {
		const { vertexMap, neighbors } = oldState;
		const flippedVertexMap = flip(vertexMap);
		let start = payload;
		let shortestPath = Object.fromEntries(Object.entries(vertexMap).map(([key, val]) => val !== start ? [key, I] : [key, 0]));
		let unvisited = Object.fromEntries(Object.values(vertexMap).map(ele => [ele, true]));
		let prev = Object.fromEntries(Object.entries(vertexMap).map(([key, val]) => [val, []]))
		let visited = {};
		let currentCost, calculatedCost;

		while (!isEmpty(unvisited)) {
			for (let i of neighbors[start].keys()) {
				if (neighbors[start][i] !== I && unvisited[i] === true) {
					currentCost = +shortestPath[flippedVertexMap[i]];
					calculatedCost = +(shortestPath[flippedVertexMap[start]] + neighbors[start][i]);

					if (calculatedCost < currentCost) {
						shortestPath[flippedVertexMap[i]] = calculatedCost;
						prev[i] = [
							...prev[i],
							flippedVertexMap[start]
						];
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
			prev: Object.fromEntries(Object.entries(prev).map(([key, val], index) => [key, [...val, flippedVertexMap[index]]]))
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