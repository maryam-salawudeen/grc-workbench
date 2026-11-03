import { IMPACT_LABELS, LIKELIHOOD_LABELS, RISK_APPETITE, riskLevel, riskScore } from '../../../shared/scoring.ts';
import type { Row } from '../api';

export type HeatMode = 'inherent' | 'residual';

export function cellOf(r: Row, mode: HeatMode): [number, number] {
  return mode === 'residual' && r.residual_assessed ? [r.residual_likelihood, r.residual_impact] : [r.likelihood, r.impact];
}

export function HeatMap({
  risks,
  mode,
  selected,
  onSelect,
}: {
  risks: Row[];
  mode: HeatMode;
  selected?: [number, number] | null;
  onSelect?: (cell: [number, number] | null) => void;
}) {
  const counts = new Map<string, number>();
  for (const r of risks) {
    const [l, i] = cellOf(r, mode);
    counts.set(`${l}-${i}`, (counts.get(`${l}-${i}`) ?? 0) + 1);
  }
  return (
    <div>
      <div className="heatmap">
        <div className="y-label">Likelihood</div>
        <div className="heat-grid" role="grid" aria-label={`${mode} risk heat map`}>
          {[5, 4, 3, 2, 1].map((l) => (
            <Row5 key={l} l={l} counts={counts} selected={selected} onSelect={onSelect} />
          ))}
          <div />
          {IMPACT_LABELS.map((label, i) => (
            <div key={label} className="heat-axis x">
              {i + 1} · {label}
            </div>
          ))}
        </div>
      </div>
      <div className="small muted" style={{ textAlign: 'center', marginTop: 2, paddingLeft: 108 }}>Impact</div>
      <div className="legend">
        <span><i style={{ background: 'var(--low)' }} />Low 1–4</span>
        <span><i style={{ background: 'var(--medium)' }} />Medium 5–9</span>
        <span><i style={{ background: 'var(--high)' }} />High 10–16</span>
        <span><i style={{ background: 'var(--critical)' }} />Critical 20–25</span>
        <span>Appetite: residual ≤ {RISK_APPETITE}</span>
      </div>
    </div>
  );
}

function Row5({ l, counts, selected, onSelect }: { l: number; counts: Map<string, number>; selected?: [number, number] | null; onSelect?: (c: [number, number] | null) => void }) {
  return (
    <>
      <div className="heat-axis">
        {l} · {LIKELIHOOD_LABELS[l - 1]}
      </div>
      {[1, 2, 3, 4, 5].map((i) => {
        const n = counts.get(`${l}-${i}`) ?? 0;
        const score = riskScore(l, i);
        const isSel = selected?.[0] === l && selected?.[1] === i;
        return (
          <button
            type="button"
            key={i}
            className={`heat-cell ${riskLevel(score)} ${n ? '' : 'empty-cell'} ${isSel ? 'selected' : ''}`}
            onClick={() => n && onSelect?.(isSel ? null : [l, i])}
            aria-label={`Likelihood ${l}, impact ${i}: ${n} risk${n === 1 ? '' : 's'}`}
            style={{ border: isSel ? undefined : 0 }}
          >
            {n || ''}
            <span className="score-hint">{score}</span>
          </button>
        );
      })}
    </>
  );
}
