import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  subtitle?: string;
}

interface ToastCtx {
  toasts: ToastItem[];
  showToast: (type: ToastType, title: string, subtitle?: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastCtx>({
  toasts: [],
  showToast: () => {},
  dismiss: () => {},
});

let _idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, subtitle?: string) => {
      const id = ++_idCounter;
      setToasts((prev) => [...prev, { id, type, title, subtitle }]);
      setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
