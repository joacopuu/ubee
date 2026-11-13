import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** true on the client after hydration, false on the server render. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
