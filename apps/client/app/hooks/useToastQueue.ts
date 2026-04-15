import { useQueue } from "./useQueue";

type ToastType = "error" | "success" | "warning" | undefined;

const QUEUE_DELAY_MS = 350; // matches Toast2 fade‑out duration + buffer

export function useToastQueue() {
  const { props: toastProps, enqueue: addToast } = useQueue<ToastType>(QUEUE_DELAY_MS);
  return { toastProps, addToast };
}
