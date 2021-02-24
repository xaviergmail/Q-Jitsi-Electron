// @flow

/**
 * AtlasKit components will deflect from appearance if css-reset is not present.
 */
import '@atlaskit/css-reset';

import Spinner from '@atlaskit/spinner';
import { SpotlightManager } from '@atlaskit/onboarding';

import React, { Component, Suspense, useEffect } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { App } from './features/app';
import { persistor, store } from './features/redux';

import './i18n';

import CowBellWithRouter from '../frontend/src/CowBell'

/**
 * Component encapsulating App component with redux store using provider.
 */
class Root extends Component<*> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @returns {ReactElement}
     */
    render() {
        function CoolElement(){
            console.log('COOOL!')
            return <p>{Math.random()}</p>
        }
        return (
            <Provider store = { store }>
                <PersistGate
                    loading = { null }
                    persistor = { persistor }>
                    <SpotlightManager>
                        <Suspense fallback = { <Spinner /> } >
                        <CowBellWithRouter ><App cool="beans"><CoolElement/></App></CowBellWithRouter>
                        </Suspense>
                    </SpotlightManager>
                </PersistGate>
            </Provider>
        );
    }
}

/**
 * Render the main / root application.
 *
 * $FlowFixMe.
 */
render(<Root />,document.getElementById('app'));
