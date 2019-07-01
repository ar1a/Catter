import React from 'react';
import { Redirect } from 'react-router-dom';

import { useDispatch } from './user-state';

export const Logout = () => {
  const dispatch = useDispatch();
  dispatch({ type: 'logout' });
  return <Redirect to="/" />;
};
