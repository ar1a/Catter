import { AppBar, Button, Toolbar, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import React from 'react';
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
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            <Button color="inherit" component={AdapterLink} to="/">
              Catter
            </Button>
          </Typography>
          <Button color="inherit" component={AdapterLink} to="/login">
            login
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
};
