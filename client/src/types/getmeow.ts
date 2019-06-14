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

export interface getmeow_meow {
  __typename: "Meow";
  id: string;
  content: string;
  author: getmeow_meow_author;
}

export interface getmeow {
  meow: getmeow_meow | null;
}

export interface getmeowVariables {
  id: string;
}
