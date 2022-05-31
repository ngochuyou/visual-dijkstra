import {
	createContext, useContext, useCallback
} from 'react';

import { useDispatch } from './utils-hooks';
import { useDijkstra } from './dijkstra-hooks';

import { linear, hasLength, isBool, atom, I } from '../utils';

import Vertex from '../model/Vertex';
import Edge from '../model/Edge';

const GraphContext = createContext({});

export const useGraph = () => useContext(GraphContext);

const SET_VERTICIES = "SET_VERTICIES";
const ADD_VERTEX = "ADD_VERTEX";
const CLEAR = "CLEAR";
const MOD_VERTEX_CORDS = "MOD_VERTEX_CORDS";
const MOD_VERTEX_SELECT_STATE = "MOD_VERTEX_SELECT_STATE";
const DEL_VERTEX = "DEL_VERTEX";
const SET_EDGES = "SET_EDGES";
const CONNECT_VERTICIES = "CONNECT_VERTICIES";
const DISCONNECT_VERTICIES = "DISCONNECT_VERTICIES";
const MOD_EDGE_WEIGHT = "MOD_EDGE_WEIGHT";
const MOD_EDGE_SELECT_STATE = "MOD_EDGE_SELECT_STATE";
const CLEAR_SELECTED_VERTICIES = "CLEAR_SELECTED_VERTICIES";
const CLEAR_SELECTED_EDGES = "CLEAR_SELECTED_EDGES";

const VERTEX_ID_PROPNAME = "id";

const STORE = {
	verticies: [],
	selectedVerticies: [],
	edges: []
};

export default function GraphContextProvider({ children }) {
	const [store, dispatch] = useDispatch({ ...STORE }, dispatchers);
	const {
		addVertex: dijkstraAddVertex,
		setWeight: dijkstraSetWeight,
		deleteVertex: dijkstraDeleteVertex,
		reset: dijkstraReset,
		setVertexMap: dijkstraSetVertexMap
	} = useDijkstra();

	const addVertex = useCallback((vertexName) => {
		const newVertex = new Vertex({
			top: 250,
			left: 250,
			name: vertexName
		});

		dispatch({
			type: ADD_VERTEX,
			payload: newVertex
		});
		dijkstraAddVertex(newVertex);
	}, [dispatch, dijkstraAddVertex]);

	const modifyVertexCords = useCallback(({ id = null, top = 100, left = 100} = {}) => {
		if (!hasLength(id)) {
			return;
		}

		dispatch({
			type: MOD_VERTEX_CORDS,
			payload: { id, top, left }
		});
	}, [dispatch]);

	const modifyVertexSelectState = useCallback(({ id = null, selected = null } = {}) => {
		if (!hasLength(id) || !isBool(selected)) {
			return;
		}

		dispatch({
			type: MOD_VERTEX_SELECT_STATE,
			payload: { id, selected }
		});
	}, [dispatch]);

	const deleteVertex = useCallback(() => {
		const deletedVerticies = [...store.selectedVerticies];

		dijkstraReset();
		dispatch({ type: DEL_VERTEX });
		deletedVerticies.forEach(ele => dijkstraDeleteVertex({ id: ele }));
	}, [dispatch, store, dijkstraDeleteVertex, dijkstraReset]);

	const connectVerticies = useCallback((weight = 0) => {
		if (isNaN(weight) || weight <= 0) {
			return;
		}

		const { verticies, selectedVerticies, edges } = store;

		if (selectedVerticies.length < 2) {
			return;
		}

		const leftId = selectedVerticies[0];
		const rightId = selectedVerticies[1];

		for (let edge of edges) {
			if (edge.contains(leftId) && edge.contains(rightId)) {
				dispatch({
					type: MOD_EDGE_WEIGHT,
					payload: { id: edge.id, weight }
				});
				dijkstraSetWeight(new Edge({
					...edge,
					weight
				}));
				return;
			}
		}

		const left = linear(verticies, VERTEX_ID_PROPNAME, leftId, ele => ele);
		const right = linear(verticies, VERTEX_ID_PROPNAME, rightId, ele => ele);

		dispatch({
			type: CONNECT_VERTICIES,
			payload: { left, right, weight }
		});
		dijkstraSetWeight(new Edge({
			vertexA: left,
			vertexB: right,
			weight
		}));
	}, [dispatch, store, dijkstraSetWeight]);

	const disconnectVerticies = useCallback(() => {
		const { selectedVerticies } = store;

		if (selectedVerticies.length < 2) {
			return;
		}

		for (let edge of store.edges) {
			if (edge.contains(selectedVerticies[0]) && edge.contains(selectedVerticies[1])) {
				dijkstraSetWeight(new Edge({
					...edge,
					weight: I
				}));
				break;
			}
		}

		dispatch({ type: DISCONNECT_VERTICIES });
	}, [dispatch, dijkstraSetWeight, store]);

	const clear = useCallback(() => dispatch({ type: CLEAR }), [dispatch]);

	const modifyEdgesSelectState = useCallback((selectedEdges, selected = false) => {
		dispatch({
			type: MOD_EDGE_SELECT_STATE,
			payload: {
				edges: selectedEdges,
				selected
			}
		});
	}, [dispatch]);

	const clearSelectedVerticies = useCallback(() => dispatch({ type: CLEAR_SELECTED_VERTICIES }), [dispatch]);

	const clearSelectedEdges = useCallback(() => dispatch({ type: CLEAR_SELECTED_EDGES }), [dispatch]);

	const setVerticies = useCallback((verticies) => {
		dispatch({
			type: SET_VERTICIES,
			payload: verticies
		});
		dijkstraSetVertexMap(verticies);
	}, [dispatch, dijkstraSetVertexMap]);

	const setEdges = useCallback((edges) => {
		dispatch({
			type: SET_EDGES,
			payload: edges
		});
	}, [dispatch]);	

	return <GraphContext.Provider value={{
		store, addVertex, modifyVertexCords,
		modifyVertexSelectState, deleteVertex,
		connectVerticies, disconnectVerticies,
		clear, modifyEdgesSelectState, clearSelectedVerticies,
		clearSelectedEdges, setVerticies, setEdges
	}}>
		{ children }
	</GraphContext.Provider>;
}

const dispatchers = {
	[SET_VERTICIES]: (payload, oldState) => {
		return {
			...oldState,
			verticies: payload
		};
	},
	[SET_EDGES]: (payload, oldState) => {
		return {
			...oldState,
			edges: payload
		};
	},
	[CLEAR_SELECTED_EDGES]: (payload, oldState) => {
		const { edges } = oldState;

		return {
			...oldState,
			edges: edges.map(ele => new Edge({
				...ele,
				selected: false
			}))
		};		
	},
	[CLEAR_SELECTED_VERTICIES]: (payload, oldState) => {
		const { verticies } = oldState;

		return {
			...oldState,
			verticies: verticies.map(ele => new Vertex({
				...ele,
				selected: false
			}))
		};
	},
	[MOD_EDGE_SELECT_STATE]: (payload, oldState) => {
		const { edges } = oldState;
		const { selected } = payload;
		const selectedEdges = atom(payload.edges);

		return {
			...oldState,
			edges: edges.map((ele, index) => selectedEdges[ele.id] == null ? ele : new Edge({
				...ele,
				selected
			}))
		};
	},
	[CLEAR]: (payload, oldState) => {
		const { verticies, edges } = oldState;

		return {
			...oldState,
			verticies: verticies.map(ele => new Vertex({ ...ele, selected: false })),
			edges: edges.map(ele => new Edge({
				...ele,
				selected: false
			})),
			selectedVerticies: []
		};
	},
	[DISCONNECT_VERTICIES]: (payload, oldState) => {
		const { selectedVerticies, edges } = oldState;
		const [leftId, rightId] = selectedVerticies.slice(0, 2);

		return {
			...oldState,
			edges: edges.filter(ele => !ele.contains(leftId) || !ele.contains(rightId)),
		}
	},
	[MOD_EDGE_WEIGHT]: ({ id, weight }, oldState) => {
		const { edges } = oldState;

		return {
			...oldState,
			edges: edges.map(ele => ele.id !== id ? ele : new Edge({ ...ele, weight }))
		};
	},
	[CONNECT_VERTICIES]: ({ left, right, weight }, oldState) => {
		const { edges } = oldState;

		return {
			...oldState,
			edges: [...edges, new Edge({
				vertexA: left,
				vertexB: right,
				weight
			})]
		};
	},
	[DEL_VERTEX]: (payload, oldState) => {
		const { verticies, selectedVerticies, edges } = oldState;
		const deletedVerticiesMap = atom(selectedVerticies, null);

		return {
			...oldState,
			verticies: verticies.filter(ele => deletedVerticiesMap[ele.id] == null),
			edges: edges.filter(ele => deletedVerticiesMap[ele.vertexAId] == null && deletedVerticiesMap[ele.vertexBId] == null),
			selectedVerticies: []
		};
	},
	[MOD_VERTEX_SELECT_STATE]: ({ id, selected } = {}, oldState) => {
		const { verticies, selectedVerticies } = oldState;
		
		return {
			...oldState,
			verticies: verticies.map(ele => ele.id !== id ? ele : new Vertex({ ...ele, selected })),
			selectedVerticies: selected ?
				[...selectedVerticies, linear(verticies, VERTEX_ID_PROPNAME, id, ele => ele.id)] :
				selectedVerticies.filter(ele => ele !== id)
		};
	},
	[MOD_VERTEX_CORDS]: (payload, oldState) => {
		const { verticies, edges } = oldState;
		const { id, top, left } = payload;

		return {
			...oldState,
			verticies: verticies.map(ele => ele.id !== id ? ele : new Vertex({ ...ele, top, left })),
			edges: edges.map(ele => !ele.contains(id) ? ele :
				ele.vertexAId === id ?
					new Edge({ ...ele, vertexATop: top, vertexALeft: left }) :
					new Edge({ ...ele, vertexBTop: top, vertexBLeft: left }))
		};
	},
	[ADD_VERTEX]: (payload, oldState) => {
		const { verticies } = oldState;
		
		return {
			...oldState,
			verticies: [...verticies, payload]
		};
	}
};