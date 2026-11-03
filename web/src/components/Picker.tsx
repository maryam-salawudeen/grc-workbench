import { useMemo, useState } from 'react';
import { Modal } from './ui';

export interface PickItem {
  id: number;
  label: string;
  sub?: string;
  group?: string;
}

/** Searchable multi-select dialog, grouped by `group`. */
export function Picker({ title, items, selected, onSave, onClose }: { title: string; items: PickItem[]; selected: number[]; onSave: (ids: number[]) => Promise<void>; onClose: () => void }) {
  const [chosen, setChosen] = useState(() => new Set(selected));
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);

  const groups = useMemo(() => {
    const needle = q.toLowerCase();
    const map = new Map<string, PickItem[]>();
    for (const it of items) {
      if (needle && !`${it.label} ${it.sub ?? ''}`.toLowerCase().includes(needle)) continue;
      const g = it.group ?? '';
      map.set(g, [...(map.get(g) ?? []), it]);
    }
    return [...map.entries()];
  }, [items, q]);

  const toggle = (id: number) =>
    setChosen((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <Modal
      title={title}
      onClose={onClose}
      wide
      footer={
        <>
          <span className="small muted" style={{ alignSelf: 'center' }}>{chosen.size} selected</span>
          <div className="actions">
            <button className="btn" onClick={onClose}>Cancel</button>
            <button
              className="btn primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await onSave([...chosen]);
                setBusy(false);
              }}
            >
              Save
            </button>
          </div>
        </>
      }
    >
      <input type="search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus aria-label="Search" />
      <div style={{ maxHeight: '55vh', overflowY: 'auto', marginTop: 12 }}>
        {groups.map(([g, list]) => (
          <div key={g} style={{ marginBottom: 12 }}>
            {g && <h3 style={{ margin: '8px 0 6px' }}>{g}</h3>}
            {list.map((it) => (
              <label key={it.id} style={{ display: 'flex', gap: 10, padding: '6px 4px', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'baseline' }}>
                <input type="checkbox" checked={chosen.has(it.id)} onChange={() => toggle(it.id)} />
                <span>
                  {it.label}
                  {it.sub && <span className="small muted"> · {it.sub}</span>}
                </span>
              </label>
            ))}
          </div>
        ))}
        {!groups.length && <div className="empty">Nothing matches.</div>}
      </div>
    </Modal>
  );
}
