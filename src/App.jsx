import './App.css';

import Panel from './components/Panel';

import GraphContextProvider from './hooks/graph-hooks';
import DijkstraContextProvider from './hooks/dijkstra-hooks';

export default function App() {
	return (
		<div>
			<DijkstraContextProvider>
				<GraphContextProvider>
					<Panel/>
				</GraphContextProvider>
			</DijkstraContextProvider>
		</div>
	);
};