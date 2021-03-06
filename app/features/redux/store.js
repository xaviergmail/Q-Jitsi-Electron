// @flow

import { createStore, compose } from 'redux';
import { persistReducer } from 'redux-persist';

import middleware from './middleware';
import reducers from './reducers';

const persistConfig = {
    key: 'root',
    storage: window.jitsiNodeAPI.createElectronStorage(),
    whitelist: [
        'onboarding',
        'recentList',
        'settings'
    ]
};

const persistedReducer = persistReducer(persistConfig, reducers);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(persistedReducer, composeEnhancers(middleware));

window.__REDUX_STORE = store;
export default store;
