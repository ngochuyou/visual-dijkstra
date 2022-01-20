import { Fragment, useEffect } from 'react';

import { useGraph } from '../hooks/graph-hooks';
import { STEP_INITIAL, STEP_CALCULATE_COSTS, useDijkstra } from '../hooks/dijkstra-hooks';

export default function Canvas() {
	return (
		<div
			className="canvas uk-background-muted uk-box-shadow-large"
			uk-height-viewport="offset-top: true"
		>
			<VertexLayer />
			<EdgeLayer />
		</div>
	);
}

function EdgeLayer() {
	const { store: { edges } } = useGraph();

	return (
		<svg uk-height-viewport="offset-top: true">
		{
			edges.map((ele, index) => (
				<Fragment key={ index }>
					<line
						x1={ ele.vertexALeft }
						x2={ ele.vertexBLeft }
						y1={ ele.vertexATop }
						y2={ ele.vertexBTop }
						className={ele.selected ? "selected" : ""}
					></line>
					<text
						x={ ele.textLeft }
						y={ ele.textTop }
					>{ ele.weight }</text>
				</Fragment>
			))
		}
		</svg>
	);
}

function VertexLayer() {
	const {
		store: { verticies, edges },
		modifyVertexCords, modifyVertexSelectState,
		modifyEdgesSelectState
	} = useGraph();
	const {
		store: {
			neighbors, start,
			simulator: { step }
		}
	} = useDijkstra();

	useEffect(() => {
		if (step === STEP_CALCULATE_COSTS) {
			modifyEdgesSelectState(
				neighbors[start]
					.map((ele, index) => ele !== Infinity ? index : null)
					.filter(ele => ele != null)
					.map(ele => edges.filter(edge => edge.contains(verticies[start].id) && edge.contains(verticies[ele].id))[0]),
				true);
			return;
		}

		modifyEdgesSelectState(verticies, false);
	}, [step, start]);

	const onDragStart = (e) => {
		e.dataTransfer.setData('mozilla', 'make-draggable');
	};
	console.log(edges);
	const onDragEnd = (vertex, event) => {
		const rect = event.currentTarget.parentNode.getBoundingClientRect();
		const panelX = window.scrollX + rect.left;
		const panelY = window.scrollY + rect.top;
		const top = event.pageY - panelY;
		const left = event.pageX - panelX;

		modifyVertexCords({ id: vertex.id, top, left });
	};

	const onVertexClick = (vertex, event) => {
		modifyVertexSelectState({ id: vertex.id, selected: !vertex.selected });
	};
	
	return (
		<>
		{
			verticies.map((ele, index) => (
				<div
					className={`vertex ${ele.selected ? "selected" : ""}`}
					key={index}
					style={{ top: ele.top, left: ele.left }}
					draggable="true"
					onDragStart={onDragStart}
					onDragEnd={(e) => onDragEnd(ele, e)}
					onClick={(e) => onVertexClick(ele, e)}
				>{ele.name}</div>
			))
		}
		</>
	);
}