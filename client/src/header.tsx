import { AppBar, Button, Toolbar, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import React from 'react';

import { useUserState } from './user-state';
import { AdapterLink } from './utils';

const useStyles = makeStyles(
  createStyles({
    title: {
      flexGrow: 1
    }
  })
);

const HeaderButtons = ({
  authorized,
  username
}: {
  authorized: boolean;
  username: string | null;
}) =>
  authorized ? (
    <>
      <Button color="inherit" component={AdapterLink} to={`/${username}`}>
        profile
      </Button>
      <Button color="inherit" component={AdapterLink} to="/logout">
        logout
      </Button>
    </>
  ) : (
    <Button color="inherit" component={AdapterLink} to="/login">
      login
    </Button>
  );

export const Header = () => {
  const classes = useStyles({});
  const token = useUserState('token');
  const username = useUserState('username');
  const authorized = Boolean(token);
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            <Button size="large" color="inherit" component={AdapterLink} to="/">
              Catter
            </Button>
          </Typography>
          <HeaderButtons authorized={authorized} username={username} />
        </Toolbar>
      </AppBar>
    </div>
  );
};
