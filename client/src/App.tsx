import { Container, createMuiTheme, CssBaseline } from '@material-ui/core';
import purple from '@material-ui/core/colors/purple';
import { ThemeProvider } from '@material-ui/styles';
import gql from 'graphql-tag';
import React, { useState, useCallback } from 'react';
import { useQuery } from 'react-apollo-hooks';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  RouteProps
} from 'react-router-dom';
import './App.css';
import { Header } from './Header';
import './jost/jost.css';
import { Login } from './Login';
import { Logout } from './Logout';
import { UserContext, IUserContext } from './State';
import { getfeed } from './types/getfeed';

const theme = createMuiTheme({
  typography: {
    fontFamily: ['Jost', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(',')
  },
  palette: {
    type: 'dark',
    primary: purple,
    secondary: {
      main: '#f44336'
    }
  }
});

const GET_FEED = gql`
  query getfeed {
    feed {
      id
      content
    }
  }
`;

const Feed = () => {
  const { data, error, loading } = useQuery<getfeed>(GET_FEED, {
    suspend: true
  });
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error! {error.message}</div>;
  }

  return (
    <ul>
      {data!.feed.map((meow: any) => (
        <li key={meow.id}>{meow.content}</li>
      ))}
    </ul>
  );
};

const PrivateRoute: React.FC<
  {
    component: any /*forgive me for i have sinned*/;
  } & RouteProps
> = ({ component: Component, ...rest }) => {
  const isAuthenticated = Boolean(localStorage.getItem('token')); // TODO: Use context
  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{ pathname: '/login', state: { from: props.location } }}
          />
        )
      }
    />
  );
};

const App: React.FC = () => {
  const setToken = useCallback(token => {
    setUserState(u => ({ ...u, token }));
  }, []);

  const [userState, setUserState] = useState<IUserContext>({
    token: localStorage.getItem('token'),
    setToken
  });

  return (
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={userState}>
        <Router>
          <CssBaseline />
          <Header />
          <Container>
            <Route path="/" exact component={Feed} />
            <Route path="/login" component={Login} />
            <PrivateRoute path="/logout" component={Logout} />
          </Container>
        </Router>
      </UserContext.Provider>
    </ThemeProvider>
  );
};

export default App;
