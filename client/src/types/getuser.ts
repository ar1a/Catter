/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getuser
// ====================================================

export interface getuser_user_meows_author {
  __typename: "User";
  id: string;
  username: string;
}

export interface getuser_user_meows {
  __typename: "Meow";
  id: string;
  content: string;
  author: getuser_user_meows_author;
}

export interface getuser_user {
  __typename: "User";
  id: string;
  meows: getuser_user_meows[];
}

export interface getuser {
  user: getuser_user | null;
}

export interface getuserVariables {
  username: string;
}
