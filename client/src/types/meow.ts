/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: meow
// ====================================================

export interface meow_author {
  __typename: "User";
  id: string;
  username: string;
  name: string;
}

export interface meow_likedBy {
  __typename: "User";
  id: string;
  username: string;
  name: string;
}

export interface meow {
  __typename: "Meow";
  id: string;
  content: string;
  author: meow_author;
  likedBy: meow_likedBy[];
}
