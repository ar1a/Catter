import gql from 'graphql-tag';
import React, { useState, useCallback, useEffect } from 'react';
import { useMutation } from 'react-apollo-hooks';
import { Redirect } from 'react-router-dom';
import { chain, tryCatch, rightTask } from 'fp-ts/es6/TaskEither';
import { fold } from 'fp-ts/es6/Either';
import { pipe } from 'fp-ts/es6/pipeable';
import useForm from 'react-hook-form';
import classNames from 'classnames';

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
  mutation register($username: String!, $password: String!, $name: String!) {
    signup(username: $username, password: $password, name: $name) {
      token
      user {
        id
      }
    }
  }
`;

interface Data {
  username: string;
  name: string;
  password: string;
}

export const Login = () => {
  const { unregister, register, handleSubmit, errors, clearError } = useForm<
    Data
  >();
  const [login, { loading: loginLoading }] = useMutation<LOGIN_TYPE>(LOGIN);
  const [doRegister, { loading: registerLoading }] = useMutation<REGISTER_TYPE>(
    REGISTER
  );
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setRegister] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isRegister) {
      unregister('name');
      clearError('name');
    }
  }, [isRegister, unregister, clearError]);

  const onSubmit = useCallback(
    async ({ username, password, name }: Data) => {
      const dispatchLogin = ({ token }: register_signup | login_login) => {
        dispatch({ type: 'login', token, username });
        setRedirect(true);
      };

      const mutate = (): Promise<{
        result: { data: REGISTER_TYPE | LOGIN_TYPE };
      }> =>
        isRegister
          ? doRegister({ variables: { username, password, name } })
          : login({ variables: { username, password } });

      const sendMutation = tryCatch(
        mutate,
        (e: any) => e.graphQLErrors[0].message
      );

      // I can't get typechecking working here >:(
      const sendDispatch = (result: any) =>
        rightTask<string, void>(async () =>
          dispatchLogin(
            result.data.signup ? result.data.signup : result.data.login
          )
        );

      return pipe(
        sendMutation,
        chain(sendDispatch)
      )().then(e =>
        pipe(
          e,
          fold(setError, a => a)
        )
      );
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col align-center max-w-xs w-full mx-auto text-center py-32">
        <h1 className="text-2xl text-medium mb-4">
          {isRegister ? 'register' : 'login'}
        </h1>
        <h2
          className={classNames('text-lg mb-8', {
            'text-red-500': error
          })}
        >
          {error || 'see you on the flip side!'}
        </h2>
        <input
          name="username"
          placeholder="username"
          className={classNames(
            'w-full mb-4 rounded px-4 py-3 shadow border-l-4 focus:outline-none',
            {
              'cursor-not-allowed': registerLoading || loginLoading,
              'border-red-500': errors.username
            }
          )}
          ref={register({ required: true })}
        />
        {isRegister && (
          <input
            name="name"
            placeholder="name (editable)"
            className={classNames(
              'w-full mb-4 rounded px-4 py-3 shadow border-l-4',
              {
                'cursor-not-allowed': registerLoading || loginLoading,
                'border-red-500': errors.name
              }
            )}
            ref={register({ required: true, minLength: 3 })}
          />
        )}
        <input
          name="password"
          type="password"
          placeholder="password"
          className={classNames(
            'w-full mb-4 rounded px-4 py-3 shadow border-l-4',
            {
              'cursor-not-allowed': registerLoading || loginLoading,
              'border-red-500': errors.password
            }
          )}
          ref={register({ required: true })}
        />
        <button
          type="submit"
          className={classNames(
            'py-2 px-4 rounded focus:outline-none hover:bg-blue-700 bg-blue-500 text-white mb-4 shadow'
          )}
        >
          {isRegister ? 'register' : 'login'}
        </button>
        <button
          onClick={onClick}
          className="py-2 px-4 rounded focus:outline-none hover:bg-gray-500 hover:text-white text-gray-800"
        >
          {isRegister ? 'login' : 'register'}
        </button>
      </div>
    </form>
  );

  /* return (
   *   <Container maxWidth="xs">
   *     <div className={classes.paper}>
   *       <Typography variant="h4" gutterBottom>
   *         {(isRegister && 'Register') || 'Login'}
   *       </Typography>
   *       <Typography variant="subtitle1" color="error" gutterBottom>
   *         {error}
   *       </Typography>
   *       <form noValidate onSubmit={handleSubmit(onSubmit)}>
   *         <TextField
   *           label="Username"
   *           margin="normal"
   *           required
   *           fullWidth
   *           autoFocus
   *           error={Boolean(errors.username)}
   *           name="username"
   *           inputRef={register({ required: true })}
   *           InputProps={{
   *             startAdornment: (
   *               <InputAdornment position="start">@</InputAdornment>
   *             )
   *           }}
   *           variant="outlined"
   *         />
   *         {isRegister && (
   *           <TextField
   *             label="Name (changeable)"
   *             margin="normal"
   *             required
   *             fullWidth
   *             error={Boolean(errors.name)}
   *             name="name"
   *             inputRef={register({ required: true, minLength: 3 })}
   *             variant="outlined"
   *           />
   *         )}
   *         <TextField
   *           label="Password"
   *           required
   *           name="password"
   *           margin="normal"
   *           fullWidth
   *           error={Boolean(errors.password)}
   *           type="password"
   *           inputRef={register({ required: true })}
   *           variant="outlined"
   *         />
   *         <Button
   *           type="submit"
   *           fullWidth
   *           variant="contained"
   *           color="primary"
   *           size="large"
   *           className={classes.submit}
   *           disabled={loginLoading || registerLoading}
   *         >
   *           {isRegister ? 'Register' : 'Login'}
   *         </Button>
   *         <Button
   *           fullWidth
   *           variant="contained"
   *           color="secondary"
   *           onClick={onClick}
   *         >
   *           {isRegister ? 'Login' : 'Register'}
   *         </Button>
   *       </form>
   *     </div>
   *   </Container>
   * ); */
};
