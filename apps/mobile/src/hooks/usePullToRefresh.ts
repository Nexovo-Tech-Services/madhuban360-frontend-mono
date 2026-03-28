import { useCallback, useState } from "react";

export function usePullToRefresh(
  onRefresh?: () => Promise<void> | void,
  minimumDelayMs = 500,
) {
  const [refreshing, setRefreshing] = useState(false);

  const triggerRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);
    const startedAt = Date.now();

    try {
      await onRefresh?.();
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = minimumDelayMs - elapsed;

      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }

      setRefreshing(false);
    }
  }, [minimumDelayMs, onRefresh, refreshing]);

  return {
    refreshing,
    triggerRefresh,
  };
}
