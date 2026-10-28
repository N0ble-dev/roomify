import { useNavigate } from "react-router";
import { toastStore } from "./toastStore";

export function useSuccessToast() {
  const navigate = useNavigate();

  const showToast = (message: string, path?: string) => {
    toastStore.add(message, "success");
    if (path) void navigate(path);
  };

  return { showToast };
}
