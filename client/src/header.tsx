import React from 'react';
import { Link } from 'react-router-dom';

import { useUserState } from './user-state';

const HeaderButtons = ({
  authorized,
  username
}: {
  authorized: boolean;
  username: string | null;
}) =>
  authorized ? (
    <>
      <Link
        className="py-2 px-4 rounded focus:outline-none hover:bg-gray-500 text-white"
        to={`/${username}`}
      >
        profile
      </Link>
      <Link
        className="py-2 px-4 rounded focus:outline-none hover:bg-gray-500 text-white"
        to="/logout"
      >
        logout
      </Link>
    </>
  ) : (
    <Link
      className="py-2 px-4 rounded focus:outline-none hover:bg-gray-500 text-white"
      to="/login"
    >
      login
    </Link>
  );

export const Header = () => {
  const token = useUserState('token');
  const username = useUserState('username');
  const authorized = Boolean(token);
  return (
    <nav className="flex items-center justify-between flex-wrap bg-blue-500 px-6 py-4 shadow-md">
      <div className="mr-6 text-white">
        <Link to="/" className=" flex items-center flex-shrink-0">
          <svg
            className="fill-current h-6 w-6 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 489.576 489.576"
          >
            <path d="M330.973 255.208c-22.181-34.606-60.458-55.538-101.556-55.538-41.093 0-79.37 20.931-101.55 55.538l-61.063 95.255c-16.723 26.092-14.388 60.059 5.737 83.614 20.151 23.556 53.343 31.143 81.728 18.668l.019-.017a186.686 186.686 0 0 1 150.28.017c28.368 12.475 61.56 4.897 81.713-18.659 20.142-23.555 22.477-57.531 5.754-83.623l-61.062-95.255zM78.688 246.023c28.07-10.786 40.537-46.255 27.859-79.189-12.686-32.927-45.717-50.89-73.756-40.087-28.048 10.785-40.497 46.247-27.842 79.188 12.692 32.917 45.725 50.889 73.739 40.088zM188.936 186.381c36.563 0 66.215-34.815 66.215-77.741 0-42.944-29.652-77.758-66.215-77.758-36.553 0-66.206 34.813-66.206 77.758 0 42.926 29.653 77.741 66.206 77.741zM312.391 209.488c34.697 11.53 73.822-12.162 87.363-52.898 13.55-40.742-3.621-83.134-38.297-94.663-34.699-11.529-73.823 12.162-87.354 52.905-13.542 40.743 3.612 83.127 38.288 94.656zM469.653 197.798c-24.182-17.866-60.784-9.377-81.789 18.996-20.98 28.381-18.406 65.876 5.729 83.742 24.128 17.876 60.773 9.379 81.79-18.988 20.979-28.38 18.398-65.882-5.73-83.75z" />
          </svg>
          <span className="font-semibold text-xl tracking-tight">catter</span>
        </Link>
      </div>
      <div>
        <HeaderButtons authorized={authorized} username={username} />
      </div>
    </nav>
  );
};
