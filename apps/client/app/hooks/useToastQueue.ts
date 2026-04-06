import { useState, useRef, useCallback } from "react";

type ToastType = "error" | "success" | "warning" | undefined;

interface ToastItem {
  type?: ToastType;
  message: string;
}

interface ToastProps {
  open: boolean;
  type?: ToastType;
  message: string;
  setOpen: (open: boolean) => void;
}

// Delay matches the Toast2 fade-out duration (320ms) plus a small buffer
const QUEUE_DELAY_MS = 350;

export function useToastQueue() {
  const [current, setCurrent] = useState<{ open: boolean; type?: ToastType; message: string }>({
    open: false,
    message: "",
  });

  const queueRef = useRef<ToastItem[]>([]);
  const isOpenRef = useRef(false);

  const showNext = useCallback(() => {
    if (queueRef.current.length > 0) {
      const [next, ...rest] = queueRef.current;
      queueRef.current = rest;
      setTimeout(() => {
        isOpenRef.current = true;
        setCurrent({ open: true, type: next.type, message: next.message });
      }, QUEUE_DELAY_MS);
    }
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      if (!isOpenRef.current) {
        isOpenRef.current = true;
        setCurrent({ open: true, type, message });
      } else {
        queueRef.current = [...queueRef.current, { type, message }];
      }
    },
    [showNext]
  );

  const setOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        isOpenRef.current = false;
        setCurrent((prev) => ({ ...prev, open: false }));
        showNext();
      }
    },
    [showNext]
  );

  const toastProps: ToastProps = {
    open: current.open,
    type: current.type,
    message: current.message,
    setOpen,
  };

  return { toastProps, addToast };
}
