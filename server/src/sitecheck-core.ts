// Types shared by the website check, the API and the browser build (no Node imports).

export type CheckStatus = 'pass' | 'warn' | 'fail' | 'info';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface SiteCheckItem {
  id: string;
  title: string;
  status: CheckStatus;
  severity: Severity;
  found: string;
  /** Plain-English explanation for a beginner. */
  explain: string;
  why: string;
  fix: string;
  /** What a GRC analyst would do with this result. */
  analyst: string;
  /** Framework requirement refs (ISO first; it is used when raising a finding). */
  refs: string[];
  term: string;
}

export interface SiteReport {
  url: string;
  host: string;
  score: number;
  letter: string;
  items: SiteCheckItem[];
}

/** A problem with the address the user typed; its message is safe to show them. */
export class SiteCheckError extends Error {}
