import { AppBar, Button, Toolbar, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import React from 'react';

import { useUserState } from './user-state';
import { ButtonLink } from './utils';

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
      <ButtonLink to={`/${username}`}>profile</ButtonLink>
      <ButtonLink to="/logout">logout</ButtonLink>
    </>
  ) : (
    <ButtonLink to="/login">login</ButtonLink>
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
            <ButtonLink size="large" to="/">
              Catter
            </ButtonLink>
          </Typography>
          <HeaderButtons authorized={authorized} username={username} />
        </Toolbar>
      </AppBar>
    </div>
  );
};
