import { WEEK1 } from './week1.ts';
import { WEEK2 } from './week2.ts';
import { WEEK3 } from './week3.ts';
import { WEEK4 } from './week4.ts';
import { MORE1 } from './more1.ts';
import { MORE2 } from './more2.ts';
import type { Lab, Level } from './types.ts';

export * from './types.ts';
export { scoreStep, shuffledOrder } from './scoring.ts';

export const LEVELS: Level[] = ['Easy', 'Medium', 'Hard'];

/** Easiest first, keeping the written order within each level. */
export const LABS: Lab[] = [...WEEK1, ...WEEK2, ...WEEK3, ...WEEK4, ...MORE1, ...MORE2].sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level));
export const labById = (id: string) => LABS.find((l) => l.id === id);

export const LEVEL_THEMES: Record<Level, string> = {
  Easy: 'Easy: clear facts and one decision',
  Medium: 'Medium: weigh the evidence and make a call',
  Hard: 'Hard: judgement, numbers and writing for leaders',
};

/** The consultancy the learner works for. Fictional. */
export const EMPLOYER = { name: 'Larchmere Risk Partners', manager: 'Rosa Ferreira', managerRole: 'Engagement Manager' };
