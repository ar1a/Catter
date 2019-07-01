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

import { postmeow } from './types/postmeow';

const useStyles = makeStyles(
  createStyles({
    card: {
      marginBottom: 16
    }
  })
);

const POST_MEOW = gql`
  mutation postmeow($content: String!) {
    postMeow(content: $content) {
      id
      author {
        id
        username
      }
    }
  }
`;

interface Data {
  content: string;
}

export const CreateMeow = () => {
  const classes = useStyles();

  const { register, handleSubmit, errors, reset } = useForm<Data>();
  const postMeow = useMutation<postmeow>(POST_MEOW, {
    refetchQueries: ['getfeed']
  });

  const onSubmit = useCallback(
    async (data: Data) => {
      try {
        await postMeow({ variables: { content: data.content } });
        reset();
      } catch (error) {
        console.error(error);
      }
    },
    [postMeow, reset]
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
            label="Post Meow"
            inputRef={register({ required: true, maxLength: 240 })}
          />
        </CardContent>
        <CardActions>
          <Button
            size="large"
            variant="contained"
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
