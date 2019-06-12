import React from 'react';
import { CssBaseline, Container, createMuiTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import purple from '@material-ui/core/colors/purple';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';
import './App.css';
import './jost/jost.css';

const theme = createMuiTheme({
  typography: {
    fontFamily: ['Jost', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(',')
  },
  palette: {
    type: 'dark',
    primary: purple,
    secondary: {
      main: '#f44336'
    }
  }
});

const GET_FEED = gql`
  query getfeed {
    feed {
      id
      content
    }
  }
`;

const Feed = () => {
  const { data, error, loading } = useQuery(GET_FEED, { suspend: true });
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error! {error.message}</div>;
  }

  return (
    <ul>
      {data.feed.map((meow: any) => (
        <li key={meow.id}>{meow.content}</li>
      ))}
    </ul>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Feed />
      </Container>
    </ThemeProvider>
  );
};

export default App;
