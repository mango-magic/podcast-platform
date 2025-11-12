import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToast({ ...toast, open: false });
  };

  const getAlertStyles = (severity) => {
    const styles = {
      success: {
        backgroundColor: 'rgba(0, 255, 136, 0.15)',
        border: '1px solid rgba(0, 255, 136, 0.4)',
        color: '#00ff88',
        backdropFilter: 'blur(10px)',
      },
      error: {
        backgroundColor: 'rgba(255, 51, 102, 0.15)',
        border: '1px solid rgba(255, 51, 102, 0.4)',
        color: '#ff3366',
        backdropFilter: 'blur(10px)',
      },
      warning: {
        backgroundColor: 'rgba(255, 170, 0, 0.15)',
        border: '1px solid rgba(255, 170, 0, 0.4)',
        color: '#ffaa00',
        backdropFilter: 'blur(10px)',
      },
      info: {
        backgroundColor: 'rgba(0, 212, 255, 0.15)',
        border: '1px solid rgba(0, 212, 255, 0.4)',
        color: '#00d4ff',
        backdropFilter: 'blur(10px)',
      },
    };
    return styles[severity] || styles.info;
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            background: 'transparent',
          },
        }}
      >
        <Alert 
          onClose={handleClose} 
          severity={toast.severity} 
          sx={{ 
            ...getAlertStyles(toast.severity),
            width: '100%',
            fontWeight: 500,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
