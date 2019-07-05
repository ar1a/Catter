/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: setname
// ====================================================

export interface setname_setName {
  __typename: "User";
  id: string;
  username: string;
  name: string;
}

export interface setname {
  setName: setname_setName;
}

export interface setnameVariables {
  name: string;
}
