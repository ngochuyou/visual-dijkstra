import { useState, useRef, useEffect } from 'react';

import { NoFollow } from './Link';
import { CenterModal } from './Modal';
import SimulatorControls from './SimulatorControls';

import { useGraph } from '../hooks/graph-hooks';
import { useDijkstra } from '../hooks/dijkstra-hooks';
import { useInput, useToggle } from '../hooks/utils-hooks';
import {
	usePanel,
	TYPE_A as LAYOUT_TYPE_A, TYPE_B as LAYOUT_TYPE_B
} from './Panel';

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

function Saver() {
	return (
		<>
			<li>
				<NoFollow
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
				<NoFollow>Layout</NoFollow>
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
			<div
				uk-icon="icon: chevron-left; ratio: 1.2"
			></div>
			Dijkstra
			<div
				uk-icon="icon: chevron-right; ratio: 1.2"
			></div>
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
					Clear
				</NoFollow>
			</li>
		</>
	);
}

function VertexDisconnector() {
	const { disconnectVerticies } = useGraph();
	
	return (
		<>
			<li>
				<NoFollow
					onClick={disconnectVerticies}
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
	const { connectVerticies } = useGraph();
	const [ isFormVisible, toggleFormVision ] = useToggle(false);
	const [ weightProps, ] = useInput(1);
	const [ error, setError ] = useState(null);

	const onConnect = (event) => {
		event.preventDefault();
		event.stopPropagation();

		const { value: weight } = weightProps;

		if (weight < 1) {
			setError("Weight must be a positive number");
			return;
		}

		setError(null);
		connectVerticies(weight);
	}

	return (
		<>
			<li>
				<NoFollow
					onClick={toggleFormVision}
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