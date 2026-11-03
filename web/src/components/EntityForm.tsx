import { useState, type FormEvent, type ReactNode } from 'react';
import { ApiError, type Row } from '../api';
import { useLookups } from '../lookups';
import { IMPACT_LABELS, LIKELIHOOD_LABELS } from '../../../shared/scoring.ts';

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'date' | 'person' | 'asset' | 'risk' | 'framework' | 'checkbox' | 'likelihood' | 'impact' | 'scale' | 'section';

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  options?: [value: string, label: string][];
  required?: boolean;
  help?: ReactNode;
  full?: boolean;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  /** Hide the field unless this returns true for the current values. */
  show?: (values: Row) => boolean;
  disabled?: boolean;
}

const NUMERIC: FieldType[] = ['number', 'person', 'asset', 'risk', 'framework', 'likelihood', 'impact', 'scale'];

function toPayload(fields: Field[], values: Row): Row {
  const out: Row = {};
  for (const f of fields) {
    if (f.type === 'section' || f.disabled) continue;
    const v = values[f.name];
    if (f.type === 'checkbox') out[f.name] = !!v;
    else if (NUMERIC.includes(f.type)) out[f.name] = v === '' || v == null ? null : Number(v);
    else out[f.name] = v === '' || v == null ? null : v;
  }
  return out;
}

export function EntityForm({
  fields,
  initial,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = 'Save',
  aside,
}: {
  fields: Field[];
  initial: Row;
  onSubmit: (payload: Row) => Promise<unknown>;
  onCancel?: () => void;
  onDelete?: () => Promise<unknown>;
  submitLabel?: string;
  aside?: (values: Row) => ReactNode;
}) {
  const { lookups } = useLookups();
  const [values, setValues] = useState<Row>(() => {
    const v: Row = {};
    for (const f of fields) if (f.type !== 'section') v[f.name] = initial[f.name] ?? (f.type === 'checkbox' ? false : '');
    return v;
  });
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (name: string, value: unknown) => setValues((v) => ({ ...v, [name]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit(toPayload(fields, values));
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(String(err)));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!onDelete || !confirm('Delete this record? This cannot be undone.')) return;
    setBusy(true);
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(String(err)));
      setBusy(false);
    }
  };

  const optionsFor = (f: Field): [string, string][] => {
    switch (f.type) {
      case 'person':
        return lookups.people.map((p) => [String(p.id), `${p.name} · ${p.title}`]);
      case 'asset':
        return lookups.assets.map((a) => [String(a.id), a.name]);
      case 'risk':
        return lookups.risks.map((r) => [String(r.id), `${r.ref} ${r.title}`]);
      case 'framework':
        return lookups.frameworks.map((fw) => [String(fw.id), fw.name]);
      case 'likelihood':
        return LIKELIHOOD_LABELS.map((l, i) => [String(i + 1), `${i + 1} · ${l}`]);
      case 'impact':
        return IMPACT_LABELS.map((l, i) => [String(i + 1), `${i + 1} · ${l}`]);
      case 'scale':
        return ['1', '2', '3', '4', '5'].map((n) => [n, n]);
      default:
        return f.options ?? [];
    }
  };

  const fieldError = (name: string) => error?.issues.find((i) => i.path === name)?.message;

  const input = (f: Field) => {
    const id = `f-${f.name}`;
    const common = { id, name: f.name, required: f.required, disabled: f.disabled };
    const value = values[f.name] ?? '';
    switch (f.type) {
      case 'textarea':
        return <textarea {...common} value={value} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />;
      case 'checkbox':
        return <input {...common} type="checkbox" checked={!!value} onChange={(e) => set(f.name, e.target.checked)} />;
      case 'text':
      case 'date':
      case 'number':
        return (
          <input
            {...common}
            type={f.type}
            value={value}
            min={f.min}
            max={f.max}
            step={f.step ?? (f.type === 'number' ? 'any' : undefined)}
            placeholder={f.placeholder}
            onChange={(e) => set(f.name, e.target.value)}
          />
        );
      default:
        return (
          <select {...common} value={String(value)} onChange={(e) => set(f.name, e.target.value)}>
            {!f.required || value === '' ? <option value="">{f.required ? 'Select…' : '—'}</option> : null}
            {optionsFor(f).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        );
    }
  };

  return (
    <form onSubmit={submit}>
      {error && (
        <div className="error-box">
          {error.message}
          {error.issues.length > 0 && error.issues.every((i) => !fields.some((f) => f.name === i.path)) && `: ${error.issues.map((i) => `${i.path} ${i.message}`).join('; ')}`}
        </div>
      )}
      <div className="form-grid">
        {fields.map((f) => {
          if (f.show && !f.show(values)) return null;
          if (f.type === 'section')
            return (
              <div key={f.name} className="form-section">
                <h3>{f.label}</h3>
                {f.help && <p className="small muted" style={{ marginTop: 4 }}>{f.help}</p>}
              </div>
            );
          const err = fieldError(f.name);
          return (
            <div key={f.name} className={`field ${f.full || f.type === 'textarea' ? 'full' : ''} ${f.type === 'checkbox' ? 'check' : ''}`}>
              {f.type === 'checkbox' ? (
                <label htmlFor={`f-${f.name}`}>
                  {input(f)} {f.label}
                </label>
              ) : (
                <>
                  <label htmlFor={`f-${f.name}`}>
                    {f.label}
                    {f.required && <span className="faint"> *</span>}
                  </label>
                  {input(f)}
                </>
              )}
              {err ? <div className="help" style={{ color: 'var(--critical)' }}>{err}</div> : f.help && <div className="help">{f.help}</div>}
            </div>
          );
        })}
        {aside && <div className="full">{aside(values)}</div>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 20 }}>
        <div>
          {onDelete && (
            <button type="button" className="btn danger" onClick={remove} disabled={busy}>
              Delete
            </button>
          )}
        </div>
        <div className="actions">
          {onCancel && (
            <button type="button" className="btn" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn primary" disabled={busy}>
            {busy ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
