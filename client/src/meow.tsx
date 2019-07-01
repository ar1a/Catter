import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  makeStyles,
  createStyles,
  Typography,
  CardActions,
  Button
} from '@material-ui/core';
import { Redirect, RouteComponentProps } from 'react-router';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo-hooks';
import { fade } from '@material-ui/core/styles';

import { getmeow } from './types/getmeow';
import { deletemeow } from './types/deletemeow';
import { Loader } from './loader';
import { useUserState } from './user-state';
import { AdapterLink } from './utils';

const useMeowRedirect = (): [boolean, ((e: React.MouseEvent) => void)] => {
  const [toMeow, setToMeow] = useState(false);

  const onCardClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setToMeow(true);
  }, []);

  return [toMeow, onCardClick];
};

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      margin: '0 0 16px',
      '&:hover': {
        backgroundColor: fade(
          theme.palette.text.primary,
          theme.palette.action.hoverOpacity
        ),
        cursor: 'pointer'
      }
    },
    username: {
      '&:hover': {
        backgroundColor: fade(
          theme.palette.text.primary,
          theme.palette.action.hoverOpacity
        ),
        cursor: 'pointer'
      }
    },
    delete: {
      marginLeft: 'auto'
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
  const myUsername = useUserState('username');
  const deleteMeow = useMutation<deletemeow>(DELETE_MEOW, {
    variables: { id },
    refetchQueries: ['getmeow', 'getuser', 'getfeed']
  });

  const onDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteMeow();
    },
    [deleteMeow]
  );

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
        <Typography
          color="textSecondary"
          gutterBottom
          onClick={onUserClick}
          className={classes.username}
        >
          @{username}
        </Typography>
        {content}
      </CardContent>
      {myUsername && myUsername === username && (
        <CardActions>
          <Button
            size="small"
            color="secondary"
            className={classes.delete}
            onClick={onDeleteClick}
          >
            Delete
          </Button>
        </CardActions>
      )}
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

const DELETE_MEOW = gql`
  mutation deletemeow($id: ID!) {
    deleteMeow(id: $id) {
      id
    }
  }
`;

interface Props {
  username: string;
  id: string;
}

export const SingleMeow: React.FC<RouteComponentProps<Props>> = ({ match }) => {
  const { data, error, loading } = useQuery<getmeow>(GET_MEOW, {
    variables: { id: match.params.id },
    fetchPolicy: 'cache-and-network'
  } as any);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error! {error.message}</div>;
  }

  if (!data) {
    return <div>Unreachable error! Please report. id: 3</div>;
  }

  if (!data.meow) {
    return (
      <div>
        Meow not found!{' '}
        <Button
          color="inherit"
          component={AdapterLink}
          to={`/${match.params.username}`}
        >
          To Profile
        </Button>
      </div>
    );
  }

  return <Meow meow={data.meow} noRedirect />;
};
