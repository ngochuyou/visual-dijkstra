import './App.css';

import Panel from './components/Panel';

import GraphContextProvider from './hooks/graph-hooks';

export default function App() {
	return (
		<div>
			<GraphContextProvider>
				<Panel/>
			</GraphContextProvider>
		</div>
	);
};