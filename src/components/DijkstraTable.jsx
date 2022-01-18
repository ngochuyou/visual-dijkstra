import { useDijkstra } from '../hooks/dijkstra-hooks';
import { useGraph } from '../hooks/graph-hooks';

export default function DijkstraTable() {
	const { store: {
		start, shortestPath, vertexMap, prev
	} } = useDijkstra();
	const { store: {
		verticies
	} } = useGraph();

	return (
		<div className="overflow-container uk-padding-small" uk-height-viewport="offset-top: true">
			<div className="overflow" uk-overflow-auto="selContainer: .overflow-container; selContent: .overflow">
				<div className="uk-margin">
					<label className="uk-label backgroundf">Start</label>
					<span className="uk-margin-left">{start}</span>
				</div>
				<div className="uk-margin">
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
										<td>{verticies[vertexMap[key]].name}</td>
										<td>{val === Infinity ? <>&infin;</> : val}</td>
										<td>{ prev[index].map(ele => verticies[vertexMap[ele]].name).join(' ') }</td>
									</tr>
								))
						}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);	
}