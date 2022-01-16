import { Fragment } from 'react';
import { useGraph } from '../hooks/graph-hooks';

export default function Canvas() {
	return (
		<div
			className="canvas"
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
		store: { verticies },
		modifyVertexCords, modifyVertexSelectState
	} = useGraph();

	const onDragStart = (e) => {
		e.dataTransfer.setData('mozilla', 'make-draggable');
	};

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