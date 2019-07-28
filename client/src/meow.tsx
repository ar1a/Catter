import React, { useState, useCallback } from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo-hooks';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { getmeow } from './types/getmeow';
import { deletemeow } from './types/deletemeow';
import { likemeow } from './types/likemeow';
import { Loader } from './loader';
import { useUserState } from './user-state';
import { CreateMeow } from './create-meow';

const useMeowRedirect = (): [boolean, ((e: React.MouseEvent) => void)] => {
  const [toMeow, setToMeow] = useState(false);

  const onCardClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setToMeow(true);
    },
    [setToMeow]
  );

  return [toMeow, onCardClick];
};

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
  const [toMeow, onCardClick] = useMeowRedirect();
  const [toUser, onUserClick] = useMeowRedirect();
  const myUsername = useUserState('username');
  const [deleteMeow, { loading: deleteLoading }] = useMutation<deletemeow>(
    DELETE_MEOW,
    {
      variables: { id },
      refetchQueries: ['getmeow', 'getuser', 'getfeed']
    }
  );
  const [likeMeow, { loading: likeLoading }] = useMutation<likemeow>(
    LIKE_MEOW,
    { variables: { id } }
  );

  const hasLiked = likedBy.filter(u => u.username === myUsername).length > 0;

  const likes = `${hasLiked ? 'un' : ''}like (${likedBy.length})`;

  const onDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!deleteLoading) deleteMeow();
    },
    [deleteMeow, deleteLoading]
  );

  const onLikeClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!likeLoading) likeMeow();
    },
    [likeMeow, likeLoading]
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
    <div
      className="w-full overflow-hidden rounded shadow-md bg-white mb-4 focus:outline-none text-gray-800 cursor-pointer"
      onClick={onCardClick}
    >
      <div className="block px-4 py-2 text-gray-600">
        <a
          onClick={onUserClick}
          href={`/${username}`}
          className="hover:bg-gray-500 hover:text-white px-2 -mx-2"
        >
          {name || 'INVALID NAME'} &middot; @{username}
          {replyingTo && ` · Replying to @${replyingTo.author.username}`}
        </a>
      </div>
      <div className="px-4 pb-4 text-xl">
        <h1>{content}</h1>
      </div>
      <div className="bg-gray-300 px-4 flex justify-between">
        <button
          className={classNames(
            'hover:bg-blue-200',
            'py-2',
            'px-4',
            '-ml-4',
            'rounded',
            hasLiked ? 'font-semibold' : 'font-medium',
            'focus:outline-none',
            {
              'cursor-not-allowed': likeLoading
            }
          )}
          onClick={onLikeClick}
        >
          {likes}
        </button>
        {myUsername && myUsername === username && (
          <button
            onClick={onDeleteClick}
            className={classNames(
              'hover:bg-gray-500',
              'hover:text-white',
              'py-2',
              'px-4',
              '-mr-4',
              'rounded',
              'focus:outline-none',
              'text-gray-800'
            )}
          >
            delete
          </button>
        )}
      </div>
    </div>
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
        <Link to={`/${match.params.username}`} className="border-b">
          To Profile
        </Link>
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
