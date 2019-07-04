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

export interface postmeow_postMeow_replyingTo_replies {
  __typename: "Meow";
  id: string;
}

export interface postmeow_postMeow_replyingTo {
  __typename: "Meow";
  id: string;
  replies: postmeow_postMeow_replyingTo_replies[];
}

export interface postmeow_postMeow {
  __typename: "Meow";
  id: string;
  author: postmeow_postMeow_author;
  replyingTo: postmeow_postMeow_replyingTo | null;
}

export interface postmeow {
  postMeow: postmeow_postMeow;
}

export interface postmeowVariables {
  content: string;
  replyingTo?: string | null;
}
