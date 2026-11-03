import { useEffect, useState } from 'react';
import { LABS, scoreStep, type Answer, type Lab } from '../../shared/labs/index.ts';
import { usePersistentState } from './persist';

export interface LabProgress {
  answers: Record<number, Answer>;
  submitted: number[];
  /** Rubric items ticked on written steps. */
  ticked: Record<number, number[]>;
}

const EMPTY: LabProgress = { answers: {}, submitted: [], ticked: {} };
const key = (id: string) => `grc-lab-${id}`;

export const useLabProgress = (id: string) =>
  usePersistentState<LabProgress>(key(id), EMPTY, (v) => !!v && typeof v === 'object' && Array.isArray((v as LabProgress).submitted));

export function summarise(lab: Lab, p: LabProgress) {
  const submitted = new Set(p.submitted);
  const done = lab.steps.every((_, i) => submitted.has(i));
  const total = lab.steps.reduce((s, step, i) => s + (submitted.has(i) ? scoreStep(step, p.answers[i], p.ticked[i]) : 0), 0);
  return { started: submitted.size > 0, done, stepsDone: submitted.size, score: Math.round((total / lab.steps.length) * 100) };
}

function read(id: string): LabProgress {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(key(id)) ?? 'null') };
  } catch {
    return EMPTY;
  }
}

/** Progress for every lab; refreshes when any lab is updated in this tab. */
export function useAllLabProgress() {
  const load = () => Object.fromEntries(LABS.map((l) => [l.id, summarise(l, read(l.id))]));
  const [all, setAll] = useState(load);
  useEffect(() => {
    const refresh = () => setAll(load());
    window.addEventListener('grc-persist', refresh);
    return () => window.removeEventListener('grc-persist', refresh);
  }, []);
  return all;
}
