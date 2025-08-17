import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import {createStore} from 'redux';
import { Provider } from 'react-redux';

import App from './App';
import reducer from './components/store/reducer';
const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__&& window.__REDUX_DEVTOOLS_EXTENSION__());
render(( 
    <BrowserRouter >
        <Provider store={store}>
            <App />
        </Provider>
    </BrowserRouter>
),document.getElementById('root'));