import './App.css';

import Panel from './components/Panel';

import GraphContextProvider from './hooks/graph-hooks';
import DijkstraContextProvider from './hooks/dijkstra-hooks';
import { SimulatorContextProvider } from './components/SimulatorControls';
import { PanelContextProvider } from './components/Panel';
import SystemContextProvider from './hooks/system-hooks';

export default function App() {
	return (
		<div>
			<SystemContextProvider>
				<DijkstraContextProvider>
					<GraphContextProvider>
						<SimulatorContextProvider>
							<PanelContextProvider>
								<Panel/>
							</PanelContextProvider>
						</SimulatorContextProvider>
					</GraphContextProvider>
				</DijkstraContextProvider>
			</SystemContextProvider>
		</div>
	);
};