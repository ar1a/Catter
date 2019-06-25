import React from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch } from './UserState';

export const Logout = () => {
  const dispatch = useDispatch();
  dispatch({ type: 'logout' });
  return <Redirect to="/" />;
};
