import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CISSP_DOMAINS, LABS, LAB_TIPS, labById, scoreStep, shuffledOrder, type Answer, type Attachment, type Lab, type Step } from '../../../shared/labs/index.ts';
import { summarise, useLabProgress, type LabProgress } from '../labProgress';
import { Explained } from '../components/Explain';
import { Icon } from '../components/icons';
import { PageHeader, Ring, complianceColor } from '../components/ui';

const verdict = (score: number) => (score >= 0.99 ? ['good', 'Correct'] : score > 0 ? ['close', 'Partly right'] : ['off', 'Not quite']);

function AttachmentView({ a }: { a: Attachment }) {
  return (
    <div className="lab-attachment">
      <div className="lab-attachment-title">
        <Icon name="policy" size={15} /> {a.title}
      </div>
      {a.kind === 'table' ? (
        <div className="table-wrap">
          <table className="lab-table">
            <thead>
              <tr>{a.columns.map((c) => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {a.rows.map((r, i) => (
                <tr key={i}>{r.map((cell, j) => <td key={j} data-label={a.columns[j]}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="lab-doc">{a.body.map((p, i) => <p key={i}><Explained text={p} /></p>)}</div>
      )}
    </div>
  );
}

function isAnswered(step: Step, a: Answer | undefined) {
  if (a === undefined) return false;
  switch (step.type) {
    case 'multi':
      return (a as number[]).length > 0;
    case 'number':
      return a !== '' && Number.isFinite(Number(a));
    case 'match':
      return step.items.every((_, i) => (a as Record<number, string>)[i]);
    case 'write':
      return String(a).trim().length >= 20;
    default:
      return true;
  }
}

function StepCard({ lab, step, index, progress, setProgress }: { lab: Lab; step: Step; index: number; progress: LabProgress; setProgress: (fn: (p: LabProgress) => LabProgress) => void }) {
  const submitted = progress.submitted.includes(index);
  const initialOrder = useMemo(() => shuffledOrder(step.type === 'order' ? step.items.length : 0, `${lab.id}-${index}`), [lab.id, index, step]);
  const answer = progress.answers[index] ?? (step.type === 'order' ? initialOrder : undefined);
  const ticked = progress.ticked[index] ?? [];
  const [showHint, setShowHint] = useState(false);
  const hint = step.hint ?? LAB_TIPS[lab.id]?.hints[index];

  const setAnswer = (a: Answer) => setProgress((p) => ({ ...p, answers: { ...p.answers, [index]: a } }));
  const submit = () => setProgress((p) => ({ ...p, answers: { ...p.answers, [index]: answer as Answer }, submitted: [...new Set([...p.submitted, index])] }));
  const redo = () => setProgress((p) => ({ ...p, submitted: p.submitted.filter((s) => s !== index), ticked: { ...p.ticked, [index]: [] } }));
  const toggleTick = (i: number) =>
    setProgress((p) => {
      const cur = new Set(p.ticked[index] ?? []);
      cur.has(i) ? cur.delete(i) : cur.add(i);
      return { ...p, ticked: { ...p.ticked, [index]: [...cur] } };
    });

  const score = submitted ? scoreStep(step, answer, ticked) : 0;
  const [vcls, vlabel] = verdict(score);

  const optionClass = (i: number, correct?: boolean) => {
    if (!submitted) return '';
    const picked = step.type === 'single' ? answer === i : ((answer as number[]) ?? []).includes(i);
    if (correct && picked) return 'opt-good';
    if (correct) return 'opt-missed';
    if (picked) return 'opt-bad';
    return 'opt-dim';
  };

  return (
    <div className={`card lab-step ${submitted ? 'is-done' : ''}`}>
      <div className="card-head" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="small muted">Step {index + 1} of {lab.steps.length}</div>
          <h2 style={{ marginTop: 2 }}><Explained text={step.prompt} /></h2>
        </div>
        {submitted && step.type !== 'write' && <span className={`verdict ${vcls}`}>{vlabel}</span>}
      </div>
      <div className="card-body grid" style={{ gap: 10 }}>
        {(step.type === 'single' || step.type === 'multi') &&
          step.options.map((o, i) => {
            const picked = step.type === 'single' ? answer === i : ((answer as number[]) ?? []).includes(i);
            return (
              <label key={i} className={`lab-option ${optionClass(i, o.correct)}`}>
                <input
                  type={step.type === 'single' ? 'radio' : 'checkbox'}
                  name={`step-${index}`}
                  checked={picked}
                  disabled={submitted}
                  onChange={() =>
                    step.type === 'single'
                      ? setAnswer(i)
                      : setAnswer(picked ? ((answer as number[]) ?? []).filter((x) => x !== i) : [...((answer as number[]) ?? []), i])
                  }
                />
                <span>
                  <Explained text={o.text} />
                  {submitted && (picked || o.correct) && <span className="lab-why">{o.correct ? (picked ? '✓ ' : 'You missed this. ') : '✗ '}<Explained text={o.why} /></span>}
                </span>
              </label>
            );
          })}

        {step.type === 'number' && (
          <div className="lab-number">
            {step.unit === '$' && <span className="muted">$</span>}
            <input type="number" step="any" value={answer === undefined ? '' : String(answer)} disabled={submitted} onChange={(e) => setAnswer(e.target.value)} aria-label="Your answer" />
            {step.unit && step.unit !== '$' && <span className="muted">{step.unit}</span>}
          </div>
        )}
        {step.type === 'number' && submitted && (
          <p className="lab-why">
            {score === 1 ? '✓ ' : `The answer is ${step.unit === '$' ? '$' : ''}${step.answer.toLocaleString('en-CA')}${step.unit && step.unit !== '$' ? ` ${step.unit}` : ''}. `}
            <Explained text={step.working} />
          </p>
        )}

        {step.type === 'match' &&
          step.items.map((it, i) => {
            const a = (answer as Record<number, string>) ?? {};
            const right = a[i] === it.answer;
            return (
              <div key={i} className={`lab-match ${submitted ? (right ? 'opt-good' : 'opt-bad') : ''}`}>
                <span><Explained text={it.text} /></span>
                <select value={a[i] ?? ''} disabled={submitted} onChange={(e) => setAnswer({ ...a, [i]: e.target.value })} aria-label={`Answer for ${it.text}`}>
                  <option value="">Choose…</option>
                  {step.choices.map((c) => <option key={c}>{c}</option>)}
                </select>
                {submitted && <span className="lab-why" style={{ gridColumn: '1 / -1' }}>{right ? '✓ ' : `Answer: ${it.answer}. `}<Explained text={it.why} /></span>}
              </div>
            );
          })}

        {step.type === 'order' && (
          <ol className="lab-order">
            {(answer as number[]).map((itemIndex, pos) => {
              const it = step.items[itemIndex];
              const move = (dir: -1 | 1) => {
                const next = [...(answer as number[])];
                [next[pos], next[pos + dir]] = [next[pos + dir], next[pos]];
                setAnswer(next);
              };
              return (
                <li key={itemIndex} className={submitted ? (itemIndex === pos ? 'opt-good' : 'opt-bad') : ''}>
                  <span style={{ flex: 1 }}>
                    <Explained text={it.text} />
                    {submitted && <span className="lab-why">{itemIndex === pos ? '✓ ' : `Should be step ${itemIndex + 1}. `}<Explained text={it.why} /></span>}
                  </span>
                  {!submitted && (
                    <span className="lab-order-buttons">
                      <button type="button" className="btn sm" disabled={pos === 0} onClick={() => move(-1)} aria-label="Move up">↑</button>
                      <button type="button" className="btn sm" disabled={pos === step.items.length - 1} onClick={() => move(1)} aria-label="Move down">↓</button>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {step.type === 'write' && (
          <>
            <textarea className="lab-write" value={(answer as string) ?? ''} placeholder={step.placeholder ?? 'Write your answer here…'} disabled={submitted} onChange={(e) => setAnswer(e.target.value)} aria-label="Your answer" />
            {submitted && (
              <div className="grid" style={{ gap: 12 }}>
                <div className="callout lab-model">
                  <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>One good answer</div>
                  {step.model.map((p, i) => <p key={i}>{p}</p>)}
                </div>
                <div>
                  <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>Mark yourself: tick what your answer covered</div>
                  {step.rubric.map((r, i) => (
                    <label key={i} className="task">
                      <input type="checkbox" checked={ticked.includes(i)} onChange={() => toggleTick(i)} />
                      <span>{r}</span>
                    </label>
                  ))}
                  <div className="small muted">Self-marked: {ticked.length} of {step.rubric.length}</div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="actions" style={{ marginTop: 4 }}>
          {!submitted ? (
            <>
              <button className="btn primary" disabled={!isAnswered(step, answer)} onClick={submit}>
                {step.type === 'write' ? 'Submit and see a model answer' : 'Submit'}
              </button>
              {hint && <button className="btn ghost sm" onClick={() => setShowHint((h) => !h)}>{showHint ? 'Hide hint' : 'Hint'}</button>}
            </>
          ) : (
            <button className="btn ghost sm" onClick={redo}>Try this step again</button>
          )}
          {step.type === 'write' && !submitted && <span className="small muted">At least a couple of sentences.</span>}
        </div>
        {showHint && !submitted && hint && <p className="small callout lab-hint"><b>Hint.</b> <Explained text={hint} /></p>}
      </div>
    </div>
  );
}

export function LabPlayer() {
  const { id } = useParams();
  const lab = labById(id ?? '');
  const [progress, setProgress] = useLabProgress(id ?? '');
  if (!lab) return <Navigate to="/inbox" replace />;

  const summary = summarise(lab, progress);
  const nextLab = LABS[LABS.indexOf(lab) + 1];
  const update = (fn: (p: LabProgress) => LabProgress) => setProgress((p) => fn(p));
  const reset = () => {
    if (confirm('Clear your answers for this request and start again?')) setProgress({ answers: {}, submitted: [], ticked: {} });
  };

  return (
    <div className="page">
      <PageHeader
        crumbs={<><Link to="/inbox">Work inbox</Link> / {lab.client}</>}
        title={lab.title}
        description={
          <span className="actions">
            <span className={`badge level-${lab.level.toLowerCase()}`}>{lab.level}</span>
            <span className="badge accent">CISSP Domain {lab.domain}: {CISSP_DOMAINS[lab.domain]}</span>
            {lab.skills.map((s) => <span key={s} className="badge">{s}</span>)}
            <span className="small">About {lab.minutes} minutes</span>
          </span>
        }
        actions={summary.started && <button className="btn ghost danger" onClick={reset}>Start again</button>}
      />

      <div className="lab-layout">
        <div className="lab-source">
          <div className="card lab-message">
            <div className="lab-message-head">
              <div className="lab-avatar" aria-hidden="true">{lab.from.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{lab.from.name}</div>
                <div className="small muted">{lab.from.role}, {lab.client}</div>
              </div>
              <div className="small muted" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                {lab.channel}
                <br />
                {lab.received}
              </div>
            </div>
            <div className="lab-message-body">
              {lab.message.map((p, i) => <p key={i}><Explained text={p} /></p>)}
            </div>
          </div>
          {lab.attachments.map((a) => <AttachmentView key={a.title} a={a} />)}
        </div>

        <div className="lab-work grid" style={{ gap: 14 }}>
          {LAB_TIPS[lab.id] && (
            <div className="callout lab-before">
              <b>Before you start.</b> <Explained text={LAB_TIPS[lab.id].before} />
            </div>
          )}
          <div className="small muted">Work through the steps in order. Each one has a hint if you get stuck, and you can retry any step.</div>
          {lab.steps.map((s, i) => (
            <StepCard key={i} lab={lab} step={s} index={i} progress={progress} setProgress={update} />
          ))}

          {summary.done && (
            <div className="card card-pad lab-debrief">
              <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                <Ring value={summary.score} size={96} color={complianceColor(summary.score)} />
                <div style={{ flex: 1, minWidth: 220 }}>
                  <h2>Request complete</h2>
                  <p className="small muted">Your score across all steps. Retry any step to improve it.</p>
                </div>
              </div>
              <h3 style={{ margin: '16px 0 6px' }}>How this works on the job</h3>
              {lab.debrief.work.map((p, i) => <p key={i} style={{ marginBottom: 8 }}><Explained text={p} /></p>)}
              <div className="callout" style={{ marginTop: 10 }}>
                <b>CISSP exam tip.</b> <Explained text={lab.debrief.examTip} />
              </div>
              <div className="actions" style={{ marginTop: 14 }}>
                {nextLab ? <Link className="btn primary" to={`/inbox/${nextLab.id}`}>Next request: {nextLab.title}</Link> : <Link className="btn primary" to="/inbox">Back to the inbox</Link>}
                <Link className="btn" to="/inbox">Inbox</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
