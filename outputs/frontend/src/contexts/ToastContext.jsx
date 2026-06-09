import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const ToastContext = createContext();

const Toast = ({ toast, onClose }) => {
  const icons = { success: CheckCircle, error: AlertCircle, info: AlertCircle };
  const Icon = icons[toast.type] || AlertCircle;
  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center gap-2 border-l-4 border-blue-500 z-50">
      <Icon className="w-5 h-5 text-blue-500" />
      <span>{toast.message}</span>
      <button onClick={onClose}><X className="w-4 h-4" /></button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);
  return (
    <ToastContext.Provider value={{ success: (msg) => addToast(msg, 'success'), error: (msg) => addToast(msg, 'error'), info: addToast }}>
      {children}
      {toasts.map(t => <Toast key={t.id} toast={t} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />)}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
