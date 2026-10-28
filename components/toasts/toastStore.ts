import { useSyncExternalStore } from "react";

export const TOAST_DURATION_MS = 5000;
export const TOAST_EXIT_MS = 200;

export type ToastType = "success" | "notice" | "error";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type Listener = () => void;

let toasts: Toast[] = [];
const emptyToasts: Toast[] = [];
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((listener) => listener());

export const toastStore = {
  subscribe: (fn: Listener) => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  getSnapshot: () => toasts,
  getServerSnapshot: () => emptyToasts,
  add: (message: string, type: ToastType) => {
    if (typeof window === "undefined") return;
    const existing = toasts.find(
      (toast) => toast.message === message && toast.type === type,
    );
    if (existing) return existing.id;

    const id = crypto.randomUUID();
    toasts = [...toasts.slice(-3), { id, message, type }];
    emit();
    return id;
  },
  remove: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  },
};

export function useToasts() {
  return useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getServerSnapshot,
  );
}
