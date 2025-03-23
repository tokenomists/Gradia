// frontend/src/contexts/ErrorContext.js
import { createContext, useContext, useState } from 'react';
import Toast from '@/components/auth/Toast'; // Make sure this path is correct

const ErrorContext = createContext();

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);
  
  const showError = (message) => {
    setError(message);
  };
  
  const clearError = () => {
    setError(null);
  };
  
  return (
    <ErrorContext.Provider value={{ showError, clearError }}>
      {children}
      {error && <Toast message={error} type="error" onClose={clearError} />}
    </ErrorContext.Provider>
  );
}

export function useError() {
  return useContext(ErrorContext);
}