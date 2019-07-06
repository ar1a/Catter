import React, { useCallback } from 'react';
import {
  Card,
  CardContent,
  TextField,
  makeStyles,
  createStyles,
  CardActions,
  Button
} from '@material-ui/core';
import useForm from 'react-hook-form';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';
import { tryCatch } from 'fp-ts/es6/TaskEither';
import { fold } from 'fp-ts/es6/Either';
import * as R from 'ramda';

import { postmeow } from './types/postmeow';

const useStyles = makeStyles(
  createStyles({
    card: {
      marginBottom: 16
    }
  })
);

const POST_MEOW = gql`
  mutation postmeow($content: String!, $replyingTo: ID) {
    postMeow(content: $content, replyingTo: $replyingTo) {
      id
      author {
        id
        username
      }
      replyingTo {
        id
        replies {
          id
        }
      }
    }
  }
`;

interface Data {
  content: string;
}

export const CreateMeow: React.FC<{ replyingTo?: string }> = ({
  replyingTo
}) => {
  const classes = useStyles();

  const { register, handleSubmit, errors, reset } = useForm<Data>();
  const postMeow = useMutation<postmeow>(POST_MEOW, {
    refetchQueries: ['getfeed', 'getmeow']
  });

  const onSubmit = useCallback(
    ({ content }: Data) =>
      tryCatch(
        () => postMeow({ variables: { content, replyingTo } }),
        R.identity
      )().then(fold(console.error, reset)),
    [postMeow, reset, replyingTo]
  );

  return (
    <Card className={classes.card}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <TextField
            variant="outlined"
            name="content"
            multiline
            fullWidth
            error={Boolean(errors.content)}
            label={replyingTo ? 'Reply to Meow' : 'Post Meow'}
            inputRef={register({ required: true, maxLength: 240 })}
          />
        </CardContent>
        <CardActions>
          <Button
            size="large"
            variant="outlined"
            color="primary"
            type="submit"
            style={{ marginLeft: 'auto' }}
          >
            Post
          </Button>
        </CardActions>
      </form>
    </Card>
  );
};
