import {
	createContext, useContext, useCallback
} from 'react';

import { useDispatch } from './utils-hooks';
import { NoFollow } from '../components/Link';

import { asIf, hasLength } from '../utils';

const SystemContext = createContext({});

export const useSystem = () => useContext(SystemContext);

const STORE = {
	notification: ""
};

const SET_NOTI = "SET_NOTI";

export default function SystemContextProvider({ children }) {
	const [store, dispatch] = useDispatch({ ...STORE }, dispatchers);

	const setNoti = useCallback((noti) => {
		dispatch({
			type: SET_NOTI,
			payload: noti || ""
		});

		setTimeout(() => {
			dispatch({
				type: SET_NOTI,
				payload: ""
			});
		}, 1000);
	}, [dispatch]);

	return <SystemContext.Provider value={{
		store, setNoti
	}}>
		{
			asIf(hasLength(store.notification)).then(() => (
				<div
					uk-alert=""
					className="uk-alert-primary uk-position-top-center"
					style={{zIndex: 10}}
				>
					<div className="uk-width-medium">
						<NoFollow
							className="uk-alert-close"
							uk-close=""
							onClick={() => setNoti(null)}
						></NoFollow>
						<div>{store.notification}</div>
					</div>
				</div>
			)).else()
		}
		{ children }
	</SystemContext.Provider>;
}

const dispatchers = {
	[SET_NOTI]: (payload, oldState) => {
		return {
			...oldState,
			notification: payload
		};
	}
};