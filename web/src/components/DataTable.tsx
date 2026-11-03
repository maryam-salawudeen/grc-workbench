import { useMemo, useState, type ReactNode } from 'react';
import type { Row } from '../api';

export interface Column {
  key: string;
  label: string;
  render?: (row: Row) => ReactNode;
  /** Value used for sorting and CSV; defaults to row[key]. */
  sortValue?: (row: Row) => string | number | null;
  csv?: (row: Row) => unknown;
  className?: string;
}

export function DataTable({
  rows,
  columns,
  onRowClick,
  rowClassName,
  empty = 'Nothing here yet.',
  initialSort,
}: {
  rows: Row[];
  columns: Column[];
  onRowClick?: (row: Row) => void;
  rowClassName?: (row: Row) => string;
  empty?: ReactNode;
  initialSort?: { key: string; dir: 1 | -1 };
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(initialSort ?? null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const get = col?.sortValue ?? ((r: Row) => r[sort.key]);
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      return (typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), undefined, { numeric: true })) * sort.dir;
    });
  }, [rows, columns, sort]);

  const toggle = (key: string) => setSort((s) => (s?.key === key ? (s.dir === 1 ? { key, dir: -1 } : null) : { key, dir: 1 }));

  if (!rows.length) return <div className="empty">{empty}</div>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`sortable ${c.className ?? ''}`} onClick={() => toggle(c.key)} aria-sort={sort?.key === c.key ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}>
                {c.label}
                {sort?.key === c.key ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr
              key={r.id}
              className={`${onRowClick ? 'clickable' : ''} ${rowClassName?.(r) ?? ''}`}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(r) : undefined}
            >
              {columns.map((c) => (
                <td key={c.key} className={c.className}>
                  {c.render ? c.render(r) : (r[c.key] ?? <span className="faint">—</span>)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Case-insensitive match of `q` against any of the given fields. */
export function matches(row: Row, q: string, keys: string[]) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return keys.some((k) => String(row[k] ?? '').toLowerCase().includes(needle));
}
