import {
  Button,
  Container,
  TextField,
  Typography,
  InputAdornment
} from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import gql from 'graphql-tag';
import React, { useState, useCallback } from 'react';
import { useMutation } from 'react-apollo-hooks';
import { Redirect } from 'react-router-dom';
import { tryCatch, rightTask } from 'fp-ts/es6/TaskEither';
import { Task } from 'fp-ts/es6/Task';
import useForm from 'react-hook-form';

import { useDispatch } from './user-state';
import { login as LOGIN_TYPE, login_login } from './types/login';
import { register as REGISTER_TYPE, register_signup } from './types/register';

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
      }
    }
  }
`;

const REGISTER = gql`
  mutation register($username: String!, $password: String!) {
    signup(username: $username, password: $password) {
      token
      user {
        id
      }
    }
  }
`;

const useStyles = makeStyles(
  createStyles({
    paper: {
      marginTop: 64,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    submit: {
      margin: '24px 0px'
    }
  })
);

interface Data {
  username: string;
  password: string;
}

export const Login = () => {
  const { register, handleSubmit, errors } = useForm<Data>();
  const classes = useStyles({});
  const login = useMutation<LOGIN_TYPE>(LOGIN);
  const doRegister = useMutation<REGISTER_TYPE>(REGISTER);
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setRegister] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = useCallback(
    async ({ username, password }: Data) => {
      const dispatchLogin = ({ token }: register_signup | login_login) => {
        dispatch({ type: 'login', token, username });
        setRedirect(true);
      };

      const mutate = (): Promise<{
        result: { data: REGISTER_TYPE | LOGIN_TYPE };
      }> =>
        isRegister
          ? doRegister({ variables: { username, password } })
          : login({ variables: { username, password } });

      const sendMutation = tryCatch(
        mutate,
        (e: any) => e.graphQLErrors[0].message
      );

      // I can't get typechecking working here >:(
      const sendDispatch = (result: any) =>
        rightTask<string, void>(
          new Task(async () =>
            dispatchLogin(
              result.data.signup ? result.data.signup : result.data.login
            )
          )
        );

      return sendMutation
        .chain(sendDispatch)
        .fold(setError, a => a)
        .run();
    },
    [login, dispatch, isRegister, doRegister]
  );

  const onClick = useCallback(() => setRegister(!isRegister), [
    isRegister,
    setRegister
  ]);

  if (redirect) {
    return <Redirect to="/" />;
  }

  return (
    <Container maxWidth="xs">
      <div className={classes.paper}>
        <Typography variant="h4" gutterBottom>
          {(isRegister && 'Register') || 'Login'}
        </Typography>
        <Typography variant="subtitle1" color="error" gutterBottom>
          {error}
        </Typography>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Username"
            margin="normal"
            required
            fullWidth
            autoFocus
            error={Boolean(errors.username)}
            name="username"
            inputRef={register({ required: true })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">@</InputAdornment>
              )
            }}
            variant="outlined"
          />
          <TextField
            label="Password"
            required
            name="password"
            margin="normal"
            fullWidth
            error={Boolean(errors.password)}
            type="password"
            inputRef={register({ required: true })}
            variant="outlined"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            className={classes.submit}
          >
            {isRegister ? 'Register' : 'Login'}
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={onClick}
          >
            {isRegister ? 'Login' : 'Register'}
          </Button>
        </form>
      </div>
    </Container>
  );
};
