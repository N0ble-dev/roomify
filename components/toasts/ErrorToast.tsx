import { toastStore } from "./toastStore";

export function useErrorToast() {
  const showToast = (message: string) => toastStore.add(message, "error");

  return { showToast };
}
