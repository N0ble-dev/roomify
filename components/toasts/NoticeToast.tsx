import { useNavigate } from "react-router";
import { toastStore } from "./toastStore";

export function useNoticeToast() {
  const navigate = useNavigate();

  const showToast = (message: string, path?: string) => {
    toastStore.add(message, "notice");
    if (path) void navigate(path);
  };

  return { showToast };
}
