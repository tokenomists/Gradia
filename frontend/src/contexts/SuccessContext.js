// frontend/src/contexts/SuccessContext.js
import { createContext, useContext, useState } from 'react';
import Toast from '@/components/auth/Toast'; // Make sure this path is correct

const SuccessContext = createContext();

export function SuccessProvider({ children }) {
  const [success, setSuccess] = useState(null);

  const showSuccess = (message) => {
    setSuccess(message);
  };

  const clearSuccess = () => {
    setSuccess(null);
  };

  return (
    <SuccessContext.Provider value={{ showSuccess, clearSuccess }}>
      {children}
      {success && <Toast message={success} type="success" onClose={clearSuccess} />}
    </SuccessContext.Provider>
  );
}

export function useSuccess() {
  return useContext(SuccessContext);
}