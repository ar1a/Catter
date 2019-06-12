/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: register
// ====================================================

export interface register_signup_user {
  __typename: "User";
  id: string;
}

export interface register_signup {
  __typename: "AuthPayload";
  token: string;
  user: register_signup_user;
}

export interface register {
  signup: register_signup;
}

export interface registerVariables {
  username: string;
  password: string;
}
