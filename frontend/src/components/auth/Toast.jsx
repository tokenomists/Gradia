import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'error', duration = 5000, onClose }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Fade in animation
    const showTimer = setTimeout(() => {
      setVisible(true);
    }, 10);

    // Auto dismiss timer
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 300); // Duration of fade-out animation
  };

  if (!visible && !exiting) return null;

  // Toast configuration based on type
  const config = {
    error: {
      icon: <AlertCircle size={20} />,
      bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
      borderColor: 'border-l-4 border-red-700',
      shadowColor: 'shadow-red-500/30'
    },
    success: {
      icon: <CheckCircle size={20} />,
      bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
      borderColor: 'border-l-4 border-green-700',
      shadowColor: 'shadow-green-500/30'
    },
    warning: {
      icon: <AlertTriangle size={20} />,
      bgColor: 'bg-gradient-to-r from-amber-400 to-amber-500',
      borderColor: 'border-l-4 border-amber-600',
      shadowColor: 'shadow-amber-500/30'
    },
    info: {
      icon: <Info size={20} />,
      bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      borderColor: 'border-l-4 border-blue-700',
      shadowColor: 'shadow-blue-500/30'
    }
  };

  const { icon, bgColor, borderColor, shadowColor } = config[type] || config.info;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 ${bgColor} ${borderColor} 
        text-white rounded-lg ${shadowColor} shadow-lg max-w-md
        transform transition-all duration-300 ease-in-out
        ${visible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
        ${exiting ? 'translate-x-4 opacity-0' : ''}
      `}
    >
      <div className="p-4 flex items-center gap-3">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-grow mr-2">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button 
          onClick={handleClose}
          className="text-white opacity-70 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white/10"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
      <div className="h-1 bg-white/20 rounded-b-lg overflow-hidden">
        <div 
          className="h-full bg-white/40"
          style={{ 
            width: '100%',
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}