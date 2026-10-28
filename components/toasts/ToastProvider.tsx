import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";
import {
  useToasts,
  toastStore,
  TOAST_DURATION_MS,
  TOAST_EXIT_MS,
  type Toast,
} from "./toastStore";

const config = {
  success: { icon: CheckCircle2, label: "Success" },
  notice: { icon: Info, label: "Notice" },
  error: { icon: XCircle, label: "Error" },
};

function ToastItem({ toast }: { toast: Toast }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(TOAST_DURATION_MS);
  const dismiss = useCallback(() => setLeaving(true), []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (paused || leaving) return;
    const startedAt = performance.now();
    timerRef.current = setTimeout(dismiss, remainingRef.current);

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = null;
      remainingRef.current = Math.max(
        0,
        remainingRef.current - (performance.now() - startedAt),
      );
    };
  }, [paused, leaving, dismiss]);

  useEffect(() => {
    if (!leaving) return;
    const removalTimer = setTimeout(() => toastStore.remove(toast.id), TOAST_EXIT_MS);
    return () => clearTimeout(removalTimer);
  }, [leaving, toast.id]);

  const { icon: Icon, label } = config[toast.type];

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      aria-atomic="true"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={(event) =>
        setPaused(event.currentTarget.contains(document.activeElement))
      }
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(event.currentTarget.matches(":hover"));
        }
      }}
      className={`toast toast--${toast.type} ${visible && !leaving ? "toast--visible" : ""}`}
    >
      <span className="toast-icon" aria-hidden="true">
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <div className="toast-content">
        <p className="toast-label">{label}</p>
        <p className="toast-message">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="toast-dismiss"
        aria-label="Dismiss notification"
      >
        <X size={15} aria-hidden="true" />
      </button>
      <span
        className="toast-progress"
        aria-hidden="true"
        style={{
          animationDuration: `${TOAST_DURATION_MS}ms`,
          animationPlayState: paused || leaving ? "paused" : "running",
        }}
      />
    </div>
  );
}

export function ToastProvider() {
  const toasts = useToasts();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="toast-region" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  );
}
