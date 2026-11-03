import { WEEK1 } from './week1.ts';
import { WEEK2 } from './week2.ts';
import { WEEK3 } from './week3.ts';
import { WEEK4 } from './week4.ts';
import type { Lab } from './types.ts';

export * from './types.ts';
export { scoreStep, shuffledOrder } from './scoring.ts';

export const LABS: Lab[] = [...WEEK1, ...WEEK2, ...WEEK3, ...WEEK4];
export const labById = (id: string) => LABS.find((l) => l.id === id);

export const WEEK_THEMES: Record<number, string> = {
  1: 'Week 1: finding your feet',
  2: 'Week 2: everyday requests',
  3: 'Week 3: testing and analysis',
  4: 'Week 4: reporting and advising',
};

/** The consultancy the learner works for. Fictional. */
export const EMPLOYER = { name: 'Larchmere Risk Partners', manager: 'Rosa Ferreira', managerRole: 'Engagement Manager' };
