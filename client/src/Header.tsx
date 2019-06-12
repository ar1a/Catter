import { AppBar, Button, Toolbar, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import React, { useContext } from 'react';
import { UserContext } from './State';
import { AdapterLink } from './Utils';

const useStyles = makeStyles(
  createStyles({
    title: {
      flexGrow: 1
    }
  })
);

export const Header = () => {
  const classes = useStyles({});
  const { token } = useContext(UserContext);
  const isAuthorized = Boolean(token);
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            <Button size="large" color="inherit" component={AdapterLink} to="/">
              Catter
            </Button>
          </Typography>
          {isAuthorized ? (
            <Button color="inherit" component={AdapterLink} to="/logout">
              logout
            </Button>
          ) : (
            <Button color="inherit" component={AdapterLink} to="/login">
              login
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
};
