import { createContext, useContext, useState, useEffect, useRef } from 'react';

import { NoFollow } from './Link';

import { useGraph } from '../hooks/graph-hooks';
import { useDijkstra } from '../hooks/dijkstra-hooks';
import { useInput } from '../hooks/utils-hooks';
import { useSystem } from '../hooks/system-hooks';

import { flip, isEmpty, I, Stack, spread, hasLength } from '../utils';

const STEP_INITIAL = "STEP_INITIAL";
const STEP_CALCULATE_COSTS = "STEP_CALCULATE_COSTS";
const STEP_LOCATE_MIN = "STEP_LOCATE_MIN";
const STEP_HIGHLIGHT_NEXT_NODE = "STEP_HIGHLIGHT_NEXT_NODE";
const STEP_END = "STEP_END";

const SimulatorContext = createContext();

export const useSimulator = () => useContext(SimulatorContext);

export function SimulatorContextProvider({ children }) {
	const [stepExplanation, setStepExplanation] = useState("");

	return (
		<SimulatorContext.Provider value={{
			stepExplanation, setStepExplanation
		}}>
			{ children }
		</SimulatorContext.Provider>
	);
}

export default function SimulatorControls() {
	return (
		<>
			<DijkstraRunner />
			<DijkstraPlayer />
		</>
	);
}

function DijkstraPlayer() {
	const {
		store: {
			verticies, selectedVerticies, edges
		},
		modifyEdgesSelectState, modifyVertexSelectState,
		clearSelectedEdges, clearSelectedVerticies
	} = useGraph();
	const {
		store: {
			vertexMap, neighbors, unvisited,
			visited, shortestPath
		},
		updateRunResult
	} = useDijkstra();
	const { setNoti } = useSystem();
	const { setStepExplanation } = useSimulator();
	const [step, setStep] = useState(STEP_INITIAL);
	const [currentNodeIndex, setCurrentNodeIndex] = useState(-1);
	const [autoplayer, setAutoplayer] = useState(() => null);
	const [flippedVertexMap, setFlippedVertexMap] = useState({});
	const [previous, setPrevious] = useState({});
	const [speedProps, ] = useInput(1);

	const stepRef = useRef(STEP_INITIAL);
	const currentNodeIndexRef = useRef(currentNodeIndex);
	const unvisitedRef = useRef(unvisited);
	const visitedRef = useRef(visited);
	const shortestPathRef = useRef(shortestPath);
	const previousRef = useRef(previous);

	useEffect(() => {
		shortestPathRef.current = shortestPath;
	}, [shortestPath]);

	useEffect(() => {
		previousRef.current = previous;
	}, [previous]);

	useEffect(() => {
		unvisitedRef.current = unvisited;
	}, [unvisited]);

	useEffect(() => {
		visitedRef.current = visited;
	}, [visited]);

	useEffect(() => {
		setFlippedVertexMap(flip(vertexMap));
	}, [vertexMap]);

	useEffect(() => {
		stepRef.current = step;
	}, [step]);

	useEffect(() => {
		currentNodeIndexRef.current = currentNodeIndex;
	}, [currentNodeIndex]);

	const simulate = () => {
		switch (stepRef.current) {
			case STEP_INITIAL: {
				if (selectedVerticies.length === 0) {
					return;
				}

				const start = vertexMap[selectedVerticies[0]];

				modifyVertexSelectState({
					id: flippedVertexMap[start],
					selected: true
				});
				setCurrentNodeIndex(start);
				setStep(STEP_CALCULATE_COSTS);
				setPrevious({ [start]: null });
				updateRunResult({
					shortestPath: Object.fromEntries(Object.entries(vertexMap).map(([key, val]) => val !== start ? [key, I] : [key, 0])),
					unvisited: Object.fromEntries(Object.values(vertexMap).map(ele => [ele, true])),
					visited: {},
					paths: Object.fromEntries(spread(verticies.length, new Stack()).map((ele, index) => [index, ele]))
				});
				setStepExplanation(`Let's start by initializing the shortest path table with all the distances to all the vertices.\n
					\tThe distance from the vertex ${verticies[start].name} to itself is 0, to every other verticies is Infinity.\n
					\tUnvisited verticies and Visited verticies array so we can track down which verticies were visited and which haven't.\n
					\tNext step: Find the minimum value in the distances array and start the algorithm from that vertex.\n`);
				return;
			}
			case STEP_CALCULATE_COSTS: {
				clearSelectedEdges();

				const newUnvisited = {...unvisitedRef.current};
				const newVisited = {...visitedRef.current};
				const newShortestPath = {...shortestPathRef.current};
				const newPrevious = {...previousRef.current};
				let currentCost, calculatedCost;
				const start = currentNodeIndexRef.current;
				let highlightedEdges = [];
				const explanationElements = [];

				for (let i of neighbors[start].keys()) {
					if (neighbors[start][i] !== I && newUnvisited[i] === true) {
						currentCost = +newShortestPath[flippedVertexMap[i]];
						calculatedCost = +(newShortestPath[flippedVertexMap[start]] + neighbors[start][i]);
						highlightedEdges = [...highlightedEdges, ...edges.filter((ele, index) => ele.contains(flippedVertexMap[start]) && ele.contains(flippedVertexMap[i]))];
						explanationElements.push(`Current cost of ${verticies[i].name} is ${currentCost} and the calculated cost is ${calculatedCost} so we ${calculatedCost < currentCost ? "update the new cost" : "do nothing"}.`);
						
						if (calculatedCost < currentCost) {
							newShortestPath[flippedVertexMap[i]] = calculatedCost;
							newPrevious[i] = flippedVertexMap[start];
						}
					}
				}

				newVisited[start] = true;
				delete newUnvisited[start];

				modifyEdgesSelectState(highlightedEdges, true);
				setStep(STEP_LOCATE_MIN);
				setPrevious(newPrevious);
				updateRunResult({
					visited: newVisited,
					unvisited: newUnvisited,
					shortestPath: newShortestPath
				});

				const startVertexName = verticies[start].name;

				setStepExplanation(`We will now find the neighbor verticies of the vertex ${startVertexName}.\n
					If the costs from the vertex ${startVertexName} plus the costs to its neighbors verticies is lesser than their current costs, we will update those costs.\n
					In this case:\n${explanationElements.length === 0 ? "There's no neighbors." : explanationElements.join("\n")}\n
					This is called the 'RELAXATION' process.\n
					Before finshing this step, we will push the current vertex into the Visited array so we can be awared that we have already visited this vertex and won't be visiting it anymore.\n
					This process will be continued until the next minimum value of the shortest path table can not be found (only Infinity values left or the Unvisited array is empty).`);
				return;
			}
			case STEP_LOCATE_MIN: {
				const shortestPathVal = shortestPathRef.current;
				const oldUnvisited = unvisitedRef.current;
				const [newStart, min] = Object.keys(oldUnvisited).reduce(([minIndex, minValue], current) => {
					if (shortestPathVal[flippedVertexMap[current]] < minValue) {
						return [+current, shortestPathVal[flippedVertexMap[current]]];
					}

					return [minIndex, minValue];
				}, [-1, Infinity]);

				if (newStart === -1 || isEmpty(oldUnvisited)) {
					setStep(STEP_END);
					return;
				}

				setCurrentNodeIndex(newStart);
				setStep(STEP_HIGHLIGHT_NEXT_NODE);
				setStepExplanation(`The minimum value in the distances array is ${min} so we will continue from vertex ${verticies[newStart].name}.\n`);
				return;
			}
			case STEP_HIGHLIGHT_NEXT_NODE: {
				clearSelectedVerticies();
				modifyVertexSelectState({
					id: flippedVertexMap[currentNodeIndexRef.current],
					selected: true
				});
				setStep(STEP_CALCULATE_COSTS);
				return;
			}
			case STEP_END: {
				const previous = previousRef.current;

				clearSelectedVerticies();
				updateRunResult({
					paths: Object.fromEntries(
						Object.entries(previous)
							.map(([key, val], index) => {
								let current = previous[index];
								let path = new Stack().push(flippedVertexMap[index]);
								
								while (current != null) {
									path.push(current);
									current = previous[vertexMap[current]];
								}

								return [key, path];
							})
					)
				});
				setStep(STEP_INITIAL);
				setStepExplanation(`As you can see in the shortest path table, the next minimum value can not be found, so this will be the final step of the Algorithm.\n
					If your graph contains any vertices that are not connected to any other vertices, you will see that despite there are still some unvisited vertices the algorithm can not be applied on these vertices because it can not find it's next minimum value in the shortest path table due to their disconnections.`);
				return;
			}
			default: return;
		}
	};

	const onAutoplay = () => {
		if (selectedVerticies.length < 1) {
			setNoti("Select at least 1 vertex");
			return;
		}
		
		clearInterval(autoplayer);
		setAutoplayer(setInterval(simulate, hasLength(speedProps.value) ? speedProps.value * 1000 : 1000));
	};

	const stopAutoplay = () => {
		clearInterval(autoplayer);
	};

	const onStep = () => {
		if (selectedVerticies.length < 1) {
			setNoti("Select at least 1 vertex");
			return;
		}

		simulate();
	}

	return (
		<>
			<li>
				<NoFollow
					onClick={onStep}
					className="uk-button"
					uk-tooltip="Step forward"
				>
					<div uk-icon="play"></div>
				</NoFollow>
			</li>
			<li>
				<NoFollow
					onClick={onAutoplay}
					className="uk-button"
					uk-tooltip="Autoplay"
				>
					<div uk-icon="play-circle"></div>
				</NoFollow>
			</li>
			<li>
				<NoFollow
					onClick={stopAutoplay}
					className="uk-button"
				>
					<div
						uk-icon="ban"
						uk-tooltip="Pause"
					></div>
				</NoFollow>
			</li>
			<li
				uk-tooltip="Autoplay Speed"
			>
				<div style={{
					display: "flex",
				    justifyContent: "center",
				    alignItems: "center",
				    columnGap: "0.25em",
				    boxSizing: "border-box",
				    minHeight: "80px",
				    padding: "0 15px"
				}}>
					<input
						placeholder="Autoplay Speed"
						className="uk-input"
						type="number"
						min="1"
						step="0.1"
						{...speedProps}
						style={{width: "80px"}}
					/>
				</div>
			</li>
		</>
	);
}

function DijkstraRunner() {
	const {
		store: { vertexMap, neighbors },
		updateRunResult
	} = useDijkstra();
	const { store: { selectedVerticies } } = useGraph();

	const onRun = () => {
		if (selectedVerticies.length === 0) {
			return;
		}

		const flippedVertexMap = flip(vertexMap);
		let start = vertexMap[selectedVerticies[0]];
		let shortestPath = Object.fromEntries(Object.entries(vertexMap).map(([key, val]) => val !== start ? [key, I] : [key, 0]));
		let unvisited = Object.fromEntries(Object.values(vertexMap).map(ele => [ele, true]));
		let prev = Object.fromEntries(Object.entries(vertexMap).map(([key, val], index) => [val, null]))
		let visited = {};
		let currentCost, calculatedCost;

		while (!isEmpty(unvisited) && start !== -1) {
			for (let i of neighbors[start].keys()) {
				if (neighbors[start][i] !== I && unvisited[i] === true) {
					currentCost = +shortestPath[flippedVertexMap[i]];
					calculatedCost = +(shortestPath[flippedVertexMap[start]] + neighbors[start][i]);

					if (calculatedCost < currentCost) {
						shortestPath[flippedVertexMap[i]] = calculatedCost;
						prev[i] = flippedVertexMap[start];
					}
				}
			}

			visited[start] = true;
			delete unvisited[start];

			start = +Object.keys(unvisited).reduce(([minIndex, minValue], current) => {
				if (shortestPath[flippedVertexMap[current]] < minValue) {
					return [current, shortestPath[flippedVertexMap[current]]];
				}

				return [minIndex, minValue];
			}, [-1, Infinity])[0];
		}

		updateRunResult({
			shortestPath, unvisited,
			visited,
			paths: Object.fromEntries(
				Object.entries(prev)
					.map(([key, val], index) => {
						let current = prev[index];
						let path = new Stack().push(flippedVertexMap[index]);
						
						while (current != null) {
							path.push(current);
							current = prev[vertexMap[current]];
						}

						return [key, path];
					})
			)
		});
	};

	return (
		<>
			<li>
				<NoFollow
					onClick={onRun}
				>
					Execute
				</NoFollow>
			</li>
		</>
	);
}