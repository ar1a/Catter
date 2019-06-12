import ApolloClient from 'apollo-boost';
import React, { Suspense } from 'react';
import { ApolloProvider } from 'react-apollo-hooks';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import * as serviceWorker from './serviceWorker';

const client = new ApolloClient({
  uri: 'http://localhost:4000',
  request: operation => {
    const token = localStorage.getItem('token');
    if (token) {
      operation.setContext({
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }
});

const WrappedApp = () => (
  <ApolloProvider client={client}>
    <Suspense fallback={<div>Loading...</div>}>
      <App />
    </Suspense>
  </ApolloProvider>
);

ReactDOM.render(<WrappedApp />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
