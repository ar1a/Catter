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
import { likemeow } from './types/likemeow';
import { Loader } from './loader';
import { useUserState } from './user-state';
import { ButtonLink } from './utils';
import { CreateMeow } from './create-meow';

const useMeowRedirect = (): [boolean, ((e: React.MouseEvent) => void)] => {
  const [toMeow, setToMeow] = useState(false);

  const onCardClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setToMeow(true);
    },
    [setToMeow]
  );

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
      },
      wordWrap: 'break-word'
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
  meow: {
    id: string;
    content: string;
    author: { username: string; name: string };
    likedBy: { username: string; name: string }[];
    replyingTo?: {
      id: string;
      author: { username: string; id: string; name: string };
    } | null;
  };
  noRedirect?: boolean;
  noUserRedirect?: boolean;
}> = ({
  meow: {
    id,
    content,
    author: { username, name },
    likedBy,
    replyingTo
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
  const likeMeow = useMutation<likemeow>(LIKE_MEOW, { variables: { id } });

  const likes = `Like (${likedBy.length})`;

  const hasLiked = likedBy.filter(u => u.username === myUsername).length > 0;

  const onDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteMeow();
    },
    [deleteMeow]
  );

  const onLikeClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      likeMeow();
    },
    [likeMeow]
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
          {name || 'INVALID NAME'} · @{username}
          {replyingTo && ` · Replying to @${replyingTo.author.username}`}
        </Typography>
        <Typography variant="h5" component="p">
          {content}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="medium"
          color={hasLiked ? 'primary' : undefined}
          onClick={onLikeClick}
        >
          {likes}
        </Button>
        {myUsername && myUsername === username && (
          <Button
            size="small"
            color="secondary"
            className={classes.delete}
            onClick={onDeleteClick}
          >
            Delete
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

const GET_MEOW = gql`
  fragment meow on Meow {
    id
    content
    author {
      id
      username
      name
    }
    likedBy {
      id
      username
      name
    }
  }
  query getmeow($id: ID!) {
    meow(where: { id: $id }) {
      ...meow
      replies {
        ...meow
        replyingTo {
          ...meow
        }
      }
      replyingTo {
        ...meow
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

const LIKE_MEOW = gql`
  mutation likemeow($id: ID!) {
    likeMeow(id: $id) {
      id
      likedBy {
        id
        username
        name
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
        <ButtonLink to={`/${match.params.username}`}>To Profile</ButtonLink>
      </div>
    );
  }

  return (
    <>
      {data.meow.replyingTo && (
        <Meow meow={data.meow.replyingTo} key={'replyingTo' + data.meow.id} />
      )}
      <Meow meow={data.meow} key={'single' + data.meow.id} noRedirect />
      <CreateMeow replyingTo={data.meow.id} />
      {data.meow.replies.map(reply => (
        <Meow meow={reply} key={'replies' + reply.id} />
      ))}
    </>
  );
};
