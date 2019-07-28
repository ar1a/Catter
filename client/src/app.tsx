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
  <Provider>
    <div className="font-sans">
      <Router>
        <Header />
        <div className="container mx-auto pt-4 max-w-2xl sm:px-4">
          <Switch>
            <Route path="/" exact component={Feed} />
            <PrivateRoute path="/logout" component={Logout} />
            <Route path="/login" component={Login} />
            <PrivateRoute path="/settings/name" component={SettingsName} />
            <Route path="/:username/:id" component={SingleMeow} />
            <Route path="/:username" component={User} />
          </Switch>
        </div>
      </Router>
    </div>
  </Provider>
);

export default App;
