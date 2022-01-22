import { createContext, useContext, useState } from 'react';

import Dashboard from './Dashboard';
import Canvas from './Canvas';
import NeighborsTable from './NeighborsTable';
import DijkstraTable from './DijkstraTable';

const PanelContext = createContext();

export const usePanel = () => useContext(PanelContext);

export const TYPE_A = "TYPE_A";
export const TYPE_B = "TYPE_B";

export function PanelContextProvider({ children }) {
	const [layoutType, setLayoutType] = useState(TYPE_A);

	return (
		<PanelContext.Provider value={{
			layoutType, setLayoutType
		}}>
			{ children }
		</PanelContext.Provider>
	);
}

const layouts = {
	[TYPE_B]: () => {
		return (
			<>
				<div className="uk-grid-small" uk-grid="">
					<div className="uk-width-3-5">
						<Canvas />
					</div>
					<div className="uk-width-2-5 overflow-container" uk-height-viewport="offset-top: true">
						<div
							className="uk-padding-small overflow"
							uk-overflow-auto="selContainer: .overflow-container; selContent: .overflow"
						>
							<DijkstraTable />
						</div>
					</div>
				</div>
				<div className="uk-padding">
					<NeighborsTable />
				</div>
			</>
		);
	},
	[TYPE_A]: () => {
		return (
			<>
				<div className="uk-grid-small" uk-grid="">
					<div className="uk-width-3-5">
						<Canvas />
					</div>
					<div className="uk-width-2-5 overflow-container" uk-height-viewport="offset-top: true">
						<div
							className="uk-padding-small overflow"
							uk-overflow-auto="selContainer: .overflow-container; selContent: .overflow"
						>
							<NeighborsTable />
						</div>
					</div>
				</div>
				<div className="uk-padding">
					<DijkstraTable />
				</div>
			</>
		);
	},
};

export default function Panel() {
	const { layoutType } = usePanel();

	return (
		<div className="panel">
			<Dashboard />
			{ layouts[layoutType]() }
		</div>
	);	
}