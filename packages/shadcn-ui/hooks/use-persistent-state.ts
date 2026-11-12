"use client";

import { useEffect, useState } from "react";

// useState backed by localStorage. Loads after mount to avoid hydration mismatches,
// and quietly falls back to in-memory state when storage is unavailable.
export function usePersistentState<T extends object>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) setValue({ ...initial, ...JSON.parse(stored) });
    } catch {
      // ignore unreadable storage
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore full or blocked storage
    }
  }, [key, value, loaded]);

  return [value, setValue] as const;
}
