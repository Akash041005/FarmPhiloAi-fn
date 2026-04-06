import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiAlertTriangle, FiInfo, FiXCircle } from 'react-icons/fi';

const ToastContext = createContext(null);

const toastIcons = {
  success: FiCheck,
  error: FiX,
  warning: FiAlertTriangle,
  info: FiInfo
};

const toastStyles = {
  success: 'bg-green-500 border-green-400',
  error: 'bg-red-500 border-red-400',
  warning: 'bg-yellow-500 border-yellow-400',
  info: 'bg-blue-500 border-blue-400'
};

const iconStyles = {
  success: 'text-white',
  error: 'text-white',
  warning: 'text-black',
  info: 'text-white'
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 left-4 md:left-auto z-50 flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map(toast => {
            const Icon = toastIcons[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${toastStyles[toast.type]}`}
              >
                <Icon className={`w-5 h-5 ${iconStyles[toast.type]}`} />
                <p className="flex-1 text-sm font-medium text-white dark:text-black">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FiX className={`w-4 h-4 ${iconStyles[toast.type]}`} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};