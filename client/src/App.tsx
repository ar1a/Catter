import React from 'react';
import { CssBaseline, Container, createMuiTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import purple from '@material-ui/core/colors/purple';
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

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>Hello world</Container>
    </ThemeProvider>
  );
};

export default App;
