import React, { createContext, useContext } from 'react';
import { useToast } from '../components/Toast';

interface ToastContextType {
  showSuccess: (title: string, message: string) => string;
  showError: (title: string, message: string) => string;
  showWarning: (title: string, message: string) => string;
  showInfo: (title: string, message: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={{
      showSuccess: toast.showSuccess,
      showError: toast.showError,
      showWarning: toast.showWarning,
      showInfo: toast.showInfo,
    }}>
      {children}
      <toast.ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};