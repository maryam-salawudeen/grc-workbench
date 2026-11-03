import type { Answer, Step } from './types.ts';

/** Score one submitted step from 0 to 1. Written steps are self-marked: `ticked` is the rubric items the learner covered. */
export function scoreStep(step: Step, answer: Answer | undefined, ticked: number[] = []): number {
  if (answer === undefined) return 0;
  switch (step.type) {
    case 'single':
      return step.options[answer as number]?.correct ? 1 : 0;
    case 'multi': {
      const picked = new Set(answer as number[]);
      const correct = step.options.filter((o) => o.correct).length;
      const right = step.options.filter((o, i) => o.correct && picked.has(i)).length;
      const wrong = step.options.filter((o, i) => !o.correct && picked.has(i)).length;
      return correct ? Math.max(0, right - wrong) / correct : wrong ? 0 : 1;
    }
    case 'number': {
      const diff = Math.abs(Number(answer) - step.answer);
      if (!Number.isFinite(diff)) return 0;
      return diff <= step.tolerance ? 1 : diff <= Math.max(step.tolerance * 3, Math.abs(step.answer) * 0.05) ? 0.5 : 0;
    }
    case 'match': {
      const a = answer as Record<number, string>;
      return step.items.filter((it, i) => a[i] === it.answer).length / step.items.length;
    }
    case 'order': {
      // Share of pairs in the right relative order, so one misplaced item costs little.
      const order = answer as number[];
      let good = 0;
      let total = 0;
      for (let i = 0; i < order.length; i++)
        for (let j = i + 1; j < order.length; j++) {
          total++;
          if (order[i] < order[j]) good++;
        }
      return total ? good / total : 1;
    }
    case 'write':
      return step.rubric.length ? new Set(ticked).size / step.rubric.length : 1;
  }
}

/** A fixed shuffle for order steps, so the starting order is the same every visit. */
export function shuffledOrder(n: number, seed: string): number[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const out = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const j = Math.abs(h) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  // Never start in the correct order.
  if (out.every((v, i) => v === i) && n > 1) [out[0], out[1]] = [out[1], out[0]];
  return out;
}
