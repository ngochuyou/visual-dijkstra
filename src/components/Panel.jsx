import Dashboard from './Dashboard';
import Canvas from './Canvas';
import NeighborsTable from './NeighborsTable';
import DijkstraTable from './DijkstraTable';

export default function Panel() {
	return (
		<div className="panel">
			<Dashboard />
			<div className="uk-grid-small" uk-grid="">
				<div className="uk-width-3-5">
					<Canvas />
				</div>
				<div className="uk-width-2-5">
					<DijkstraTable />
				</div>
			</div>
			<NeighborsTable />
		</div>
	);	
}