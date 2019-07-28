import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';

import { getfeed, getfeed_feed } from './types/getfeed';
import { Meow } from './meow';
import { CreateMeow } from './create-meow';
import { useUserState } from './user-state';
import { Loader } from './loader';

const GET_FEED = gql`
  query getfeed {
    feed {
      id
      content
      author {
        id
        username
        name
      }
      likedBy {
        id
        name
        username
      }
      replyingTo {
        id
        author {
          id
          username
          name
        }
      }
    }
  }
`;

export const Feed = () => {
  const { data, error, loading } = useQuery<getfeed>(GET_FEED, {
    fetchPolicy: 'cache-and-network'
  } as any);

  const loggedIn = Boolean(useUserState('token'));
  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error! {error.message}</div>;
  }

  if (!data) {
    return <div>Unreachable error! Please report. id: 1</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {loggedIn && <CreateMeow />}
      {data.feed.map((meow: getfeed_feed) => (
        <Meow key={meow.id} meow={meow} />
      ))}
    </div>
  );
};
