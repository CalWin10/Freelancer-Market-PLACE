import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Icon from "../components/common/Icon";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastInput {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastRecord extends ToastInput {
  id: number;
}

interface ToastContextValue {
  showToast: (toast: ToastInput) => number;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

const TOAST_ICON: Record<ToastType, "check-circle" | "error" | "warning" | "info"> = {
  success: "check-circle",
  error: "error",
  warning: "warning",
  info: "info",
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, number>());

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (input: ToastInput): number => {
      const id = nextId.current;
      nextId.current += 1;
      const toast = { ...input, id };

      setToasts((current) => [...current.slice(-3), toast]);

      const duration = input.duration ?? (input.type === "error" ? 6500 : 4500);
      if (duration > 0) {
        const timer = window.setTimeout(() => dismissToast(id), duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ showToast, dismissToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-label="Notifications">
        {toasts.map((toast) => (
          <div
            className={`toast toast--${toast.type}`}
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            aria-live={toast.type === "error" ? "assertive" : "polite"}
          >
            <span className="toast__icon" aria-hidden="true">
              <Icon name={TOAST_ICON[toast.type]} size={20} />
            </span>
            <div className="toast__content">
              <strong className="toast__title">{toast.title}</strong>
              {toast.message && <p className="toast__message">{toast.message}</p>}
            </div>
            <button
              className="toast__close"
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
