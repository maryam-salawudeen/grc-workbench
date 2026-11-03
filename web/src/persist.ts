import { useCallback, useEffect, useState } from 'react';

const EVENT = 'grc-persist';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/**
 * State saved in localStorage and shared live between components using the same key
 * (for example the task list on the brief page and in the side panel).
 */
export function usePersistentState<T>(key: string, fallback: T, valid: (v: unknown) => boolean = () => true) {
  const load = useCallback(() => {
    const v = read<T>(key, fallback);
    return valid(v) ? v : fallback;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const [value, setValue] = useState<T>(load);

  useEffect(() => {
    setValue(load());
    const onChange = (e: Event) => (e as CustomEvent<string>).detail === key && setValue(load());
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, [key, load]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(read(key, fallback)) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Storage unavailable: keep the value for this page only.
        setValue(resolved);
        return;
      }
      window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, update] as const;
}

/** Ticked tasks for a practice scenario, shared by the brief page and the side panel. */
export function useChecklist(scenarioId: string, size: number) {
  const [done, setDone] = usePersistentState<boolean[]>(`grc-tasks-${scenarioId}`, Array(size).fill(false), (v) => Array.isArray(v) && v.length === size);
  const toggle = (i: number) => setDone((d) => (Array.isArray(d) && d.length === size ? d : Array(size).fill(false)).map((v, n) => (n === i ? !v : v)));
  return [done, toggle] as const;
}

/** Whether the scenario brief is docked beside the page. */
export const useBriefOpen = () => usePersistentState<boolean>('grc-brief-open', false);
