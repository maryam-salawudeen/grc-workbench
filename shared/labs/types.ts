// Work labs: requests from colleagues at client organisations, each with
// attachments to work from and a deliverable broken into marked steps.

export const CISSP_DOMAINS = [
  '',
  'Security and Risk Management',
  'Asset Security',
  'Security Architecture and Engineering',
  'Communication and Network Security',
  'Identity and Access Management',
  'Security Assessment and Testing',
  'Security Operations',
  'Software Development Security',
] as const;

export interface Option {
  text: string;
  correct?: boolean;
  /** Feedback shown after the step is submitted. */
  why: string;
}

export type Step =
  | { type: 'single'; prompt: string; options: Option[]; hint?: string }
  | { type: 'multi'; prompt: string; options: Option[]; hint?: string }
  | { type: 'number'; prompt: string; answer: number; tolerance: number; unit?: '$' | '%' | 'hours' | ''; working: string; hint?: string }
  | { type: 'match'; prompt: string; choices: string[]; items: { text: string; answer: string; why: string }[]; hint?: string }
  /** Items are listed in the correct order; the player shuffles them. */
  | { type: 'order'; prompt: string; items: { text: string; why: string }[]; hint?: string }
  /** Free-text deliverable, self-marked against a rubric after seeing a model answer. */
  | { type: 'write'; prompt: string; placeholder?: string; model: string[]; rubric: string[]; hint?: string };

export type Attachment =
  | { kind: 'table'; title: string; columns: string[]; rows: string[][]; note?: string }
  | { kind: 'text'; title: string; body: string[] };

export type Level = 'Easy' | 'Medium' | 'Hard';

export interface Lab {
  id: string;
  /** Original sequence the lab was written in; difficulty is `level`. */
  week: number;
  level: Level;
  /** Subject line, as it would appear in the inbox. */
  title: string;
  client: string;
  from: { name: string; role: string };
  channel: 'Email' | 'Ticket' | 'Teams message';
  received: string;
  priority: 'Normal' | 'High' | 'Urgent';
  minutes: number;
  domain: number;
  skills: string[];
  message: string[];
  attachments: Attachment[];
  steps: Step[];
  debrief: { work: string[]; examTip: string };
}

export type Answer = number | number[] | Record<number, string> | string;
