import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons';

export type Mode = 'light' | 'dark' | 'system';
export const ACCENTS: [id: string, label: string, swatch: string][] = [
  ['teal', 'Teal', '#0f6e6e'],
  ['blue', 'Blue', '#1f5fbf'],
  ['violet', 'Violet', '#6941c6'],
  ['rose', 'Rose', '#b4245c'],
  ['amber', 'Amber', '#9a5600'],
  ['green', 'Green', '#2c7a3f'],
];

const read = (key: string, fallback: string) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

/** Save a theme choice and let theme-init.js (loaded in index.html) apply it. */
function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked: apply for this visit only.
    if (key === 'grc-theme-accent') document.documentElement.dataset.accent = value;
    else document.documentElement.dataset.mode = value === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : value;
  }
  window.dispatchEvent(new Event('grc-theme'));
}

/** `compact` shows an icon button (phone top bar) whose menu opens downwards. */
export function ThemePicker({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(() => read('grc-theme-mode', 'system') as Mode);
  const [accent, setAccent] = useState(() => read('grc-theme-accent', 'teal'));
  const ref = useRef<HTMLDivElement>(null);

  // The top-bar picker and the sidebar picker stay in step with each other.
  useEffect(() => {
    const sync = () => {
      setMode(read('grc-theme-mode', 'system') as Mode);
      setAccent(read('grc-theme-accent', 'teal'));
    };
    window.addEventListener('grc-theme', sync);
    return () => window.removeEventListener('grc-theme', sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="theme-picker" ref={ref}>
      {compact ? (
        <button type="button" className="theme-icon-button" aria-label="Theme" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <Icon name="palette" />
        </button>
      ) : (
        <button type="button" className="nav-sync small theme-button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span className="theme-dot" style={{ background: ACCENTS.find((a) => a[0] === accent)?.[2] }} aria-hidden="true" />
          Theme
        </button>
      )}
      {open && (
        <div className={`theme-pop ${compact ? 'down' : ''}`} role="dialog" aria-label="Choose a theme">
          <div className="small theme-label">Appearance</div>
          <div className="tabs" role="radiogroup" aria-label="Appearance">
            {(['light', 'dark', 'system'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                className={mode === m ? 'on' : ''}
                title={m === 'system' ? 'Follow your phone or computer setting' : undefined}
                onClick={() => {
                  setMode(m);
                  save('grc-theme-mode', m);
                }}
              >
                {m === 'system' ? 'Device' : m === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
          <div className="small theme-label" style={{ marginTop: 12 }}>Colour</div>
          <div className="theme-swatches" role="radiogroup" aria-label="Accent colour">
            {ACCENTS.map(([id, label, swatch]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={accent === id}
                aria-label={label}
                title={label}
                className={`theme-swatch ${accent === id ? 'on' : ''}`}
                style={{ background: swatch }}
                onClick={() => {
                  setAccent(id);
                  save('grc-theme-accent', id);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
