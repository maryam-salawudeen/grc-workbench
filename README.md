# GRC Workbench

**Live app: https://grc-workbench.vercel.app** (free, nothing to install; your work is saved privately in your own browser)

An enterprise risk assessment and governance, risk & compliance (GRC) platform. It runs a risk register, a common control set mapped to three frameworks, audits, findings, a policy library and third-party risk, all in one place. It ships with demo data for a fictional organisation, **Maple Ridge Credit Union**.

Built as a portfolio project and a CISSP / GRC study aid: every score in the app comes from a formula you can see and practise in the **Risk lab**.

## What it does

| Module | Highlights |
| --- | --- |
| **Dashboard** | KPIs across every module, inherent/residual heat map, framework compliance, a combined "coming up and overdue" list, activity log |
| **Risk register** | 5 × 5 likelihood × impact scoring, inherent vs residual, risk appetite, treatment (mitigate / accept / transfer / avoid), quantitative SLE / ALE, linked controls and findings, CSV export |
| **Assets** | Classification, criticality and asset value (feeds AV in the quantitative model) |
| **Controls** | Common control set with function (preventive, detective, corrective, deterrent, recovery, compensating), category (administrative, technical, physical), effectiveness and test schedule |
| **Frameworks** | NIST CSF 2.0 (22 categories), ISO/IEC 27001:2022 Annex A (93 controls), SOC 2 Common Criteria (33). Compliance is computed live from control status; gap analysis by domain with CSV export |
| **Assessments** | Generates a checklist item per requirement, pre-fills results from control status, records notes and evidence, raises findings from non-compliant items |
| **Findings** | Severity, owner, due dates and overdue tracking, linked to the requirement, assessment and risk |
| **Policies** | Version, approval and review cycle with due-soon / overdue flags |
| **Vendors** | Inherent tiering from data access, criticality and system access; reassessment schedule by tier |
| **Practice scenarios** | Five fictional organisations (clinic, online store, municipality, logistics company, fintech) from foundation to expert. Each has a brief, an empty register, and "Check my work", which compares your risks with a model answer and explains every score |
| **Website check** | Enter a URL for a passive review of HTTPS, the TLS certificate, security headers, cookie flags, version leaks and security.txt. Every result explains what it means, why it matters, how to fix it and what an analyst does next; problems can be raised as findings mapped to ISO 27001. Private and internal addresses are refused |
| **Explain mode and glossary** | Jargon across the app is underlined: click any term for a plain-English explanation written for people new to GRC. Every page has a "How to use this page" guide, and the glossary lists 110+ terms |
| **Risk lab** | Quantitative calculator (AV, EF, SLE, ARO, ALE, safeguard value), qualitative matrix, practice questions and a glossary |

### Scoring rules

- **Risk score** = likelihood × impact (1–25). Low 1–4, medium 5–9, high 10–16, critical 20–25. **Appetite**: residual score ≤ 9.
- **Quantitative**: SLE = AV × EF; ALE = SLE × ARO; safeguard value = ALE before − ALE after − annual cost.
- **Requirement coverage** = average of mapped controls (implemented 1, partial 0.5, planned / not implemented 0). No mapped control = gap. Framework score = average across requirements.
- **Vendor tier**: data access (0–3) + criticality (0–2) + system access (+1). Tier 1 ≥ 5 (reassess yearly), Tier 2 ≥ 3 (every 2 years), Tier 3 (every 3 years).

The rules live in one file, [`shared/scoring.ts`](shared/scoring.ts), used by both the API and the UI, so a score previewed in a form is the score the server stores.

## Practice mode

Each scenario runs in its own SQLite file under `data/practice/`, so the demo is never touched. The review:

- pairs your risks with model risks by key ideas in the title, threat, vulnerability and description (you can override any pairing by hand);
- scores each model risk on whether you found it, then inherent score (35%), residual score (20%), treatment (20%) and linked controls (25%), giving partial credit for answers within a point or two;
- runs register checks (owners, residual scores, acceptance above appetite, mitigated risks without controls, quantitative analysis);
- hides risks you missed behind a hint until you choose to reveal them.

Scenarios and model answers live in [`server/src/scenarios.ts`](server/src/scenarios.ts). A test enters every model answer through the API and expects 100%.

## Architecture

```
grc-platform/
├── shared/scoring.ts     Scoring, compliance, tiering and date rules (API + UI)
├── server/               Node 24 API: Hono, zod validation, SQLite via node:sqlite
│   ├── src/db.ts         Schema
│   ├── src/entities.ts   Resource definitions: validation, queries, computed fields
│   ├── src/app.ts        Routes: generic CRUD + dashboard, mappings, assessments
│   ├── src/compliance.ts Framework coverage and gap analysis
│   ├── src/frameworks.ts NIST CSF 2.0, ISO 27001:2022 Annex A, SOC 2 catalogues
│   ├── src/seed.ts       Demo organisation (dates relative to today)
│   ├── src/scenarios.ts  Five practice scenarios with briefs and model answers
│   ├── src/practice.ts   Workspaces (one database per scenario) and the review
│   ├── src/sitecheck.ts  Passive website check with SSRF protection
│   └── test/             node:test suites for scoring and the API
└── web/                  React 19 + Vite + React Router, plain CSS with light/dark themes
    ├── src/glossary.ts   Beginner explanations behind Explain mode
    └── src/guides.ts     Step-by-step "How to use this page" guides
```

- **No database server and no native modules**: SQLite is built into Node (`node:sqlite`), and Node runs the TypeScript directly.
- Every write is validated with zod and recorded in an activity log (audit trail).
- In production the API serves the built UI, so it deploys as one process with one SQLite file.

## Run it

Requires Node 24.2 or newer (it uses built-in SQLite, native TypeScript and `import.meta.main`).

```bash
npm install
npm run dev        # API on :8787, UI on http://localhost:5173
```

The database is created at `data/grc.db` and seeded on first start.

```bash
npm test           # API and scoring tests
npm run typecheck
npm run seed       # wipe and reload the demo data
```

### Hosted version (Vercel)

The public site is a static build where the whole API runs **inside the visitor's browser**:

- the same Hono API code (`server/src/app.ts`) is bundled into the web app;
- SQLite runs as WebAssembly ([sql.js](https://sql.js.org)) behind the same small database interface as `node:sqlite`;
- each workspace (demo and practice scenarios) is saved in the browser's IndexedDB, so every visitor gets a private copy and nobody can change anyone else's work;
- the website check is the one server step: [`api/site-check.ts`](api/site-check.ts) is a stateless Vercel function that stores nothing and refuses private and internal addresses.

Every push to `main` deploys to production automatically through Vercel's GitHub integration, and pull requests get preview links. To build or deploy by hand:

```bash
npm run build:hosted -w web   # what Vercel builds (VITE_LOCAL_BACKEND=1)
vercel deploy --prod
```

### Self-hosted server

```bash
npm run build && npm start        # serves UI + API on $PORT (default 8787), data in SQLite files
```

or with Docker (mount a volume so data survives restarts):

```bash
docker build -t grc-workbench .
docker run -p 8080:8080 -v grc-data:/data grc-workbench
```

## Roadmap

- Sign-in with roles (risk owner, control owner, auditor, read-only) and per-user audit trail
- Evidence file uploads on controls and assessment items
- Key risk indicators with thresholds and trend charts
- Statement of Applicability export for ISO 27001
- Email reminders for overdue findings, policy reviews and vendor reassessments

## Notes

Maple Ridge Credit Union and all people, vendors and figures in the demo data are fictional. Framework requirement titles are short reference names; consult the published standards (NIST, ISO/IEC, AICPA) for full requirement text.
