import React from 'react';
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
import { postmeow } from './types/postmeow';
import { useMutation } from 'react-apollo-hooks';

const useStyles = makeStyles(
  createStyles({
    card: {
      margin: '0 0 16px'
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

  const { register, handleSubmit, errors } = useForm<Data>();
  const postMeow = useMutation<postmeow>(POST_MEOW, {
    refetchQueries: ['getfeed']
  });

  const onSubmit = (data: Data) => {
    postMeow({ variables: { content: data.content } }).catch(console.error);
  };

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
