import { useCallback, useEffect, useState } from 'react';

export type Row = Record<string, any>;

export class ApiError extends Error {
  issues: { path: string; message: string }[];
  constructor(message: string, issues: { path: string; message: string }[] = []) {
    super(message);
    this.issues = issues;
  }
}

/** The hosted build runs the API inside the browser; local development talks to the Node server. */
export const LOCAL_BACKEND = import.meta.env.VITE_LOCAL_BACKEND === '1';

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const init: RequestInit = {
    method: opts.method ?? 'GET',
    headers: opts.body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  };
  const res = LOCAL_BACKEND ? await (await import('./local/backend')).localFetch(path, init) : await fetch(`/api${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? `Request failed (${res.status})`, data.issues);
  return data as T;
}

/** Fetch `path` on mount and whenever it changes; `reload` refetches. */
export function useApi<T = any>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) return;
    let live = true;
    api<T>(path)
      .then((d) => live && (setData(d), setError(null)))
      .catch((e) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading: data === null && !error, reload, setData };
}

export interface Lookups {
  people: { id: number; name: string; title: string }[];
  assets: { id: number; name: string }[];
  risks: { id: number; ref: string; title: string }[];
  controls: { id: number; ref: string; title: string; status: string }[];
  frameworks: { id: number; code: string; name: string }[];
  assessments: { id: number; ref: string; title: string; framework_id: number }[];
}

export const fmtMoney = (n: number | null | undefined) =>
  n == null ? '—' : n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

export const fmtCompact = (n: number) =>
  n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', notation: 'compact', maximumFractionDigits: 1 });

export const fmtDate = (d: string | null | undefined) =>
  d ? new Date(`${d.slice(0, 10)}T00:00:00`).toLocaleDateString('en-CA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const humanize = (s: string | null | undefined) => (s ? (s.charAt(0).toUpperCase() + s.slice(1)).replaceAll('_', ' ') : '—');

export function downloadCsv(filename: string, rows: Row[], columns: { key: string; label: string; csv?: (r: Row) => unknown }[]) {
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  const lines = [columns.map((c) => esc(c.label)).join(','), ...rows.map((r) => columns.map((c) => esc(c.csv ? c.csv(r) : r[c.key])).join(','))];
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
