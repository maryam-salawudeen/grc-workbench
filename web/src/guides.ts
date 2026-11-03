// "How to use this page" guides for beginners, keyed by route pattern.

export interface Guide {
  what: string;
  steps: string[];
  tip?: string;
}

export const GUIDES: Record<string, Guide> = {
  '/': {
    what: 'The dashboard is the one-page summary a manager or board would look at. It pulls numbers from every other page.',
    steps: [
      'Read the cards across the top: each one is a headline number. Click a card to open the page behind it.',
      'Look at the heat map: squares further up and to the right are the most serious risks. Switch between Inherent (today) and Residual (after fixes).',
      'Check "Top risks" for anything marked "Above appetite": these need attention first.',
      'Look at the three framework rings to see how compliant the organisation is with each standard.',
      'Use "Coming up and overdue" as a to-do list.',
    ],
    tip: 'In an interview, being able to explain a dashboard like this in two minutes is a strong signal.',
  },
  '/risks': {
    what: 'The risk register lists everything that could go wrong, how bad it is and what is being done about it.',
    steps: [
      'Click "New risk" to add one. Write the title as "threat exploits weakness, causing impact".',
      'Pick the affected asset, and an owner (the manager accountable for it).',
      'Score likelihood and impact from 1 to 5 based on the situation today. That is the inherent risk.',
      'Choose a treatment: mitigate, accept, transfer or avoid.',
      'Open the risk afterwards to link the controls that reduce it, then score the residual risk (what is left once the controls work).',
      'Use the heat map and filters to find the worst risks. Rows shaded red are above appetite.',
    ],
  },
  '/risks/:id': {
    what: 'One risk in detail: its description, scores, treatment and the controls that reduce it.',
    steps: [
      'Edit any field in the form on the left and click "Save changes".',
      'Click "Manage" under Mitigating controls to link the controls that reduce this risk.',
      'Score the residual likelihood and impact assuming those controls work.',
      'If the brief or data gives dollar values, fill in AV, EF and ARO to see the cost per incident (SLE) and per year (ALE).',
      'Check the Risk score card: the arrow shows how far your controls bring the risk down, and whether it is now within appetite.',
    ],
  },
  '/assets': {
    what: 'Assets are the things worth protecting: data, systems, devices, places and processes.',
    steps: [
      'Review each asset\'s classification (how sensitive) and criticality (how much the business depends on it).',
      'Note the asset value: you will use it as AV in quantitative analysis.',
      'Add any asset the brief mentions that is missing, with an owner.',
    ],
    tip: 'Every risk should point at an asset. If you cannot name the asset, the risk is probably too vague.',
  },
  '/controls': {
    what: 'Controls are the protections in place or planned. One list serves every framework.',
    steps: [
      'Check the Implementation column: green is in place, amber partial, blue planned, red missing.',
      'Filter by status to find gaps quickly.',
      'Click a control to change its status, see which framework requirements it meets and which risks it reduces.',
    ],
  },
  '/controls/:id': {
    what: 'One control: what kind it is, whether it is in place, and what it covers.',
    steps: [
      'Set the implementation status and, if it has been tested, the effectiveness (1–5) and test date.',
      'Look at Framework mappings: these are the requirements this control helps meet.',
      'Click "Edit mappings" to add or remove requirements.',
      'Save: every framework score that uses this control updates straight away.',
    ],
  },
  '/frameworks': {
    what: 'Frameworks are published standards (NIST CSF, ISO 27001, SOC 2). Each ring shows how much of the standard is met.',
    steps: [
      'Compare the three scores: they use the same controls, so a fix often helps all three.',
      'Click a framework to see each requirement and which controls cover it.',
    ],
  },
  '/frameworks/:id': {
    what: 'A gap analysis: every requirement in the framework, and whether your controls cover it.',
    steps: [
      'Look at "Coverage by domain" to find the weakest area.',
      'Filter by "No control" to list requirements nobody has addressed yet. These are your gaps.',
      'Click a control chip to open it, or export the gap analysis as a CSV for a report.',
    ],
  },
  '/assessments': {
    what: 'Assessments are audits or readiness reviews against one framework.',
    steps: [
      'Click "New assessment", give it a title and choose a framework.',
      'The app creates a checklist with one item per requirement.',
      'Open it to work through the checklist.',
    ],
  },
  '/assessments/:id': {
    what: 'The audit checklist: one row per requirement.',
    steps: [
      'For each requirement, look at the evidence and choose a result: compliant, partial, non-compliant or not applicable.',
      'Click "Notes" to record what evidence you reviewed.',
      'Not sure where to start? "Pre-fill from controls" suggests results from the current control status. Review each one.',
      'For anything non-compliant or partial, click "Raise finding" so it gets fixed.',
    ],
    tip: 'Auditors trust evidence, not what people say. Write down what you looked at.',
  },
  '/findings': {
    what: 'Findings are problems found in audits or checks, tracked until they are fixed.',
    steps: [
      'Sort by severity: critical and high come first.',
      'Each finding needs an owner, a due date and a remediation plan.',
      'Rows shaded red are overdue: chase these.',
      'When the fix is done and checked, set the status to Closed.',
    ],
  },
  '/policies': {
    what: 'The policy library: the rules management has approved, and when each must be reviewed.',
    steps: [
      'Check the Next review column: overdue policies are an easy audit finding.',
      'Click a policy to update its version, approval date or status.',
    ],
  },
  '/vendors': {
    what: 'Vendors are suppliers who handle your data or systems. Their risk becomes your risk.',
    steps: [
      'Look at each vendor\'s tier: Tier 1 needs the most checking.',
      'The tier comes from the data they see, how critical they are and whether they can reach your systems.',
      'Check "Next assessment": vendors never assessed or overdue need due diligence (for example, ask for their SOC 2 report).',
    ],
  },
  '/people': {
    what: 'People are the owners you assign to risks, controls, policies and vendors.',
    steps: ['Add anyone who should own something. Accountability needs a name, not a department.'],
  },
  '/inbox': {
    what: 'Your work inbox. As a junior GRC analyst at a consultancy, you get requests from client staff: emails, tickets and Teams messages, each with the files you need.',
    steps: [
      'Start at the top of Week 1. The requests get harder week by week, like a real first month.',
      'Open a request, read the message and the attachments, then work through the steps on the right.',
      'Submit each step to get feedback straight away. Retry any step if you want to improve your score.',
      'When every step is done, read the debrief: what the work looks like on the job, plus a CISSP exam tip.',
    ],
    tip: 'Filter by CISSP domain to practise the area you are studying this week.',
  },
  '/inbox/:id': {
    what: 'One request from a client. The message and its attachments are on the left; your deliverable is on the right.',
    steps: [
      'Read the whole message first, as you would at work. Note who is asking and what they actually need.',
      'Use the attachments as your evidence. Most answers depend on a detail in a table or policy extract.',
      'Answer each step and submit it. Green means correct, amber partly right, red not quite. Every option explains why.',
      'For written steps, write your own answer first, then compare it with the model answer and tick what you covered.',
    ],
  },
  '/practice': {
    what: 'Case studies are client engagements: you assess a whole organisation from a brief and build its risk register, then compare with a model answer.',
    steps: [
      'Start with the Foundation scenario (the clinic).',
      'Click "Start scenario": you get a separate, empty workspace. The demo data is not affected.',
      'Read the brief, build the risk register, then click "Check my work".',
      'Reset and try again as often as you like.',
    ],
  },
  '/practice/brief': {
    what: 'The case study. Everything you need to find the risks is in this text.',
    steps: [
      'Read the whole brief once. Then read it again, highlighting every weakness and every incident.',
      'Each weakness plus a threat is a risk. Recent incidents tell you likelihood is high.',
      'Click "Open the register with this brief beside it". The brief stays docked on the right (or behind the round Brief button on a phone) while you type, with tabs for asset values, your tasks and notes.',
      'Add one risk at a time in the risk register.',
      'Use the asset values in the brief for AV, EF and ARO.',
      'When you have 5 or more risks with controls and residual scores, click "Check my work".',
    ],
  },
  '/practice/review': {
    what: 'Your register compared with a model answer, with an explanation for every score.',
    steps: [
      'Look at your overall score and the breakdown bars to see which skill needs work.',
      'Fix anything flagged under "Register checks".',
      'For each risk, compare your scores with the model\'s and read the explanation.',
      'Missed a risk? Use the hint to find it in the brief before revealing the answer.',
      'Edit your register and come back: the score recalculates each time.',
    ],
    tip: 'Within one point of the model is good. Risk scoring is judgement; the reasons matter more than the number.',
  },
  '/lab': {
    what: 'A practice area for the maths behind risk.',
    steps: [
      'Open "What do AV, EF, SLE, ARO and ALE mean?" and read the five steps in order.',
      'Change the numbers in the calculator and watch the working update.',
      'Try the safeguard side: is the control worth its yearly cost?',
      'Answer the practice questions; each one explains the right answer.',
    ],
  },
  '/learn': {
    what: 'A tour of how the pieces of GRC connect: assets, risks, controls, frameworks, assessments and findings.',
    steps: [
      'Read the cycle at the top, then each step in order.',
      'Use the "In this app" box at the end of each step to open the matching page and see it in practice.',
      'Check the CISSP table at the bottom to find labs for the domain you are studying.',
    ],
  },
  '/sync': {
    what: 'Use the same work on your phone and laptop without an account.',
    steps: [
      'On the device that has your work, click "Turn on sync".',
      'Scan the QR code with your phone camera, or open the link on your other computer, then tap Join.',
      'From then on, each device picks up the other\'s changes when you open it.',
    ],
    tip: 'Keep the sync code private. It is the only key to your synced work.',
  },
  '/glossary': {
    what: 'Every term used in the app, explained for someone new to GRC.',
    steps: ['Search for a word, or browse by group.', 'Tip: with Explain mode on, underlined words anywhere in the app open these explanations.'],
  },
  '/website-check': {
    what: 'A passive security check of a website: what any visitor\'s browser can already see.',
    steps: [
      'Type the address of a site you own or have permission to assess, and tick the permission box.',
      'Click "Check website". It reads the home page, its security headers, its certificate and its security.txt file.',
      'Read each result: what was found, why it matters and how to fix it.',
      'Tick the problems you want to track and click "Add to findings". They appear on the Findings page, mapped to ISO 27001.',
    ],
    tip: 'Checking a vendor\'s public website is a quick first step in due diligence, but it never replaces asking for their security reports.',
  },
};

/** Turn a pathname like /risks/12 into its guide key, /risks/:id. */
export function guideFor(pathname: string): Guide | undefined {
  if (GUIDES[pathname]) return GUIDES[pathname];
  if (pathname.startsWith('/inbox/')) return GUIDES['/inbox/:id'];
  const generic = pathname.replace(/\/\d+$/, '/:id');
  return GUIDES[generic];
}
