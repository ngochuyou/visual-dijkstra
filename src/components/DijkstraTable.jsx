import { useState } from 'react';

import { useDijkstra } from '../hooks/dijkstra-hooks';
import { useGraph } from '../hooks/graph-hooks';
import { useSimulator } from './SimulatorControls';

const MODE_TABLE = "MODE_TABLE";
const MODE_EXPLANATIONS = "MODE_EXPLANATIONS";

export default function DijkstraTable() {
	const { store: {
		vertexMap, visited, unvisited
	} } = useDijkstra();
	const { store: {
		verticies, selectedVerticies
	} } = useGraph();
	const [tab, setTab] = useState(<TableTab />);
	
	return (
		<div>
			<div className="uk-margin uk-child-width-1-2 uk-grid-small" uk-grid="">
				<div>
					<label className="uk-label backgroundf">Start</label>
					{
						selectedVerticies.length === 0 ?
						<span className="uk-margin-left uk-text-muted">Select a vertex first</span> :
						<span className="uk-margin-left">{verticies[vertexMap[selectedVerticies[0]]].name}</span>
					}
				</div>
				<div>
					<select
						className="uk-select"
						onChange={(e) => setTab(e.target.value === MODE_TABLE ? <TableTab /> : <ExplanationsTab />)}
					>
						<option value={MODE_TABLE}>Table</option>
						<option value={MODE_EXPLANATIONS}>Explanations</option>
					</select>
				</div>
			</div>
			<div className="uk-margin">
				<div className="uk-grid-small uk-child-width-1-2" uk-grid="">
					<div>
						<label className="uk-label backgroundf">Unvisited</label>
						<p>{ Object.keys(unvisited).map(ele => verticies[ele].name).join(' ') }</p>
					</div>
					<div>
						<label className="uk-label backgroundf">Visited</label>
						<p>{ Object.keys(visited).map(ele => verticies[ele].name).join(' ') }</p>
					</div>
				</div>
			</div>
			<div className="uk-margin">{tab}</div>
		</div>
	);	
}

function TableTab() {
	const { store: {
		shortestPath, vertexMap, paths
	} } = useDijkstra();
	const { store: {
		verticies
	} } = useGraph();

	return (
		<>
			<h5 className="uk-heading-line">
				<span>Shortest Paths</span>
			</h5>
			<table className="uk-table uk-table-divider uk-table-middle">
				<thead>
					<tr>
						<th className="uk-table-shrink">Vertex</th>
						<th className="uk-table-shrink">Cost</th>
						<th>Path</th>
					</tr>
				</thead>
				<tbody>
				{
					Object.entries(shortestPath)
						.map(([key, val], index) => (
							<tr key={key}>
								<td className="uk-text-center">{verticies[vertexMap[key]].name}</td>
								<td className="uk-text-center">{val === Infinity ? <>&infin;</> : val}</td>
								<td>{paths[index].map(ele => verticies[vertexMap[ele]].name).join(' ')}</td>
							</tr>
						))
				}
				</tbody>
			</table>
		</>
	);
}

function ExplanationsTab() {
	const { stepExplanation } = useSimulator();

	return (
		<>
			<h5 className="uk-heading-line">
				<span>Step Explanation</span>
			</h5>
			<p
				style={{whiteSpace: "pre-line"}}
			>{stepExplanation}</p>
		</>
	);
}