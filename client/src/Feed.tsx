import React, { useContext } from 'react';
import gql from 'graphql-tag';
import { getfeed, getfeed_feed } from './types/getfeed';
import { useQuery } from 'react-apollo-hooks';
import { Meow } from './Meow';
import { CreateMeow } from './CreateMeow';
import { UserContext } from './State';

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
  const { data, error } = useQuery<getfeed>(GET_FEED, {
    suspend: true
  });

  const { token } = useContext(UserContext);
  const loggedIn = Boolean(token);
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
