import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: 'fas fa-check-circle',
    bgClass: 'bg-green-600',
  },
  error: {
    icon: 'fas fa-times-circle',
    bgClass: 'bg-red-600',
  },
  info: {
    icon: 'fas fa-info-circle',
    bgClass: 'bg-blue-600',
  },
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 500); // Match animation duration
    }, 4500);

    return () => clearTimeout(timer);
  }, [onClose]);
  
  const handleClose = () => {
      setExiting(true);
      setTimeout(onClose, 500);
  }

  const { icon, bgClass } = toastConfig[type];

  return (
    <div
      className={`relative w-80 max-w-sm p-4 rounded-lg shadow-2xl text-white flex items-start gap-4 overflow-hidden ${bgClass} ${exiting ? 'toast-out' : 'toast-in'}`}
      role="alert"
    >
      <div className="flex-shrink-0 text-xl">
        <i className={icon}></i>
      </div>
      <div className="flex-grow text-sm">
        <p>{message}</p>
      </div>
      <button onClick={handleClose} className="ml-4 flex-shrink-0 text-lg opacity-70 hover:opacity-100" aria-label="Fechar">
        &times;
      </button>
       <div className={`absolute bottom-0 left-0 h-1 bg-white/30 w-full animate-toast-progress`}></div>
       <style>{`
            @keyframes toast-progress {
                from { width: 100%; }
                to { width: 0%; }
            }
            .animate-toast-progress {
                animation: toast-progress 4.5s linear forwards;
            }
       `}</style>
    </div>
  );
};

export default Toast;