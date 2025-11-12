import { createTheme } from '@mui/material/styles';

export const futuristicTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
      light: '#5dffff',
      dark: '#00a3cc',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ff00ff',
      light: '#ff5dff',
      dark: '#cc00cc',
      contrastText: '#ffffff',
    },
    success: {
      main: '#00ff88',
      light: '#5dffaa',
      dark: '#00cc6a',
    },
    warning: {
      main: '#ffaa00',
      light: '#ffcc5d',
      dark: '#cc8800',
    },
    error: {
      main: '#ff3366',
      light: '#ff6699',
      dark: '#cc2852',
    },
    background: {
      default: '#0a0e27',
      paper: 'rgba(15, 20, 40, 0.8)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 800,
      background: 'linear-gradient(135deg, #00d4ff 0%, #ff00ff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontWeight: 700,
      background: 'linear-gradient(135deg, #00d4ff 0%, #ff00ff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 0 20px rgba(0, 212, 255, 0.1)',
    '0 0 30px rgba(0, 212, 255, 0.15)',
    '0 0 40px rgba(0, 212, 255, 0.2)',
    '0 0 50px rgba(0, 212, 255, 0.25)',
    '0 0 60px rgba(0, 212, 255, 0.3)',
    '0 0 70px rgba(0, 212, 255, 0.35)',
    '0 0 80px rgba(0, 212, 255, 0.4)',
    '0 0 90px rgba(0, 212, 255, 0.45)',
    '0 0 100px rgba(0, 212, 255, 0.5)',
    '0 0 110px rgba(0, 212, 255, 0.55)',
    '0 0 120px rgba(0, 212, 255, 0.6)',
    '0 0 130px rgba(0, 212, 255, 0.65)',
    '0 0 140px rgba(0, 212, 255, 0.7)',
    '0 0 150px rgba(0, 212, 255, 0.75)',
    '0 0 160px rgba(0, 212, 255, 0.8)',
    '0 0 170px rgba(0, 212, 255, 0.85)',
    '0 0 180px rgba(0, 212, 255, 0.9)',
    '0 0 190px rgba(0, 212, 255, 0.95)',
    '0 0 200px rgba(0, 212, 255, 1)',
    '0 0 210px rgba(0, 212, 255, 1)',
    '0 0 220px rgba(0, 212, 255, 1)',
    '0 0 230px rgba(0, 212, 255, 1)',
    '0 0 240px rgba(0, 212, 255, 1)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 212, 255, 0.4)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
          boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5dffff 0%, #00d4ff 100%)',
            boxShadow: '0 8px 25px rgba(0, 212, 255, 0.5)',
          },
        },
        outlined: {
          borderColor: '#00d4ff',
          color: '#00d4ff',
          borderWidth: 2,
          '&:hover': {
            borderColor: '#5dffff',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 20, 40, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: 'rgba(0, 212, 255, 0.4)',
            boxShadow: '0 8px 30px rgba(0, 212, 255, 0.2)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            '& fieldset': {
              borderColor: 'rgba(0, 212, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 212, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00d4ff',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: 'rgba(0, 212, 255, 0.15)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          color: '#00d4ff',
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10, 14, 39, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 212, 255, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: 'rgba(15, 20, 40, 0.8)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
});

