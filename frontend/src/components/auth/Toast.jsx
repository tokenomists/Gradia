// components/Toast.js
import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'error', duration = 5000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const bgColor = type === 'error' ? 'bg-red-500' : 
                 type === 'success' ? 'bg-green-500' : 
                 type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-4 py-2 rounded shadow-lg max-w-md`}>
      <div className="flex items-center justify-between">
        <div className="mr-3">{message}</div>
        <button 
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }} 
          className="text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  );
}
