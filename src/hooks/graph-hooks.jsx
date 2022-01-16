import {
	createContext, useContext, useCallback
} from 'react';

import { useDispatch } from './utils-hooks';

import { linear, hasLength, isBool, atom } from '../utils';

import Vertex from '../model/Vertex';
import Edge from '../model/Edge';

const GraphContext = createContext({});

export const useGraph = () => useContext(GraphContext);

const ADD_VERTEX = "ADD_VERTEX";
const MOD_VERTEX_CORDS = "MOD_VERTEX_CORDS";
const MOD_VERTEX_SELECT_STATE = "MOD_VERTEX_SELECT_STATE";
const DEL_VERTEX = "DEL_VERTEX";
const CONNECT_VERTICIES = "CONNECT_VERTICIES";
const DISCONNECT_VERTICIES = "DISCONNECT_VERTICIES";
const MOD_EDGE_WEIGHT = "MOD_EDGE_WEIGHT";

const VERTEX_ID_PROPNAME = "id";

const STORE = {
	verticies: [
		new Vertex({name: "A", top: 150, left: 300}),
		new Vertex({name: "B", top: 250, left: 150}),
		new Vertex({name: "C", top: 300, left: 150}),
		new Vertex({name: "D", top: 400, left: 220}),
		new Vertex({name: "E", top: 200, left: 450})
	],
	selectedVerticies: [],
	edges: []
};

export default function GraphContextProvider({ children }) {
	const [store, dispatch] = useDispatch({ ...STORE }, dispatchers);
	const addVertex = useCallback((vertexName) => {
		dispatch({
			type: ADD_VERTEX,
			payload: new Vertex({
				top: 250,
				left: 250,
				name: vertexName
			})
		});
	}, [dispatch]);

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

	const deleteVertex = useCallback(() => dispatch({ type: DEL_VERTEX }), [dispatch]);

	const connectVerticies = useCallback((weight = 0) => {
		if (isNaN(weight) || weight < 1) {
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
				return;
			}
		}

		dispatch({
			type: CONNECT_VERTICIES,
			payload: {
				left: linear(verticies, VERTEX_ID_PROPNAME, leftId, ele => ele),
				right: linear(verticies, VERTEX_ID_PROPNAME, rightId, ele => ele),
				weight
			}
		});
	}, [dispatch, store]);

	const disconnectVerticies = useCallback(() => {
		if (store.selectedVerticies.length < 2) {
			return;
		}

		dispatch({ type: DISCONNECT_VERTICIES });
	}, [dispatch, store]);

	return <GraphContext.Provider value={{
		store, addVertex, modifyVertexCords,
		modifyVertexSelectState, deleteVertex,
		connectVerticies, disconnectVerticies
	}}>
		{ children }
	</GraphContext.Provider>;
}

const dispatchers = {
	[DISCONNECT_VERTICIES]: (payload, oldState) => {
		const { selectedVerticies, edges } = oldState;
		const [left, right] = selectedVerticies.slice(0, 2);

		return {
			...oldState,
			edges: edges.filter(ele => !ele.contains(left.id) || !ele.contains(right.id)),
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