import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {  ThemeProvider, createTheme } from '@mui/material/styles';
import './index.css'; // Your custom CSS
// the theme/ css styling for the react stepper material ui component
const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '10px !important',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '.MuiOutlinedInput-root': {
            padding: '8px !important',
            borderRadius: '6px',
            '&:focus': {
              outline: 'none !important',
            },
          },
          '.MuiAutocomplete-input': {
            border: 'none !important',
            margin: '0 !important',
            fontSize: '11px !important',
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          '&.MuiSvgIcon-fontSizeMedium.MuiStepIcon-root.Mui-completed': {
            color: '#27A445 !important',
          },
          '&.MuiSvgIcon-fontSizeMedium.MuiStepIcon-root.Mui-active': {
            color: '#175FDC !important',
          },
          '&.MuiSvgIcon-fontSizeMedium.MuiStepIcon-root': {
            height: '18px !important',
          },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          '&.Mui-active': {
            fontSize: '13px !important',
          },
          '&.MuiStepLabel-alternativeLabel': {
            fontSize: '11px !important',
          },
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    {/* render theme in the app with a theme provider */}
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);