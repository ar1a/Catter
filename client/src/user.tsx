import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';
import { RouteComponentProps } from 'react-router';
import ReactFitText from 'react-fittext';
import { Link } from 'react-router-dom';
import ConditionalWrap from 'conditional-wrap';

import { Meow } from './meow';
import { Loader } from './loader';
import { getuser } from './types/getuser';
import { useUserState } from './user-state';

const GET_USER = gql`
  query getuser($username: String!) {
    user(where: { username: $username }) {
      id
      name

      meows {
        id
        content
        author {
          id
          username
          name
        }
        likedBy {
          id
          username
          name
        }
        replyingTo {
          id
          author {
            id
            username
            name
          }
        }
      }
    }
  }
`;

export const User: React.FC<RouteComponentProps<{ username: string }>> = ({
  match: {
    params: { username }
  }
}) => {
  const myUsername = useUserState('username');
  const { data, error, loading } = useQuery<getuser>(GET_USER, {
    variables: { username },
    fetchPolicy: 'cache-and-network'
  } as any);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>An error occured! {error.message}</div>;
  }
  if (!data) {
    return <div>An unreachable error occured! id: 2</div>;
  }

  if (!data.user) {
    return <div>User not found!</div>; // TODO: go back and show notification
  }
  return (
    <div className="flex mx-auto p-4 flex-wrap">
      <div className="w-full md:w-1/3 text-center mb-6">
        <div>
          <ReactFitText compressor={2}>
            <h1>
              <ConditionalWrap
                condition={myUsername === username}
                wrap={(children: React.ReactNode) => (
                  <Link to="/settings/name">{children}</Link>
                )}
              >
                {data.user.name || 'INVALID NAME'}
              </ConditionalWrap>
            </h1>
          </ReactFitText>
          <ReactFitText compressor={2.5}>
            <h2 className="text-gray-700">@{username}</h2>
          </ReactFitText>
        </div>
      </div>
      <div className="w-full md:w-2/3">
        {(data.user.meows || []).map(meow => (
          <Meow key={meow.id} noUserRedirect meow={meow} />
        ))}
      </div>
    </div>
  );
  /* return (
   *   <Grid container spacing={3}>
   *     <Grid item xs={12} md={4}>
   *       <Card>
   *         <CardContent>
   *           <ReactFitText>
   *             <Typography variant="h3" className={classes.name}>
   *               <ConditionalWrap
   *                 condition={myUsername === username}
   *                 wrap={(children: React.ReactNode) => (
   *                   <Link to="/settings/name" className={classes.link}>
   *                     {children}
   *                   </Link>
   *                 )}
   *               >
   *                 {data.user.name || 'INVALID NAME'}
   *               </ConditionalWrap>
   *             </Typography>
   *           </ReactFitText>
   *           <ReactFitText>
   *             <Typography variant="h5" className={classes.username}>
   *               @{username}
   *             </Typography>
   *           </ReactFitText>
   *         </CardContent>
   *       </Card>
   *     </Grid>
   *     <Grid item xs={12} md={8}>
   *       {(data.user.meows || []).map(meow => (
   *         <Meow key={meow.id} noUserRedirect meow={meow} />
   *       ))}
   *     </Grid>
   *   </Grid>
   * ); */
};
