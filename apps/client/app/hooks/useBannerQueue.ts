import { useState, useRef, useCallback } from "react";

type BannerType = "error" | "success" | "warning" | undefined;

interface BannerItem {
  type?: BannerType;
  message: string;
}

interface BannerProps {
  open: boolean;
  type?: BannerType;
  message: string;
  setOpen: (open: boolean) => void;
}

// Delay matches the Banner2 fade-out duration (320ms) plus a small buffer
const QUEUE_DELAY_MS = 350;

export function useBannerQueue() {
  const [current, setCurrent] = useState<{ open: boolean; type?: BannerType; message: string }>({
    open: false,
    message: "",
  });

  const queueRef = useRef<BannerItem[]>([]);
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

  const addBanner = useCallback(
    (type: BannerType, message: string) => {
      if (!isOpenRef.current) {
        isOpenRef.current = true;
        setCurrent({ open: true, type, message });
      } else {
        queueRef.current = [...queueRef.current, { type, message }];
      }
    },
    [showNext],
  );

  const setOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        isOpenRef.current = false;
        setCurrent((prev) => ({ ...prev, open: false }));
        showNext();
      }
    },
    [showNext],
  );

  const bannerProps: BannerProps = {
    open: current.open,
    type: current.type,
    message: current.message,
    setOpen,
  };

  return { bannerProps, addBanner };
}
