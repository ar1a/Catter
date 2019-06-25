import { Button, Container, TextField, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import gql from 'graphql-tag';
import React, { useContext, useState } from 'react';
import { useMutation } from 'react-apollo-hooks';
import { Redirect } from 'react-router-dom';
import { UserContext } from './State';
// eslint-disable-next-line
import { login } from './types/login';
import { AdapterLink } from './Utils';
import useForm from 'react-hook-form';

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
  const classes = useStyles();
  const login = useMutation<login>(LOGIN);
  const [redirect, setRedirect] = useState(false);
  const { setToken } = useContext(UserContext);

  const onSubmit = async ({ username, password }: Data) => {
    try {
      const result = await login({ variables: { username, password } });
      console.log(result);
      localStorage.setItem('token', result.data.login.token);
      setToken(result.data.login.token);
      setRedirect(true);
    } catch (e) {
      console.error(e);
    }
  };

  if (redirect) {
    return <Redirect to="/" />;
  }

  return (
    <Container maxWidth="xs">
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Username *"
            margin="normal"
            fullWidth
            autoFocus
            error={Boolean(errors.username)}
            name="username"
            inputRef={register({ required: true })}
            variant="outlined"
          />
          <TextField
            label="Password *"
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
            Login
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            component={AdapterLink}
            to="/register"
          >
            Register
          </Button>
        </form>
      </div>
    </Container>
  );
};
