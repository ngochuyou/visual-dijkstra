import { useReducer, useState, useCallback } from 'react';

export const useDispatch = (initStore, dispatchers) => useReducer(
	(oldState, { type = null, payload = null } = {}) => {
		const dispatcher = dispatchers[type];
		
		return dispatcher != null ? dispatcher(payload, oldState) : oldState;
	}, {...initStore}
);

export const useToggle = (initState = false) => useReducer((oldState) => !oldState, initState);

export const useInput = initValue => {
	const [value, setValue] = useState(initValue);
	const onValueChange = useCallback((value) => setValue(value), []);

	return [
		{ value, onChange: (event) => setValue(event.target.value) },
		onValueChange
	];
}