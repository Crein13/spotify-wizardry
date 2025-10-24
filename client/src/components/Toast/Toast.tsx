import React from 'react';
import './Toast.css';

interface ToastProps {
  id: number;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info' }) => {
  return (
    <div className={`toast ${type}`}>
      {message}
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastProps[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="toasts" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} />
      ))}
    </div>
  );
};
