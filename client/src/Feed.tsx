import React from 'react';
import gql from 'graphql-tag';
import { getfeed, getfeed_feed } from './types/getfeed';
import { useQuery } from 'react-apollo-hooks';
import { Meow } from './Meow';
import { CreateMeow } from './CreateMeow';
import { useUserState } from './UserState';
import { Loader } from './Loader';

const GET_FEED = gql`
  query getfeed {
    feed {
      id
      content
      author {
        id
        username
      }
    }
  }
`;

export const Feed = () => {
  const { data, error, loading } = useQuery<getfeed>(GET_FEED);

  const token = useUserState('token');
  const loggedIn = Boolean(token);
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
    <>
      {loggedIn && <CreateMeow />}
      {data.feed.map((meow: getfeed_feed) => (
        <Meow key={meow.id} meow={meow} />
      ))}
    </>
  );
};
