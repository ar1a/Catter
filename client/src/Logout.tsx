import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { UserContext } from './State';

export const Logout = () => {
  const { setToken } = useContext(UserContext);
  localStorage.removeItem('token');
  setToken(null);
  return <Redirect to="/" />;
};
