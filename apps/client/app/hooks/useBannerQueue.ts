import { useQueue } from "./useQueue";

type BannerType = "error" | "success" | "warning" | undefined;

const QUEUE_DELAY_MS = 350; // matches Banner2 fade‑out duration + buffer

export function useBannerQueue() {
  const { props: bannerProps, enqueue: addBanner } = useQueue<BannerType>(QUEUE_DELAY_MS);
  return { bannerProps, addBanner };
}
