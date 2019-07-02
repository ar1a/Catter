import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { Button } from '@material-ui/core';

export const AdapterLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => <Link innerRef={ref as any} {...props} />
);

// I cannot get the fucking type here to work, I give up!
export const ButtonLink: React.FC<any> = React.memo(
  ({ children, ...props }) => (
    <Button color="inherit" component={AdapterLink} {...props}>
      {children}
    </Button>
  )
);
