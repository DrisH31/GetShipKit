import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** false during server render and hydration, true once running in the browser. */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
