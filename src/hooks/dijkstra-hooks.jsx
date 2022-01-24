import {
	createContext, useContext, useCallback
} from 'react';

import { useDispatch } from './utils-hooks';

import { spread } from '../utils';

const DijkstraContext = createContext({});

export const useDijkstra = () => useContext(DijkstraContext);

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
	shortestPath: {},
	unvisited: {},
	visited: {},
	paths: []
};

const SET_VERTEX_MAP = "SET_VERTEX_MAP";
const SET_NEIGHBORS = "SET_NEIGHBORS";
const ADD_VERTEX = "ADD_VERTEX";
const SET_WEIGHT = "SET_WEIGHT";
const DEL_VERTEX = "DEL_VERTEX";
const UPDATE_RUN_RESULT = "UPDATE_RUN_RESULT";
const RESET = "RESET";

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

	const reset = useCallback(() => dispatch({ type: RESET }), [dispatch]);

	const updateRunResult = useCallback((props) => {
		dispatch({
			type: UPDATE_RUN_RESULT,
			payload: props
		})
	}, [dispatch]);

	const setVertexMap = useCallback((verticies) => {
		dispatch({
			type: SET_VERTEX_MAP,
			payload: Object.fromEntries(verticies.map((ele, index) => [ele.id, index]))
		});
	}, [dispatch]);

	const setNeighbors = useCallback((neighbors) => {
		dispatch({
			type: SET_NEIGHBORS,
			payload: neighbors
		});
	}, [dispatch]);

	return <DijkstraContext.Provider value={{
		store, addVertex, setWeight,
		deleteVertex, reset, updateRunResult,
		setVertexMap, setNeighbors
	}}>
		{ children }
	</DijkstraContext.Provider>;
}

const dispatchers = {
	[SET_NEIGHBORS]: (payload, oldState) => {
		return {
			...oldState,
			neighbors: payload
		};
	},
	[SET_VERTEX_MAP]: (payload, oldState) => {
		return {
			...oldState,
			vertexMap: payload
		};
	},
	[RESET]: (payload, oldState) => {
		return {
			...oldState,
			shortestPath: {},
			unvisited: {},
			visited: {},
			paths: []
		};
	},
	[UPDATE_RUN_RESULT]: function ({
			shortestPath, unvisited, visited, paths
		}, oldState) {
		const {
			shortestPath: oldShortestPath,
			unvisited: oldUnvisited,
			visited: oldVisited,
			paths: oldPaths
		} = oldState;
		
		return {
			...oldState,
			shortestPath: shortestPath || oldShortestPath,
			unvisited: unvisited || oldUnvisited,
			visited: visited || oldVisited,
			paths: paths || oldPaths
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
		console.log(parseFloat(weight));
		newNeighbors[i][j] = parseFloat(weight);
		newNeighbors[j][i] = newNeighbors[i][j];

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