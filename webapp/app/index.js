import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { CookiesProvider } from 'react-cookie';

import App from './components/App';

ReactDOM.render(
  <CookiesProvider>
    <App />
  </CookiesProvider>,
  document.getElementById('app'),
);