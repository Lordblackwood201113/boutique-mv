import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

interface ToastContextValue {
  toast: (text: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((text: string, type: ToastType = 'success') => {
    const id = nextId++;
    setMessages((prev) => [...prev, { id, type, text }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        {messages.map((msg) => (
          <ToastItem key={msg.id} message={msg} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const ICON_MAP: Record<ToastType, React.ReactNode> = {
  success: <Check size={12} className="text-white" />,
  error: <AlertCircle size={12} className="text-white" />,
  info: <Info size={12} className="text-white" />,
};

const BG_MAP: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

function ToastItem({
  message,
  onDismiss,
}: {
  message: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(message.id), 3500);
    return () => clearTimeout(timer);
  }, [message.id, onDismiss]);

  return (
    <div className="pointer-events-auto animate-fade-in-up">
      <div className="bg-mv-black text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3">
        <div className={`${BG_MAP[message.type]} rounded-full p-1`}>
          {ICON_MAP[message.type]}
        </div>
        <span className="font-sans text-xs font-bold tracking-widest uppercase">
          {message.text}
        </span>
        <button
          onClick={() => onDismiss(message.id)}
          className="text-white/50 hover:text-white ml-2"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
