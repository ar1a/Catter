import React, { createContext, useReducer, useContext, useEffect } from 'react';

export const initialState = {
  token: localStorage.getItem('token'),
  username: localStorage.getItem('username')
};

export type State = typeof initialState;

export type Action =
  | { type: 'login'; token: string; username: string }
  | { type: 'logout' };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'login':
      return {
        ...state,
        token: action.token,
        username: action.username
      };
    case 'logout':
      return {
        ...state,
        token: null,
        username: null
      };
    default:
      return state;
  }
};

const stateCtx = createContext(initialState);
const dispatchCtx = createContext((() => 0) as React.Dispatch<Action>);

export const Provider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (state.token) localStorage.setItem('token', state.token);
    else localStorage.removeItem('token');
  }, [state.token]);

  useEffect(() => {
    if (state.username) localStorage.setItem('username', state.username);
    else localStorage.removeItem('username');
  }, [state.username]);

  return (
    <dispatchCtx.Provider value={dispatch}>
      <stateCtx.Provider value={state}>{children}</stateCtx.Provider>
    </dispatchCtx.Provider>
  );
};

export const useDispatch = () => {
  return useContext(dispatchCtx);
};

export const useUserState = <K extends keyof State>(property: K) => {
  const state = useContext(stateCtx);
  return state[property];
};
