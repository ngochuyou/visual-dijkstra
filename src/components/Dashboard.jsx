import { useState, useRef, useEffect } from 'react';

import { v4 } from 'uuid';

import { NoFollow } from './Link';
import { CenterModal } from './Modal';
import SimulatorControls from './SimulatorControls';

import { useGraph } from '../hooks/graph-hooks';
import { useDijkstra } from '../hooks/dijkstra-hooks';
import { useSystem } from '../hooks/system-hooks';
import { useInput, useToggle } from '../hooks/utils-hooks';
import {
	usePanel,
	TYPE_A as LAYOUT_TYPE_A, TYPE_B as LAYOUT_TYPE_B
} from './Panel';

import Vertex from '../model/Vertex';
import Edge from '../model/Edge';

import { asIf, hasLength } from '../utils';

export default function Dashboard() {
	return (
		<nav
			className="uk-navbar-container uk-navbar-transparent uk-box-shadow-medium"
			uk-navbar="mode: click">
			<div className="uk-navbar-left noselect">
				<ul className="uk-navbar-nav">
					<VertexAdder />
					<VertexRemover />
					<VertexConnector />
					<VertexDisconnector />
					<Clearer />
					<Importer />
					<SimulatorControls />
					<Saver />
				</ul>
			</div>
			<div className="uk-navbar-right noselect">
				<ul className="uk-navbar-nav">
					<LayoutPicker />
				</ul>
				<Logo />
			</div>
		</nav>
	);
}

function Importer() {
	const { clear, setVerticies, setEdges } = useGraph();
	const {
		reset: dijkstraReset,
		setNeighbors, updateRunResult
	} = useDijkstra();

	const onImportSample = () => {
		clear();
		dijkstraReset();

		const verticies = {
			a: new Vertex({id: v4(), name: "A", top: 307, left: 174}),
			b: new Vertex({id: v4(), name: "B", top: 132, left: 92}),
			c: new Vertex({id: v4(), name: "C", top: 380, left: 371}),
			d: new Vertex({id: v4(), name: "D", top: 219, left: 294}),
			e: new Vertex({id: v4(), name: "E", top: 122, left: 494})
		};

		setVerticies(Object.values(verticies));
		setEdges([
			new Edge({ vertexA: verticies["a"], vertexB: verticies["b"], weight: 1 }),
			new Edge({ vertexA: verticies["e"], vertexB: verticies["b"], weight: 3 }),
			new Edge({ vertexA: verticies["e"], vertexB: verticies["d"], weight: 7 }),
			new Edge({ vertexA: verticies["c"], vertexB: verticies["d"], weight: 1 }),
			new Edge({ vertexA: verticies["c"], vertexB: verticies["e"], weight: 1 }),
			new Edge({ vertexA: verticies["a"], vertexB: verticies["d"], weight: 2 }),
			new Edge({ vertexA: verticies["b"], vertexB: verticies["d"], weight: 2 }),
			new Edge({ vertexA: verticies["c"], vertexB: verticies["a"], weight: 5 })
		]);
		setNeighbors([
			[Infinity, 1, 5, 2, Infinity],
			[1, Infinity, Infinity, 2, 3],
			[5, Infinity, Infinity, 1, 1],
			[2, 2, 1, Infinity, 7],
			[Infinity, 3, 1, 7, Infinity]
		]);
		updateRunResult({
			shortestPath: {},
			unvisited: {},
			visited: {},
			paths: []
		});
		clear();
		dijkstraReset();
	};

	const onImportSave = () => {
		setVerticies(JSON.parse(localStorage[STORAGE_VERTICIES_KEY])
			.map(ele => new Vertex(ele)));
		setEdges(JSON.parse(localStorage[STORAGE_EDGES_KEY])
			.map(ele => new Edge(ele)));
		setNeighbors(JSON.parse(localStorage[STORAGE_NEIGHBORS_KEY])
			.map(array => array.map(ele => ele == null ? Infinity : ele)));
		updateRunResult({
			shortestPath: {},
			unvisited: {},
			visited: {},
			paths: []
		});
		clear();
		dijkstraReset();
	};

	return (
		<>
			<li>
				<NoFollow>
					<div
						uk-icon="pull"
						uk-tooltip="Import"
					></div>
				</NoFollow>
					<div className="uk-navbar-dropdown">
						<ul className="uk-nav uk-navbar-dropdown-nav">
							<li className="uk-active">
								<NoFollow
									onClick={onImportSample}
								>From sample</NoFollow>
							</li>
							<li className="uk-nav-divider"></li>
							<li className="uk-active">
								<NoFollow
									onClick={onImportSave}
								>From last save</NoFollow>
							</li>
						</ul>
					</div>
			</li>
		</>
	);
}

const STORAGE_VERTICIES_KEY = "verticies";
const STORAGE_EDGES_KEY = "edges";
const STORAGE_NEIGHBORS_KEY = "neighbors";

function Saver() {
	const { store: { verticies, edges } } = useGraph();
	const { store: { neighbors } } = useDijkstra();
	const { setNoti } = useSystem();

	const onSave = () => {
		localStorage[STORAGE_VERTICIES_KEY] = JSON.stringify(verticies);
		localStorage[STORAGE_EDGES_KEY] = JSON.stringify(edges);
		localStorage[STORAGE_NEIGHBORS_KEY] = JSON.stringify(neighbors);
		setNoti("Graph saved");
	};

	return (
		<>
			<li>
				<NoFollow
					onClick={onSave}
					className="uk-button"
				>
					Save
				</NoFollow>
			</li>
		</>
	);
}

function LayoutPicker() {
	const { setLayoutType } = usePanel();

	return (
		<>
			<li>
				<NoFollow>
					<div
						uk-icon="thumbnails"
						uk-tooltip="Layout"
					></div>
				</NoFollow>
				<div className="uk-navbar-dropdown uk-navbar-dropdown-width-2">
					<div className="uk-navbar-dropdown-grid uk-child-width-1-2" uk-grid="">
						<div>
							<ul className="uk-nav uk-navbar-dropdown-nav">
								<li
									className="uk-active uk-box-shadow-hover-large pointer"
									onClick={() => setLayoutType(LAYOUT_TYPE_A)}
								>
									<div
										className="uk-width-1-1 uk-grid-collapse"
										uk-grid=""
									>
										<div
											className="uk-width-3-5"
										>
											<div style={{ height: "102px", border: "1px dashed var(--first-color)" }}
												className="uk-width-1-1 uk-position-relative">
												<span className="uk-position-center colors">Panel</span>
											</div>
										</div>
										<div className="uk-width-2-5">
											<div style={{ height: "100px", border: "1px dashed var(--first-color)" }}
												className="uk-position-relative">
												<span className="uk-position-center colors">Matrix</span>
											</div>
										</div>
										<div style={{
											height: "50px", border: "1px dashed var(--first-color)"
										}} className="uk-position-relative uk-width-1-1">
											<span className="uk-position-center colors">Results</span>
										</div>
									</div>
								</li>
							</ul>
						</div>
						<div>
							<ul className="uk-nav uk-navbar-dropdown-nav">
								<li
									className="uk-active uk-box-shadow-hover-large pointer"
									onClick={() => setLayoutType(LAYOUT_TYPE_B)}
								>
									<div
										className="uk-width-1-1 uk-grid-collapse"
										uk-grid=""
									>
										<div
											className="uk-width-3-5"
										>
											<div style={{ height: "102px", border: "1px dashed var(--first-color)" }}
												className="uk-width-1-1 uk-position-relative">
												<span className="uk-position-center colors">Panel</span>
											</div>
										</div>
										<div className="uk-width-2-5">
											<div style={{ height: "100px", border: "1px dashed var(--first-color)" }}
												className="uk-position-relative">
												<span className="uk-position-center colors">Results</span>
											</div>
										</div>
									</div>
									<div style={{
										height: "50px", border: "1px dashed var(--first-color)"
									}} className="uk-position-relative uk-width-1-1">
										<span className="uk-position-center colors">Matrix</span>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</li>
		</>
	);
}

function Logo() {
	return (
		<NoFollow className="uk-navbar-item uk-logo">
			Dijkstra
		</NoFollow>
	);
}

function Clearer() {
	const { clear } = useGraph();
	const { reset: dijkstraReset } = useDijkstra();

	const onClear = () => {
		dijkstraReset();
		clear();
	};

	return (
		<>
			<li>
				<NoFollow
					onClick={onClear}
					className="uk-button"
				>
					<div
						uk-icon="refresh"
						uk-tooltip="Clear"
					></div>
				</NoFollow>
			</li>
		</>
	);
}

function VertexDisconnector() {
	const {
		store: { selectedVerticies },
		disconnectVerticies
	} = useGraph();
	const { setNoti } = useSystem();

	const onDisconnect = () => {
		if (selectedVerticies.length < 2) {
			setNoti("Select at least 2 verticies");
			return;
		}

		disconnectVerticies();
	};

	return (
		<>
			<li>
				<NoFollow
					onClick={onDisconnect}
				>
					<div
						className="crossed" uk-icon="link"
						uk-tooltip="Disconnect two Verticies"
					></div>
				</NoFollow>
			</li>
		</>
	);
}

function VertexConnector() {
	const { store: { selectedVerticies }, connectVerticies } = useGraph();
	const { setNoti } = useSystem();
	const [ isFormVisible, toggleFormVision ] = useToggle(false);
	const [ weightProps, ] = useInput(1);
	const [ error, setError ] = useState(null);

	const onConnect = (event) => {
		event.preventDefault();
		event.stopPropagation();

		const { value: weight } = weightProps;

		if (weight <= 0) {
			setError("Weight must be a positive number");
			return;
		}

		setError(null);
		connectVerticies(weight);
		toggleFormVision();
	}

	const onKeyDown = (e) => {
		if (e.keyCode === 27) {
			toggleFormVision();
		}
	};

	const onOpen = () => {
		if (selectedVerticies.length < 2) {
			setNoti("Select at least 2 verticies");
			return;
		}

		toggleFormVision();
	};

	return (
		<>
			<li>
				<NoFollow
					onClick={onOpen}
				>
					<div
						uk-icon="link"
						uk-tooltip="Connect two Verticies"
					></div>
				</NoFollow>
				{
					asIf(isFormVisible)
					.then(() => (
						<CenterModal
							close={toggleFormVision}
							footerCloseBtn={false}
						>
							<form onSubmit={onConnect}>
								<h3 className="uk-heading uk-heading-line">
									<span>Connect two Verticies</span>
								</h3>
								<div className="uk-margin labeled">
									<input
										className="uk-input"
										id="weight-input"
										type="number"
										required="required"
										{ ...weightProps }
										onKeyDown={onKeyDown}
										step="0.01"
									/>
									<label forhtml="weight-input">Edge Weight</label>
									<p className="uk-text-danger">{error}</p>
								</div>
								<div className="uk-margin uk-text-right">
									<button
										className="uk-button backgroundf"
										type="submit"
									>
										Connect
									</button>
								</div>
							</form>
						</CenterModal>
					))
					.else()
				}
			</li>
		</>
	);
}

function VertexRemover() {
	const { deleteVertex } = useGraph();

	return (
		<>
			<li>
				<NoFollow
					onClick={deleteVertex}
				>
					<div
						uk-icon="trash"
						uk-tooltip="Delete a Vertex"
					></div>
				</NoFollow>
			</li>
		</>
	);
}

function VertexAdder() {
	const { addVertex } = useGraph();
	const [ isFormVisible, toggleFormVision ] = useToggle(false);
	const [ vertexNameProps, setVertexName ] = useInput("");
	const [ error, setError ] = useState(null);
	const inputRef = useRef();

	useEffect(() => {
		if (isFormVisible) {
			inputRef.current.focus();
		}
	}, [isFormVisible]);

	const onAdd = (event) => {
		event.preventDefault();
		event.stopPropagation();
		
		const { value: vertexName } = vertexNameProps;

		if (!hasLength(vertexName)) {
			setError("Vertex name must not be empty");
			return;
		}

		setError(null);
		setVertexName("");
		addVertex(vertexName);
	};

	const onKeyDown = (e) => {
		if (e.keyCode === 27) {
			toggleFormVision();
		}
	};
	
	return (
		<>
			<li>
				<NoFollow
					onClick={toggleFormVision}
				>
					<div uk-icon="plus" uk-tooltip="Add a Vertex"></div>
				</NoFollow>
				{
					asIf(isFormVisible)
					.then(() => (
						<CenterModal
							close={toggleFormVision}
							footerCloseBtn={false}
						>
							<form onSubmit={onAdd}>
								<h3 className="uk-heading uk-heading-line">
									<span>Add a new Vertex</span>
								</h3>
								<div className="uk-margin labeled">
									<input
										ref={inputRef}
										id="vertex-name-input"
										required="required"
										{ ...vertexNameProps }
										onKeyDown={onKeyDown}
									/>
									<label forhtml="vertex-name-input">Vertex Name</label>
									<p className="uk-text-danger">{error}</p>
								</div>
								<div className="uk-margin uk-text-right">
									<button
										className="uk-button backgroundf"
										type="submit"
									>
										Add
									</button>
								</div>
							</form>
						</CenterModal>
					))
					.else()
				}
			</li>
		</>
	);
}