import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  makeStyles,
  createStyles,
  Typography
} from '@material-ui/core';
import { Redirect, RouteComponentProps } from 'react-router';
import gql from 'graphql-tag';
import { getmeow } from './types/getmeow';
import { useQuery } from 'react-apollo-hooks';
import { Loader } from './Loader';

const useMeowRedirect = (): [boolean, ((e: React.MouseEvent) => void)] => {
  const [toMeow, setToMeow] = useState(false);

  const onCardClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setToMeow(true);
  }, []);

  return [toMeow, onCardClick];
};

const useStyles = makeStyles(
  createStyles({
    card: {
      margin: '0 0 16px'
    }
  })
);

export const Meow: React.FC<{
  meow: { id: string; content: string; author: { username: string } };
  noRedirect?: boolean;
  noUserRedirect?: boolean;
}> = ({
  meow: {
    id,
    content,
    author: { username }
  },
  noRedirect,
  noUserRedirect
}) => {
  const classes = useStyles();

  const [toMeow, onCardClick] = useMeowRedirect();
  const [toUser, onUserClick] = useMeowRedirect();

  if (!noRedirect) {
    if (toMeow) {
      return <Redirect to={`/${username}/${id}`} />;
    }
  }

  if (!noUserRedirect) {
    if (toUser) {
      return <Redirect to={`/${username}`} />;
    }
  }
  return (
    <Card className={classes.card} onClick={onCardClick}>
      <CardContent>
        <Typography color="textSecondary" gutterBottom onClick={onUserClick}>
          {username}
        </Typography>
        {content}
      </CardContent>
    </Card>
  );
};

const GET_MEOW = gql`
  query getmeow($id: ID!) {
    meow(where: { id: $id }) {
      id
      content
      author {
        id
        username
      }
    }
  }
`;

interface Props {
  username: string;
  id: string;
}

export const SingleMeow: React.FC<RouteComponentProps<Props>> = ({ match }) => {
  const { data, error, loading } = useQuery<getmeow>(GET_MEOW, {
    variables: { id: match.params.id }
  });

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error! {error.message}</div>;
  }

  if (!data) {
    return <div>Unreachable error! Please report. id: 1</div>;
  }

  if (!data.meow) {
    return <div>Meow not found!</div>;
  }

  return <Meow meow={data.meow} noRedirect />;
};
