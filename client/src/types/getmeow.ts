/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getmeow
// ====================================================

export interface getmeow_meow_author {
  __typename: "User";
  id: string;
  username: string;
}

export interface getmeow_meow_likedBy {
  __typename: "User";
  id: string;
  username: string;
}

export interface getmeow_meow_replies_author {
  __typename: "User";
  id: string;
  username: string;
}

export interface getmeow_meow_replies_likedBy {
  __typename: "User";
  id: string;
  username: string;
}

export interface getmeow_meow_replies_replyingTo_author {
  __typename: "User";
  id: string;
  username: string;
}

export interface getmeow_meow_replies_replyingTo_likedBy {
  __typename: "User";
  id: string;
  username: string;
}

export interface getmeow_meow_replies_replyingTo {
  __typename: "Meow";
  id: string;
  content: string;
  author: getmeow_meow_replies_replyingTo_author;
  likedBy: getmeow_meow_replies_replyingTo_likedBy[];
}

export interface getmeow_meow_replies {
  __typename: "Meow";
  id: string;
  content: string;
  author: getmeow_meow_replies_author;
  likedBy: getmeow_meow_replies_likedBy[];
  replyingTo: getmeow_meow_replies_replyingTo | null;
}

export interface getmeow_meow_replyingTo_author {
  __typename: "User";
  id: string;
  username: string;
}

export interface getmeow_meow_replyingTo_likedBy {
  __typename: "User";
  id: string;
  username: string;
}

export interface getmeow_meow_replyingTo {
  __typename: "Meow";
  id: string;
  content: string;
  author: getmeow_meow_replyingTo_author;
  likedBy: getmeow_meow_replyingTo_likedBy[];
}

export interface getmeow_meow {
  __typename: "Meow";
  id: string;
  content: string;
  author: getmeow_meow_author;
  likedBy: getmeow_meow_likedBy[];
  replies: getmeow_meow_replies[];
  replyingTo: getmeow_meow_replyingTo | null;
}

export interface getmeow {
  meow: getmeow_meow | null;
}

export interface getmeowVariables {
  id: string;
}
