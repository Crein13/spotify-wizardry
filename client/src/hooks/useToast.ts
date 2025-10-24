import { useState, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'info';
export interface Toast {
  id: number;
  message: string;
  type?: ToastType;
}

export function useToast(timeout = 3000) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const showToast = (message: string, type: ToastType = 'info', customTimeout?: number) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, customTimeout ?? timeout);
  };

  return { toasts, showToast };
}
