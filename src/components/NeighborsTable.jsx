import { linear, flip } from '../utils';

import { useDijkstra } from '../hooks/dijkstra-hooks';
import { useGraph } from '../hooks/graph-hooks';

export default function NeighborsTable() {
	const { store: { neighbors, vertexMap } } = useDijkstra();
	const { store: { verticies } } = useGraph();
	const flippedVertexMap = flip(vertexMap);

	return (
		<div className="uk-padding overflow-container" style={{ height: "100vh" }}>
			<h4 className="uk-heading-line uk-text-center">
				<span>Weight Matrix</span>
			</h4>
			<div className="overflow" uk-overflow-auto="selContainer: .overflow-container; selContent: .overflow">
				<table className="weight-table">
					<thead>
						<tr>
							<th></th>
							{ Object.entries(vertexMap).map(([key, val]) => <th key={key}><span>{verticies[val].name}</span></th>) }
						</tr>
					</thead>
					<tbody>
					{
						neighbors.map((row, i) => (
							<tr key={i}>
								<th>
									<span>{ verticies[vertexMap[flippedVertexMap[i]]].name }</span>
								</th>
								{
									row.map((col, j) => (
										<td key={j}>
											<span>{col === Infinity ? <>&infin;</> : col}</span>
										</td>
									))
								}
							</tr>
						))
					}	
					</tbody>
				</table>
			</div>
		</div>
	);
}