/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: likemeow
// ====================================================

export interface likemeow_likeMeow_likedBy {
  __typename: "User";
  id: string;
  username: string;
}

export interface likemeow_likeMeow {
  __typename: "Meow";
  id: string;
  likedBy: likemeow_likeMeow_likedBy[];
}

export interface likemeow {
  likeMeow: likemeow_likeMeow | null;
}

export interface likemeowVariables {
  id: string;
}
