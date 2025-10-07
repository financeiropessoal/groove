
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

// FIX: Define an internal type that includes the state and setter for type safety.
interface InternalToastContextType extends ToastContextType {
  toasts: ToastMessage[];
  setToasts: React.Dispatch<React.SetStateAction<ToastMessage[]>>;
}

// FIX: Update context to use the more specific internal type.
const ToastContext = createContext<InternalToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = new Date().getTime();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 5000); // Auto-dismiss after 5 seconds
  }, []);
  
  // This state is internal to the provider but rendered by ToastContainer
  const value = { toasts, showToast, setToasts };

  return (
    // FIX: Removed unsafe 'as any' cast now that the context is correctly typed.
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// This is a bit of a hack to share state between the provider and the container
// without exposing setToasts to the public `useToast` hook.
export const useToastState = () => {
    const context = useContext(ToastContext);
    if(context === undefined) {
        throw new Error('useToastState must be used within a ToastProvider');
    }
    // FIX: Removed unsafe cast. The context is now correctly typed as InternalToastContextType.
    return context;
}
