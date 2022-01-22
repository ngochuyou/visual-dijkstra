import './App.css';

import Panel from './components/Panel';

import GraphContextProvider from './hooks/graph-hooks';
import DijkstraContextProvider from './hooks/dijkstra-hooks';
import { SimulatorContextProvider } from './components/SimulatorControls';
import { PanelContextProvider } from './components/Panel';

export default function App() {
	return (
		<div>
			<DijkstraContextProvider>
				<GraphContextProvider>
					<SimulatorContextProvider>
						<PanelContextProvider>
							<Panel/>
						</PanelContextProvider>
					</SimulatorContextProvider>
				</GraphContextProvider>
			</DijkstraContextProvider>
		</div>
	);
};