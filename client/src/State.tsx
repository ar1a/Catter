import React from 'react';

export interface IUserContext {
  token: string | null;
  setToken: (token: string | null) => void;
}

export const UserContext = React.createContext<IUserContext>({
  token: localStorage.getItem('token'),
  setToken: () => {}
});
