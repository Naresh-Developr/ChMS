import { useState, useRef, useCallback } from "react";

/**
 * Generic queue hook for any “toast‑like” UI component.
 *
 * @param delayMs – time to wait before showing the next item (matches the
 *                 component’s fade‑out duration plus a small buffer)
 * @returns an object containing:
 *   • props – the props you can spread onto your UI component
 *   • enqueue – a function to add a new item to the queue
 */
export function useQueue<T extends string | undefined>(delayMs: number) {
  type Item = { type?: T; message: string };

  const [current, setCurrent] = useState<{ open: boolean; type?: T; message: string }>({
    open: false,
    message: "",
  });

  const queueRef = useRef<Item[]>([]);
  const isOpenRef = useRef(false);

  const showNext = useCallback(() => {
    if (queueRef.current.length > 0) {
      const [next, ...rest] = queueRef.current;
      queueRef.current = rest;
      // Slight pause ensures the previous component has finished fading out
      setTimeout(() => {
        isOpenRef.current = true;
        setCurrent({ open: true, type: next.type, message: next.message });
      }, delayMs);
    }
  }, [delayMs]);

  const enqueue = useCallback(
    (type: T, message: string) => {
      if (!isOpenRef.current) {
        // No item is visible – show immediately
        isOpenRef.current = true;
        setCurrent({ open: true, type, message });
      } else {
        // Something is already on screen – queue it
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

  return {
    /** Props you can spread onto a component (e.g., MUI Snackbar). */
    props: {
      open: current.open,
      type: current.type,
      message: current.message,
      setOpen,
    } as const,
    /** Add a new item to the queue. */
    enqueue,
  };
}
