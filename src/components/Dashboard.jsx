import { useState } from 'react';

import { NoFollow } from './Link';
import { CenterModal } from './Modal';

import { useGraph } from '../hooks/graph-hooks';
import { useInput, useToggle } from '../hooks/utils-hooks';

import { asIf, hasLength } from '../utils';

export default function Dashboard() {
	return (
		<nav
			className="uk-navbar-container"
			uk-navbar="mode: click">
			<div className="uk-navbar-left">
				<ul className="uk-navbar-nav">
					<VertexAdder />
					<VertexRemover />
					<VertexConnector />
					<VertexDisconnector />
				</ul>
			</div>
		</nav>
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
					<div className="crossed" uk-icon="link"></div>
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
					<div uk-icon="link"></div>
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
								<div className="uk-margin">
									<input
										className="uk-input"
										placeholder="Weight"
										type="number"
										{ ...weightProps }
									/>
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
					<div uk-icon="trash"></div>
				</NoFollow>
			</li>
		</>
	);
}

function VertexAdder() {
	const { addVertex } = useGraph();
	const [ isFormVisible, toggleFormVision ] = useToggle(false);
	const [ vertexNameProps, ] = useInput("");
	const [ error, setError ] = useState(null);

	const onAdd = (event) => {
		event.preventDefault();
		event.stopPropagation();
		
		const { value: vertexName } = vertexNameProps;

		if (!hasLength(vertexName)) {
			setError("Vertex name must not be empty");
			return;
		}

		setError(null);
		addVertex(vertexName);
		toggleFormVision();
	};
	
	return (
		<>
			<li>
				<NoFollow
					onClick={toggleFormVision}
				>
					<div uk-icon="plus"></div>
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
								<div className="uk-margin">
									<input
										className="uk-input"
										placeholder="Vertex name"
										{ ...vertexNameProps }
									/>
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