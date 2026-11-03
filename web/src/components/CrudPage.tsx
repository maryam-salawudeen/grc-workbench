import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, downloadCsv, humanize, useApi, type Row } from '../api';
import { useLookups } from '../lookups';
import { DataTable, matches, type Column } from './DataTable';
import { EntityForm, type Field } from './EntityForm';
import { Icon } from './icons';
import { Loading, Modal, PageHeader, toast } from './ui';

export interface Filter {
  key: string;
  label: string;
  options: [string, string][];
  /** Custom predicate; defaults to String(row[key]) === value. */
  test?: (row: Row, value: string) => boolean;
}

export interface CrudConfig {
  entity: string;
  title: string;
  singular: string;
  description?: ReactNode;
  columns: Column[];
  fields: Field[];
  defaults: Row;
  searchKeys: string[];
  filters?: Filter[];
  /** Navigate to a detail page instead of opening the edit dialog. */
  detailPath?: (row: Row) => string;
  rowClassName?: (row: Row) => string;
  summary?: (rows: Row[]) => ReactNode;
  formAside?: (values: Row) => ReactNode;
}

export function CrudPage({ cfg }: { cfg: CrudConfig }) {
  const { data, error, reload } = useApi<Row[]>(`/${cfg.entity}`);
  const { reloadLookups } = useLookups();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((cfg.filters ?? []).map((f) => [f.key, params.get(f.key) ?? ''])),
  );
  const [editing, setEditing] = useState<Row | 'new' | null>(null);

  // Deep link: ?open=<id> opens that record.
  useEffect(() => {
    const open = params.get('open');
    if (open && data) {
      const row = data.find((r) => String(r.id) === open);
      if (row) setEditing(row);
    }
  }, [params, data]);

  const rows = useMemo(
    () =>
      (data ?? []).filter(
        (r) =>
          matches(r, q, cfg.searchKeys) &&
          (cfg.filters ?? []).every((f) => !filterValues[f.key] || (f.test ? f.test(r, filterValues[f.key]) : String(r[f.key]) === filterValues[f.key])),
      ),
    [data, q, filterValues, cfg],
  );

  const close = () => {
    setEditing(null);
    if (params.has('open')) {
      params.delete('open');
      setParams(params, { replace: true });
    }
  };

  const saved = (msg: string) => {
    toast(msg);
    close();
    reload();
    reloadLookups();
  };

  if (!data) return <div className="page"><Loading error={error} /></div>;

  return (
    <div className="page">
      <PageHeader
        title={cfg.title}
        description={cfg.description}
        actions={
          <>
            <button className="btn" onClick={() => downloadCsv(`${cfg.entity}.csv`, rows, cfg.columns)}>
              <Icon name="download" /> Export CSV
            </button>
            <button className="btn primary" onClick={() => setEditing('new')}>
              <Icon name="plus" /> New {cfg.singular.toLowerCase()}
            </button>
          </>
        }
      />
      {cfg.summary?.(data)}
      <div className="card">
        <div className="card-head">
          <div className="filters">
            <input className="search" type="search" placeholder={`Search ${cfg.title.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
            {(cfg.filters ?? []).map((f) => (
              <select key={f.key} value={filterValues[f.key]} onChange={(e) => setFilterValues((v) => ({ ...v, [f.key]: e.target.value }))} aria-label={f.label}>
                <option value="">{f.label}: all</option>
                {f.options.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            ))}
          </div>
          <span className="small muted">
            {rows.length} of {data.length}
          </span>
        </div>
        <DataTable
          rows={rows}
          columns={cfg.columns}
          onRowClick={(r) => (cfg.detailPath ? navigate(cfg.detailPath(r)) : setEditing(r))}
          rowClassName={cfg.rowClassName}
          empty={data.length ? 'No records match these filters.' : `No ${cfg.title.toLowerCase()} yet.`}
        />
      </div>

      {editing && (
        <Modal title={editing === 'new' ? `New ${cfg.singular.toLowerCase()}` : `${editing.ref ? `${editing.ref} · ` : ''}${cfg.singular}`} onClose={close}>
          <EntityForm
            fields={cfg.fields}
            initial={editing === 'new' ? cfg.defaults : editing}
            aside={cfg.formAside}
            submitLabel={editing === 'new' ? `Create ${cfg.singular.toLowerCase()}` : 'Save changes'}
            onCancel={close}
            onSubmit={async (payload) => {
              if (editing === 'new') {
                const created = await api(`/${cfg.entity}`, { method: 'POST', body: payload });
                if (cfg.detailPath) {
                  toast(`${cfg.singular} created`);
                  navigate(cfg.detailPath(created));
                } else saved(`${cfg.singular} created`);
              } else {
                await api(`/${cfg.entity}/${editing.id}`, { method: 'PUT', body: payload });
                saved(`${cfg.singular} saved`);
              }
            }}
            onDelete={
              editing === 'new'
                ? undefined
                : async () => {
                    await api(`/${cfg.entity}/${editing.id}`, { method: 'DELETE' });
                    saved(`${cfg.singular} deleted`);
                  }
            }
          />
        </Modal>
      )}
    </div>
  );
}

export const opts = (values: string[], label: (v: string) => string = humanize): [string, string][] => values.map((v) => [v, label(v)]);
