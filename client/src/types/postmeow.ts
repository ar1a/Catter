/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: postmeow
// ====================================================

export interface postmeow_postMeow_author {
  __typename: "User";
  id: string;
  username: string;
}

export interface postmeow_postMeow {
  __typename: "Meow";
  id: string;
  author: postmeow_postMeow_author;
}

export interface postmeow {
  postMeow: postmeow_postMeow;
}

export interface postmeowVariables {
  content: string;
}
