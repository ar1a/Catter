import React, { useCallback } from 'react';
import useForm from 'react-hook-form';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import classNames from 'classnames';
import TextareaAutosize from 'react-textarea-autosize';

import { postmeow } from './types/postmeow';

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
  const { register, handleSubmit, errors, watch } = useForm<Data>();
  const [postMeow, { loading }] = useMutation<postmeow>(POST_MEOW, {
    refetchQueries: ['getfeed', 'getmeow']
  });

  const onSubmit = useCallback(
    ({ content }: Data) => postMeow({ variables: { content, replyingTo } }),
    [postMeow, replyingTo]
  );

  const content = watch('content') || '';

  return (
    <div className="relative h-32">
      <div className="overflow-hidden rounded shadow-md bg-white mb-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-4 py-2 flex flex-wrap items-center">
            <TextareaAutosize
              placeholder={replyingTo ? 'Meow your reply' : "What's happening?"}
              name="content"
              inputRef={register}
              className={classNames(
                'w-full',
                'py-3',
                'px-3',
                'appearance-none',
                'focus:outline-none',
                'resize-none',
                'text-gray-800',
                'text-xl',
                'overflow-y-hidden',
                'transition-height-.1'
              )}
              useCacheForDOMMeasurements
            ></TextareaAutosize>
            <div className="ml-auto flex">
              <CircularProgressbar
                value={(content.length / 280) * 100}
                text={
                  280 - content.length < 20
                    ? (280 - content.length).toString()
                    : ''
                }
                className="w-8"
                styles={buildStyles({
                  textSize: '2.25rem'
                })}
              />
              <button
                className={classNames(
                  'ml-4',
                  'px-4',
                  'py-2',
                  'rounded-full',
                  'bg-blue-500',
                  'hover:bg-blue-700',
                  'text-white'
                )}
                type="submit"
              >
                post
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
  /* return (
   *   <Card className={classes.card}>
   *     <form onSubmit={handleSubmit(onSubmit)}>
   *       <CardContent>
   *         <TextField
   *           variant="outlined"
   *           name="content"
   *           multiline
   *           fullWidth
   *           error={Boolean(errors.content)}
   *           label={replyingTo ? 'Reply to Meow' : 'Post Meow'}
   *           inputRef={register({ required: true, maxLength: 240 })}
   *         />
   *       </CardContent>
   *       <CardActions>
   *         <Button
   *           size="large"
   *           variant="outlined"
   *           color="primary"
   *           type="submit"
   *           style={{ marginLeft: 'auto' }}
   *           disabled={loading}
   *         >
   *           Post
   *         </Button>
   *       </CardActions>
   *     </form>
   *   </Card>
   * ); */
};
