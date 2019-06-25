import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';
import { getuser } from './types/getuser';
import { RouteComponentProps } from 'react-router';
import { Grid, Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Meow } from './Meow';
import { Loader } from './Loader';
import ReactFitText from 'react-fittext';

const GET_USER = gql`
  query getuser($username: String!) {
    user(where: { username: $username }) {
      id
      meows {
        id
        content
        author {
          id
          username
        }
      }
    }
  }
`;

const useStyles = makeStyles(
  createStyles({
    username: {
      textAlign: 'center'
    }
  })
);

export const User: React.FC<RouteComponentProps<{ username: string }>> = ({
  match: {
    params: { username }
  }
}) => {
  const classes = useStyles({});
  const { data, error, loading } = useQuery<getuser>(GET_USER, {
    variables: { username }
  });

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>An error occured! {error.message}</div>;
  }
  if (!data) {
    return <div>An unreachable error occured! id: 2</div>;
  }

  if (!data.user) {
    return <div>User not found!</div>; // TODO: go back and show notification
  }
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <ReactFitText>
              <Typography variant="h3" className={classes.username}>
                {username}
              </Typography>
            </ReactFitText>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={8}>
        {(data.user.meows || []).map(meow => (
          <Meow key={meow.id} noUserRedirect meow={meow} />
        ))}
      </Grid>
    </Grid>
  );
};
