import { useDijkstra } from '../hooks/dijkstra-hooks';
import { useGraph } from '../hooks/graph-hooks';

export default function DijkstraTable() {
	const { store: {
		shortestPath, vertexMap, prev,
		visited, unvisited,
		simulator: { step }
	} } = useDijkstra();
	const { store: {
		verticies, selectedVerticies
	} } = useGraph();
	
	return (
		<div className="overflow-container uk-padding-small" uk-height-viewport="offset-top: true">
			<div className="overflow" uk-overflow-auto="selContainer: .overflow-container; selContent: .overflow">
				<div className="uk-margin">
					<label className="uk-label backgroundf">Start</label>
					{
						selectedVerticies.length === 0 ?
						<span className="uk-margin-left uk-text-muted">Select a vertex first</span> :
						<span className="uk-margin-left">{verticies[vertexMap[selectedVerticies[0]]].name}</span>
					}
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
										<td className="uk-text-center">{verticies[vertexMap[key]].name}</td>
										<td className="uk-text-center">{val === Infinity ? <>&infin;</> : val}</td>
										<td>{prev[index].map(ele => verticies[vertexMap[ele]].name).join(' ')}</td>
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