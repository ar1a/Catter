import { Container, createMuiTheme, CssBaseline } from '@material-ui/core';
import teal from '@material-ui/core/colors/teal';
import { ThemeProvider } from '@material-ui/styles';
import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  RouteProps,
  Switch
} from 'react-router-dom';

import './App.css';
import { Header } from './header';
import './jost/jost.css';
import { Login } from './login';
import { Logout } from './logout';
import { Provider, useUserState } from './user-state';
import { SettingsName } from './settings-name';
import { Feed } from './feed';
import { SingleMeow } from './meow';
import { User } from './user';

const theme = createMuiTheme({
  typography: {
    fontFamily: ['Jost', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(',')
  },
  palette: {
    type: 'dark',
    primary: teal,
    secondary: {
      main: '#f44336'
    }
  }
});

const PrivateRoute: React.FC<
  {
    component: any /*forgive me for i have sinned*/;
  } & RouteProps
> = ({ component: Component, ...rest }) => {
  const token = useUserState('token');
  const isAuthenticated = Boolean(token);
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

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <Provider>
      <div className="font-sans">
        <Router>
          <CssBaseline />
          <Header />
          <Container style={{ paddingTop: 16 }}>
            <Switch>
              <Route path="/" exact component={Feed} />
              <PrivateRoute path="/logout" component={Logout} />
              <Route path="/login" component={Login} />
              <PrivateRoute path="/settings/name" component={SettingsName} />
              <Route path="/:username/:id" component={SingleMeow} />
              <Route path="/:username" component={User} />
            </Switch>
          </Container>
        </Router>
      </div>
    </Provider>
  </ThemeProvider>
);

export default App;
