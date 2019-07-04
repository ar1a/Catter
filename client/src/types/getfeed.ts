/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getfeed
// ====================================================

export interface getfeed_feed_author {
  __typename: "User";
  id: string;
  username: string;
}

export interface getfeed_feed_likedBy {
  __typename: "User";
  id: string;
  username: string;
}

export interface getfeed_feed_replyingTo_author {
  __typename: "User";
  id: string;
  username: string;
}

export interface getfeed_feed_replyingTo {
  __typename: "Meow";
  id: string;
  author: getfeed_feed_replyingTo_author;
}

export interface getfeed_feed {
  __typename: "Meow";
  id: string;
  content: string;
  author: getfeed_feed_author;
  likedBy: getfeed_feed_likedBy[];
  replyingTo: getfeed_feed_replyingTo | null;
}

export interface getfeed {
  feed: getfeed_feed[];
}
