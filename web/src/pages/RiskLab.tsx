import { useState } from 'react';
import { IMPACT_LABELS, LIKELIHOOD_LABELS, RISK_APPETITE, quantitative, riskLevel, riskScore, safeguardValue } from '../../../shared/scoring.ts';
import { fmtMoney } from '../api';
import { LevelBadge, PageHeader, Score } from '../components/ui';

const LEVEL_ACTION: Record<string, string> = {
  low: 'Accept and monitor through routine reviews.',
  medium: 'Treat within normal planning cycles; owner reviews quarterly.',
  high: 'Treatment plan required with a target date; report to the risk committee.',
  critical: 'Immediate action; escalate to executive management and the board.',
};

function NumberInput({ label, value, onChange, help, step = 'any' }: { label: string; value: number; onChange: (n: number) => void; help?: string; step?: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type="number" min={0} step={step} value={Number.isFinite(value) ? value : ''} onChange={(e) => onChange(Number(e.target.value))} />
      {help && <div className="help">{help}</div>}
    </div>
  );
}

function Calculator() {
  const [av, setAv] = useState(500_000);
  const [ef, setEf] = useState(40);
  const [aro, setAro] = useState(0.5);
  const [efAfter, setEfAfter] = useState(40);
  const [aroAfter, setAroAfter] = useState(0.1);
  const [cost, setCost] = useState(30_000);

  const before = quantitative(av, ef, aro);
  const after = quantitative(av, efAfter, aroAfter);
  const value = safeguardValue(before.ale, after.ale, cost);

  return (
    <div className="card">
      <div className="card-head">
        <h2>Quantitative risk calculator</h2>
        <span className="small muted">CISSP Domain 1</span>
      </div>
      <div className="card-body">
        <div className="grid cols-2">
          <div>
            <h3 style={{ marginBottom: 10 }}>Without the safeguard</h3>
            <div className="form-grid">
              <NumberInput label="Asset value (AV)" value={av} onChange={setAv} />
              <NumberInput label="Exposure factor (EF %)" value={ef} onChange={setEf} help="Share of AV lost per event" />
              <NumberInput label="Annualised rate (ARO)" value={aro} onChange={setAro} help="0.5 = once every 2 years" />
            </div>
            <div className="formula" style={{ marginTop: 12 }}>
              SLE = AV × EF = {fmtMoney(av)} × {ef}% = <b>{fmtMoney(before.sle)}</b>
              <br />
              ALE = SLE × ARO = {fmtMoney(before.sle)} × {aro} = <b>{fmtMoney(before.ale)}</b>
            </div>
          </div>
          <div>
            <h3 style={{ marginBottom: 10 }}>With the safeguard</h3>
            <div className="form-grid">
              <NumberInput label="EF after (%)" value={efAfter} onChange={setEfAfter} />
              <NumberInput label="ARO after" value={aroAfter} onChange={setAroAfter} />
              <NumberInput label="Annual cost of safeguard" value={cost} onChange={setCost} help="Purchase, licences, staff time, per year" />
            </div>
            <div className="formula" style={{ marginTop: 12 }}>
              ALE after = {fmtMoney(after.sle)} × {aroAfter} = <b>{fmtMoney(after.ale)}</b>
              <br />
              Value = ALE before − ALE after − cost = <b style={{ color: value >= 0 ? 'var(--low)' : 'var(--critical)' }}>{fmtMoney(value)}</b>
            </div>
          </div>
        </div>
        <div className="callout" style={{ marginTop: 14 }}>
          {value >= 0 ? (
            <>The safeguard is <b>cost-justified</b>: it saves {fmtMoney(value)} a year more than it costs.</>
          ) : (
            <>The safeguard <b>costs more than the loss it prevents</b> ({fmtMoney(-value)} a year). Consider a cheaper control, transfer or formal acceptance.</>
          )}
        </div>
      </div>
    </div>
  );
}

function Matrix() {
  const [l, setL] = useState(4);
  const [i, setI] = useState(4);
  const score = riskScore(l, i);
  const level = riskLevel(score);
  return (
    <div className="card">
      <div className="card-head"><h2>Qualitative scoring</h2></div>
      <div className="card-body">
        <div className="form-grid">
          <div className="field">
            <label>Likelihood</label>
            <select value={l} onChange={(e) => setL(Number(e.target.value))}>
              {LIKELIHOOD_LABELS.map((x, n) => <option key={x} value={n + 1}>{n + 1} · {x}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Impact</label>
            <select value={i} onChange={(e) => setI(Number(e.target.value))}>
              {IMPACT_LABELS.map((x, n) => <option key={x} value={n + 1}>{n + 1} · {x}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 10px' }}>
          <Score value={score} /> <LevelBadge level={level} />
          <span className="small">{score > RISK_APPETITE ? 'Above appetite' : 'Within appetite'}</span>
        </div>
        <p className="small">{LEVEL_ACTION[level]}</p>
        <p className="small muted" style={{ marginTop: 10 }}>
          Qualitative analysis is fast and works when loss data is thin, but it is subjective. Quantitative analysis gives money figures for cost-benefit decisions but needs reliable AV, EF and ARO estimates. Most programmes use both.
        </p>
      </div>
    </div>
  );
}

const QUESTIONS: { q: string; options: string[]; answer: number; why: string }[] = [
  {
    q: 'A file server is valued at $500,000. A flood would destroy 20% of it, and floods are expected once every 2 years. What is the ALE?',
    options: ['$10,000', '$50,000', '$100,000', '$250,000'],
    answer: 1,
    why: 'SLE = $500,000 × 0.20 = $100,000. ALE = SLE × ARO = $100,000 × 0.5 = $50,000.',
  },
  {
    q: 'A control lowers ALE from $80,000 to $20,000 and costs $25,000 a year. What is its annual value to the organisation?',
    options: ['$60,000', '$55,000', '$35,000', '−$5,000'],
    answer: 2,
    why: 'Value = ALE before − ALE after − annual cost = $80,000 − $20,000 − $25,000 = $35,000.',
  },
  {
    q: 'An event is expected to happen once every 20 years. What ARO should you use?',
    options: ['20', '0.2', '0.05', '0.5'],
    answer: 2,
    why: 'ARO is occurrences per year: 1 ÷ 20 = 0.05.',
  },
  {
    q: 'Buying cyber insurance to cover breach costs is an example of which risk treatment?',
    options: ['Mitigation', 'Transfer', 'Acceptance', 'Avoidance'],
    answer: 1,
    why: 'Insurance and contractual indemnities transfer (share) the financial impact. Note that accountability for the risk itself cannot be transferred.',
  },
  {
    q: 'Who should formally accept a residual risk that is above appetite?',
    options: ['The security analyst who found it', 'The external auditor', 'Senior management or the risk owner with the authority to accept it', 'The vendor that supplies the system'],
    answer: 2,
    why: 'Risk acceptance is a business decision taken by management with the authority and accountability for the asset, not by technical staff or auditors.',
  },
  {
    q: 'A weekly review of logs that spots unauthorised access after it has happened is which type of control?',
    options: ['Preventive', 'Detective', 'Deterrent', 'Recovery'],
    answer: 1,
    why: 'Detective controls identify events during or after they occur. MFA would be preventive; backups are recovery.',
  },
  {
    q: 'A legacy system cannot support MFA, so the team adds network isolation and enhanced monitoring instead. These are:',
    options: ['Compensating controls', 'Corrective controls', 'Directive controls', 'Deterrent controls'],
    answer: 0,
    why: 'Compensating controls provide equivalent protection when the primary control is not feasible.',
  },
  {
    q: 'Why map one internal control to ISO 27001, NIST CSF and SOC 2 requirements at the same time?',
    options: [
      'Each framework requires its own separate control',
      'So it can be tested once and the evidence reused for every framework',
      'Mapping removes the need for testing',
      'Auditors require exactly one mapping per control',
    ],
    answer: 1,
    why: 'A common control framework cuts duplicated work and audit fatigue: implement once, test once, report against many frameworks.',
  },
];

function Quiz() {
  const [picked, setPicked] = useState<(number | null)[]>(() => QUESTIONS.map(() => null));
  const answered = picked.filter((p) => p != null).length;
  const correct = picked.filter((p, n) => p === QUESTIONS[n].answer).length;
  return (
    <div className="card">
      <div className="card-head">
        <h2>Practice questions</h2>
        <div className="actions">
          <span className="small muted">{correct}/{answered} correct</span>
          <button className="btn sm" onClick={() => setPicked(QUESTIONS.map(() => null))}>Reset</button>
        </div>
      </div>
      <div className="card-body grid" style={{ gap: 20 }}>
        {QUESTIONS.map((item, n) => {
          const choice = picked[n];
          return (
            <div key={n}>
              <p style={{ fontWeight: 500, marginBottom: 8 }}>{n + 1}. {item.q}</p>
              <div className="actions">
                {item.options.map((o, k) => {
                  const state = choice == null ? '' : k === item.answer ? 'good' : k === choice ? 'bad' : '';
                  return (
                    <button
                      key={k}
                      className="btn sm"
                      disabled={choice != null}
                      style={state ? { borderColor: `var(--${state === 'good' ? 'low' : 'critical'})`, color: `var(--${state === 'good' ? 'low' : 'critical'})`, opacity: 1 } : undefined}
                      onClick={() => setPicked((p) => p.map((v, i) => (i === n ? k : v)))}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
              {choice != null && (
                <p className="small" style={{ marginTop: 8 }}>
                  <b style={{ color: choice === item.answer ? 'var(--low)' : 'var(--critical)' }}>{choice === item.answer ? 'Correct.' : 'Not quite.'}</b> {item.why}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const GLOSSARY: [string, string][] = [
  ['Asset value (AV)', 'What the asset is worth to the organisation: replacement cost, revenue it supports, or value to competitors.'],
  ['Exposure factor (EF)', 'Percentage of the asset value lost in a single occurrence of the threat.'],
  ['Single loss expectancy (SLE)', 'Cost of one occurrence: AV × EF.'],
  ['Annualised rate of occurrence (ARO)', 'How many times a year the threat is expected to occur.'],
  ['Annualised loss expectancy (ALE)', 'Expected yearly loss: SLE × ARO. Used to justify the cost of safeguards.'],
  ['Inherent risk', 'Risk before any controls are applied.'],
  ['Residual risk', 'Risk that remains after controls and treatment. It is never zero.'],
  ['Risk appetite', 'The amount of risk the organisation is willing to pursue or retain. Here: residual score ≤ 9.'],
  ['Risk tolerance', 'The acceptable variation around the appetite for a specific risk or objective.'],
  ['Control / safeguard', 'A measure that modifies risk. Categories: administrative, technical, physical. Functions: preventive, detective, corrective, deterrent, recovery, compensating.'],
  ['Gap analysis', 'Comparison of the current state against a framework to find unmet requirements.'],
  ['Statement of Applicability (SoA)', 'ISO 27001 document listing every Annex A control, whether it applies and why.'],
  ['Due care / due diligence', 'Due care is doing what a reasonable person would (acting); due diligence is the investigation and monitoring that informs it (knowing).'],
  ['Third-party risk', 'Risk introduced by vendors and partners. Managed through tiering, due diligence, contracts and ongoing monitoring.'],
];

export function RiskLab() {
  return (
    <div className="page">
      <PageHeader title="Risk lab" description="Practise the calculations behind the platform. The same formulas score every risk, control and vendor in the register." />
      <div className="grid" style={{ gap: 16 }}>
        <Calculator />
        <div className="grid cols-2">
          <Matrix />
          <div className="card">
            <div className="card-head"><h2>How this platform scores</h2></div>
            <div className="card-body small grid" style={{ gap: 10 }}>
              <p><b>Risks:</b> likelihood × impact on a 5 × 5 matrix. Low 1–4, medium 5–9, high 10–16, critical 20–25. Anything with a residual score above {RISK_APPETITE} is above appetite.</p>
              <p><b>Framework compliance:</b> each requirement scores the average of its mapped controls (implemented 1, partial 0.5, planned or not implemented 0). No mapped control is a gap and scores 0.</p>
              <p><b>Vendors:</b> data access (0–3) + criticality (0–2) + system access (1). Tier 1 at 5+, reassessed yearly; Tier 2 at 3+, every 2 years; Tier 3 every 3 years.</p>
              <p><b>Findings and policies:</b> flagged when past due, and when due within 14 days (findings) or 30 days (policies).</p>
            </div>
          </div>
        </div>
        <Quiz />
        <div className="card">
          <div className="card-head"><h2>Glossary</h2></div>
          <div className="card-body">
            <dl className="dl">
              {GLOSSARY.map(([term, def]) => (
                <div key={term} style={{ display: 'contents' }}>
                  <dt>{term}</dt>
                  <dd>{def}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

