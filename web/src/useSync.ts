import { useEffect, useState } from 'react';
import { getStatus, subscribe, type SyncStatus } from './local/sync';

export function useSyncStatus(): SyncStatus {
  const [s, setS] = useState(getStatus);
  useEffect(() => {
    const unsubscribe = subscribe(setS);
    return () => {
      unsubscribe();
    };
  }, []);
  return s;
}

export function syncedAgo(ts: number | null): string {
  if (!ts) return 'not yet';
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(ts).toLocaleDateString('en-CA', { day: 'numeric', month: 'short' });
}
