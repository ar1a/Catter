import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { CircularProgress } from '@material-ui/core';

const useStyles = makeStyles(
  createStyles({
    container: {
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      padding: 16
    }
  })
);

export const Loader = () => {
  const classes = useStyles({});
  return (
    <div className={classes.container}>
      <CircularProgress />
    </div>
  );
};
