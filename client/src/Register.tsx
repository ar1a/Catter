import { Button, Container, TextField, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import gql from 'graphql-tag';
import React, { useContext, useState } from 'react';
import { useMutation } from 'react-apollo-hooks';
import { Redirect } from 'react-router-dom';
import { UserContext } from './State';
// eslint-disable-next-line
import { register } from './types/register';
import { AdapterLink } from './Utils';

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

export const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const { setToken } = useContext(UserContext);

  const classes = useStyles({});

  const register = useMutation<register>(REGISTER, {
    variables: { username, password },
    update: (_proxy, result: { data: register }) => {
      console.log(result);
      localStorage.setItem('token', result.data.signup.token);
      setToken(result.data.signup.token);
      setRedirect(true);
    } // TODO: Move this to a .then in onSubmit?
  });

  if (redirect) {
    return <Redirect to="/" />;
  }

  // Disgusting code repetition
  const handleUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <Container maxWidth="xs">
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        {error}
        {/* TODO: Make this error pretty */}
        <form
          noValidate
          onSubmit={(event: React.ChangeEvent<HTMLFormElement>) => {
            event.preventDefault();
            register().catch(e => {
              setError(e.graphQLErrors[0].message);
            });
          }}
        >
          <TextField
            label="Username"
            value={username}
            margin="normal"
            required
            onChange={handleUsername}
            fullWidth
            autoFocus
            variant="outlined"
          />
          <TextField
            label="Password"
            margin="normal"
            required
            value={password}
            onChange={handlePassword}
            fullWidth
            type="password"
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
            Register
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            component={AdapterLink}
            to="/login"
          >
            Login
          </Button>
        </form>
      </div>
    </Container>
  );
};
