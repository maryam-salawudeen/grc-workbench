// Plain-English explanations for every term used in the app, written for someone
// new to GRC. `aliases` are the words the Explain feature underlines in the UI.

export interface Term {
  id: string;
  term: string;
  aliases: string[];
  group: string;
  /** One sentence a beginner can hold on to. */
  short: string;
  /** A fuller explanation, no jargon. */
  explain: string;
  example?: string;
  /** Why a GRC professional cares. */
  why?: string;
  related?: string[];
}

export const GLOSSARY: Term[] = [
  // ---- The basics ------------------------------------------------------------
  {
    id: 'grc', term: 'GRC', aliases: ['GRC'], group: 'The basics',
    short: 'Governance, Risk and Compliance: how an organisation makes sure it is run safely and follows the rules.',
    explain: 'Governance is who decides and how (policies, roles, oversight). Risk is finding what could go wrong and deciding what to do about it. Compliance is proving you meet laws, contracts and standards. A GRC analyst connects all three.',
    example: 'A GRC analyst might keep the risk register, map controls to ISO 27001 and help prepare for an audit.',
    related: ['risk', 'policy', 'framework', 'compliance'],
  },
  {
    id: 'risk', term: 'Risk', aliases: ['Risk'], group: 'The basics',
    short: 'Something bad that might happen, and how much it would hurt.',
    explain: 'A risk has three parts: a threat (who or what could cause harm), a vulnerability (the weakness they would use) and an impact (the damage). Writing it as "threat exploits vulnerability, causing impact" makes it clear.',
    example: '"Phishing emails (threat) trick staff into giving passwords because MFA is off (vulnerability), letting attackers read patient emails (impact)."',
    why: 'Organisations cannot fix everything, so they rank risks to spend time and money where it matters most.',
    related: ['threat', 'vulnerability', 'impact', 'likelihood', 'risk-register'],
  },
  {
    id: 'threat', term: 'Threat', aliases: ['threat', 'threats'], group: 'The basics',
    short: 'Who or what could cause harm.',
    explain: 'A threat can be a person (a criminal, a careless employee), a group (a ransomware gang) or an event (a flood, a power cut). On its own a threat is not a problem; it becomes one when it meets a weakness.',
    example: 'Ransomware gangs, fraudsters, fire, a supplier going out of business.',
    related: ['risk', 'vulnerability'],
  },
  {
    id: 'vulnerability', term: 'Vulnerability', aliases: ['vulnerability', 'vulnerabilities', 'weakness'], group: 'The basics',
    short: 'A weakness a threat could take advantage of.',
    explain: 'It can be technical (software not updated), human (staff not trained) or process (payments approved by email only). Fixing vulnerabilities is how most controls reduce risk.',
    example: 'No MFA on email, a laptop without encryption, a door that is propped open.',
    related: ['threat', 'risk', 'control', 'patching'],
  },
  {
    id: 'asset', term: 'Asset', aliases: ['asset', 'assets'], group: 'The basics',
    short: 'Anything valuable to the organisation that needs protecting.',
    explain: 'Assets include data (customer records), systems (a website), devices (laptops), places (an office) and processes (paying suppliers). Risks are always about something happening to an asset.',
    example: 'The clinic\'s patient records system is its most important asset.',
    related: ['asset-value', 'classification', 'criticality'],
  },
  {
    id: 'likelihood', term: 'Likelihood', aliases: ['likelihood', 'Likelihood'], group: 'The basics',
    short: 'How likely the bad thing is to happen, scored 1 (rare) to 5 (almost certain).',
    explain: 'Look for clues: has it happened before? Is the weakness easy to use? Are attackers known to target this? If it happened last month and nothing changed, likelihood is high.',
    example: '1 Rare · 2 Unlikely · 3 Possible · 4 Likely · 5 Almost certain.',
    related: ['impact', 'risk-score'],
  },
  {
    id: 'impact', term: 'Impact', aliases: ['impact', 'Impact'], group: 'The basics',
    short: 'How much it would hurt if it happened, scored 1 (negligible) to 5 (severe).',
    explain: 'Think about money lost, harm to people, legal trouble, reputation and how long the business would be disrupted. Use the worst realistic outcome, not the worst imaginable one.',
    example: '1 Negligible · 2 Minor · 3 Moderate · 4 Major · 5 Severe.',
    related: ['likelihood', 'risk-score'],
  },
  {
    id: 'risk-score', term: 'Risk score', aliases: ['risk score', 'Risk score'], group: 'The basics',
    short: 'Likelihood × impact, giving a number from 1 to 25.',
    explain: 'Multiplying the two puts every risk on the same scale so you can compare them. Here 1–4 is low, 5–9 medium, 10–16 high and 20–25 critical.',
    example: 'Likelihood 4 × impact 5 = 20, which is critical.',
    related: ['likelihood', 'impact', 'heat-map', 'risk-appetite'],
  },
  {
    id: 'inherent', term: 'Inherent risk', aliases: ['inherent risk', 'Inherent risk', 'Inherent', 'inherent'], group: 'The basics',
    short: 'The risk as it is now, before the fixes you are proposing.',
    explain: 'Score inherent risk on the situation today. It shows how bad things are if you do nothing more. Some textbooks define it as "with no controls at all"; in practice most teams score the current state.',
    example: 'Email has no MFA and phishing just succeeded: inherent likelihood 5, impact 4 = 20.',
    related: ['residual', 'risk-score', 'control'],
  },
  {
    id: 'residual', term: 'Residual risk', aliases: ['residual risk', 'Residual risk', 'Residual', 'residual'], group: 'The basics',
    short: 'The risk left over after your fixes are in place.',
    explain: 'Once you choose controls, re-score likelihood and impact assuming they work. Residual risk is never zero. If it is still above appetite, you need more treatment or a senior person must formally accept it.',
    example: 'Turning on MFA drops likelihood from 5 to 2: residual 2 × 3 = 6.',
    related: ['inherent', 'risk-appetite', 'treatment'],
  },
  {
    id: 'risk-appetite', term: 'Risk appetite', aliases: ['risk appetite', 'appetite', 'Appetite'], group: 'The basics',
    short: 'How much risk the organisation is willing to live with.',
    explain: 'Leadership sets it. Risks under the appetite line can be accepted; risks above it must be reduced or escalated. In this app a residual score above 9 is above appetite.',
    example: 'A residual score of 12 is above appetite, so the owner must treat it further or escalate it.',
    related: ['risk-tolerance', 'residual', 'accept'],
  },
  {
    id: 'risk-tolerance', term: 'Risk tolerance', aliases: ['risk tolerance', 'tolerance'], group: 'The basics',
    short: 'How far you can go past the appetite for a specific risk before it is unacceptable.',
    explain: 'Appetite is the general target; tolerance is the acceptable wiggle room for one particular risk or objective.',
    related: ['risk-appetite'],
  },
  {
    id: 'heat-map', term: 'Heat map', aliases: ['heat map', 'Heat map'], group: 'The basics',
    short: 'A 5 × 5 grid that shows where risks sit by likelihood and impact.',
    explain: 'Each square is one likelihood/impact combination, coloured green to red. The number in a square is how many risks sit there. Click a square to see those risks.',
    why: 'Boards and managers understand a heat map at a glance.',
    related: ['risk-score', 'likelihood', 'impact'],
  },
  {
    id: 'risk-register', term: 'Risk register', aliases: ['risk register', 'Risk register'], group: 'The basics',
    short: 'The list of all identified risks, with scores, owners and plans.',
    explain: 'It is the main working document of risk management. Each row is one risk: what it is, how bad, who owns it, what is being done and by when.',
    related: ['risk', 'risk-owner', 'treatment'],
  },
  {
    id: 'risk-owner', term: 'Risk owner', aliases: ['risk owner', 'Risk owner', 'Owner'], group: 'The basics',
    short: 'The person accountable for deciding what to do about a risk.',
    explain: 'Usually a manager of the area affected, not the security team. They approve the treatment and, if needed, formally accept what is left.',
    example: 'The CFO owns the payment-fraud risk; IT helps fix it.',
    related: ['accept', 'treatment'],
  },
  {
    id: 'category', term: 'Risk category', aliases: ['Category', 'risk category'], group: 'The basics',
    short: 'A label that groups similar risks, such as Cyber, Third party or Compliance.',
    explain: 'Categories help you report ("we have 6 cyber risks and 2 privacy risks") and make sure no area is forgotten.',
    related: ['risk-register'],
  },

  // ---- Treatment -------------------------------------------------------------
  {
    id: 'treatment', term: 'Risk treatment', aliases: ['treatment', 'Treatment', 'treatment plan', 'Treatment plan'], group: 'Treating risk',
    short: 'What you decide to do about a risk. There are four choices.',
    explain: 'Mitigate (reduce it), accept (live with it), transfer (share the cost with someone else) or avoid (stop doing the risky thing). Most risks are mitigated.',
    related: ['mitigate', 'accept', 'transfer', 'avoid'],
  },
  {
    id: 'mitigate', term: 'Mitigate', aliases: ['mitigate', 'Mitigate', 'mitigation'], group: 'Treating risk',
    short: 'Reduce the risk by adding controls.',
    explain: 'You lower the likelihood (make it less likely), the impact (make it hurt less), or both.',
    example: 'MFA mitigates phishing; backups mitigate ransomware.',
    related: ['control', 'treatment'],
  },
  {
    id: 'accept', term: 'Accept', aliases: ['accept', 'Accept', 'accepted', 'Accepted', 'acceptance'], group: 'Treating risk',
    short: 'Decide to live with the risk, on purpose, and write it down.',
    explain: 'Acceptable when the risk is within appetite or fixing it would cost more than it saves. The owner signs off and it is reviewed later. Ignoring a risk is not acceptance.',
    example: 'Refund fraud costing $36,000 a year in a $9M business may be accepted.',
    related: ['risk-appetite', 'risk-owner'],
  },
  {
    id: 'transfer', term: 'Transfer', aliases: ['transfer', 'Transfer'], group: 'Treating risk',
    short: 'Share the cost of the risk with someone else, like an insurer.',
    explain: 'Insurance or contract terms (indemnities, service credits) mean someone else pays some of the bill. You cannot transfer accountability: customers and regulators still hold you responsible.',
    related: ['treatment', 'sla'],
  },
  {
    id: 'avoid', term: 'Avoid', aliases: ['avoid', 'Avoid', 'avoidance'], group: 'Treating risk',
    short: 'Stop doing the activity that creates the risk.',
    explain: 'The most complete option but often impractical, because the activity usually has value.',
    example: 'Replacing an old unsupported system avoids the risk of it being hacked.',
    related: ['treatment'],
  },
  {
    id: 'status', term: 'Risk status', aliases: ['In treatment', 'in treatment'], group: 'Treating risk',
    short: 'Where a risk is in its life: open, in treatment, accepted or closed.',
    explain: 'Open: identified, nothing decided. In treatment: the plan is under way. Accepted: formally accepted. Closed: no longer relevant or fully dealt with.',
    related: ['risk-register'],
  },

  // ---- Quantitative ----------------------------------------------------------
  {
    id: 'qualitative', term: 'Qualitative analysis', aliases: ['qualitative', 'Qualitative'], group: 'Putting a price on risk',
    short: 'Scoring risk with words or 1–5 scales instead of money.',
    explain: 'Quick and works when you lack data, but it depends on judgement. The 5 × 5 matrix is qualitative.',
    related: ['quantitative', 'risk-score'],
  },
  {
    id: 'quantitative', term: 'Quantitative analysis', aliases: ['quantitative analysis', 'Quantitative analysis', 'quantitative', 'Quantitative'], group: 'Putting a price on risk',
    short: 'Putting a dollar figure on a risk.',
    explain: 'You estimate what is at stake (AV), how much one incident destroys (EF) and how often it happens (ARO). From those you calculate the cost of one incident (SLE) and the cost per year (ALE).',
    why: 'Money figures help managers decide whether a control is worth buying.',
    related: ['av', 'ef', 'sle', 'aro', 'ale'],
  },
  {
    id: 'av', term: 'Asset value (AV)', aliases: ['AV', 'Asset value', 'asset value'], group: 'Putting a price on risk',
    short: 'What is at stake: the cost if the asset were lost completely.',
    explain: 'Include replacement cost, lost revenue, recovery work and fines that would follow. You type this number in.',
    example: 'The clinic values its records and systems at $400,000.',
    related: ['ef', 'sle'],
  },
  {
    id: 'ef', term: 'Exposure factor (EF)', aliases: ['EF', 'Exposure factor', 'exposure factor'], group: 'Putting a price on risk',
    short: 'How much of the asset one incident destroys, as a percentage.',
    explain: '100% means total loss; 25% means a quarter is lost. You type this number in.',
    example: 'Ransomware would wipe out about half, so EF = 50%.',
    related: ['av', 'sle'],
  },
  {
    id: 'sle', term: 'Single loss expectancy (SLE)', aliases: ['SLE', 'Single loss expectancy', 'single loss expectancy'], group: 'Putting a price on risk',
    short: 'The cost of ONE incident. SLE = AV × EF.',
    explain: 'The app calculates it for you. "Single" is the clue: one event.',
    example: '$400,000 × 50% = $200,000 per incident.',
    related: ['av', 'ef', 'ale'],
  },
  {
    id: 'aro', term: 'Annualised rate of occurrence (ARO)', aliases: ['ARO', 'Annualised rate of occurrence', 'annualised rate of occurrence', 'Annualised rate'], group: 'Putting a price on risk',
    short: 'How many times a year you expect the incident.',
    explain: 'Once a year = 1. Twice a year = 2. Once every 5 years = 1 ÷ 5 = 0.2. Once every 10 years = 0.1. You type this number in.',
    example: 'Floods expected once every 20 years: ARO = 0.05.',
    related: ['sle', 'ale'],
  },
  {
    id: 'ale', term: 'Annualised loss expectancy (ALE)', aliases: ['ALE', 'Annualised loss expectancy', 'annualised loss expectancy'], group: 'Putting a price on risk',
    short: 'The average cost of the risk PER YEAR. ALE = SLE × ARO.',
    explain: 'The app calculates it. It spreads the cost of rare incidents over the years so you can compare risks and budgets.',
    example: '$200,000 × 0.2 = $40,000 a year.',
    why: 'A control is usually only worth it if it costs less per year than the loss it prevents.',
    related: ['sle', 'aro', 'safeguard-value'],
  },
  {
    id: 'safeguard-value', term: 'Safeguard value', aliases: ['safeguard value', 'Safeguard value', 'cost-justified'], group: 'Putting a price on risk',
    short: 'Whether a control is worth its price: ALE before − ALE after − yearly cost.',
    explain: 'If the answer is positive, the control saves more than it costs. If negative, look for a cheaper option, transfer or acceptance.',
    example: '$80,000 − $20,000 − $25,000 = $35,000 saved a year.',
    related: ['ale', 'control'],
  },

  // ---- Controls --------------------------------------------------------------
  {
    id: 'control', term: 'Control', aliases: ['control', 'controls', 'Control', 'Controls', 'countermeasure'], group: 'Controls',
    short: 'Anything that reduces a risk: a tool, a rule or a process.',
    explain: 'Controls are described two ways: by category (administrative, technical, physical) and by function (preventive, detective, corrective, deterrent, recovery, compensating).',
    example: 'MFA (technical, preventive), security training (administrative, deterrent), CCTV (physical, detective).',
    related: ['preventive', 'administrative', 'implementation', 'effectiveness'],
  },
  {
    id: 'preventive', term: 'Preventive control', aliases: ['preventive', 'Preventive'], group: 'Controls',
    short: 'Stops something bad from happening in the first place.',
    explain: 'The most valuable kind, because the incident never occurs.', example: 'MFA, firewalls, door locks.', related: ['control', 'detective'],
  },
  {
    id: 'detective', term: 'Detective control', aliases: ['detective', 'Detective'], group: 'Controls',
    short: 'Spots something bad while or after it happens.',
    explain: 'It cannot stop the event, but it limits damage by raising the alarm early.', example: 'Log monitoring, CCTV, audits.', related: ['control', 'siem'],
  },
  {
    id: 'corrective', term: 'Corrective control', aliases: ['corrective', 'Corrective'], group: 'Controls',
    short: 'Fixes things after something bad happens.',
    explain: 'It limits the damage and gets systems back to normal.', example: 'Patching a hacked server, an incident response plan.', related: ['control', 'recovery'],
  },
  {
    id: 'deterrent', term: 'Deterrent control', aliases: ['deterrent', 'Deterrent'], group: 'Controls',
    short: 'Discourages people from trying.',
    explain: 'It works on people\'s minds rather than blocking them.', example: 'Warning signs, visible cameras, a disciplinary policy.', related: ['control'],
  },
  {
    id: 'recovery', term: 'Recovery control', aliases: ['recovery', 'Recovery'], group: 'Controls',
    short: 'Restores operations after a serious incident.',
    explain: 'Goes further than corrective: it brings back whole systems or sites.', example: 'Backups, a disaster recovery site.', related: ['backup', 'drp'],
  },
  {
    id: 'compensating', term: 'Compensating control', aliases: ['compensating', 'Compensating', 'compensating controls'], group: 'Controls',
    short: 'A substitute used when the normal control is not possible.',
    explain: 'It gives similar protection another way.', example: 'An old system cannot use MFA, so it is isolated on its own network and watched closely.', related: ['control', 'legacy'],
  },
  {
    id: 'administrative', term: 'Administrative control', aliases: ['administrative', 'Administrative'], group: 'Controls',
    short: 'A rule, policy, process or training (also called managerial).',
    explain: 'These controls work through people following instructions.', example: 'Policies, background checks, training.', related: ['control', 'technical', 'physical'],
  },
  {
    id: 'technical', term: 'Technical control', aliases: ['technical', 'Technical'], group: 'Controls',
    short: 'A control built into technology (also called logical).',
    explain: 'It works automatically through software or hardware.', example: 'Encryption, MFA, antivirus.', related: ['control', 'administrative'],
  },
  {
    id: 'physical', term: 'Physical control', aliases: ['physical', 'Physical'], group: 'Controls',
    short: 'A control you can touch: locks, guards, cameras.',
    explain: 'Protects buildings, rooms and equipment.', example: 'Badge readers, fences, CCTV.', related: ['control'],
  },
  {
    id: 'implementation', term: 'Implementation status', aliases: ['Implementation', 'Implementation status', 'Not implemented', 'not implemented'], group: 'Controls',
    short: 'How far a control is in place: implemented, partial, planned or not implemented.',
    explain: 'Implemented: fully in place. Partial: in place for some systems or people. Planned: approved but not started. Not implemented: missing. This drives the compliance score.',
    related: ['control', 'compliance-score'],
  },
  {
    id: 'effectiveness', term: 'Control effectiveness', aliases: ['effectiveness', 'Effectiveness', 'Effect.'], group: 'Controls',
    short: 'How well a control actually works when tested, from 1 to 5.',
    explain: 'A control can exist on paper but fail in practice. Testing checks it is designed well and operating as intended.',
    related: ['control-testing'],
  },
  {
    id: 'control-testing', term: 'Control testing', aliases: ['Last tested', 'Next test', 'control testing'], group: 'Controls',
    short: 'Checking that a control really works, on a schedule.',
    explain: 'For example, try a restore to prove backups work, or check a sample of leavers had access removed. Overdue tests are flagged.',
    related: ['effectiveness', 'evidence'],
  },
  {
    id: 'mapping', term: 'Control mapping', aliases: ['mappings', 'Mappings', 'Framework mappings'], group: 'Controls',
    short: 'Linking one control to every framework requirement it satisfies.',
    explain: 'Instead of separate controls for ISO, NIST and SOC 2, you build one control and show which requirements it meets. This is called a common control framework.',
    why: 'Test once, use the evidence for every audit.',
    related: ['framework', 'requirement'],
  },
  {
    id: 'function', term: 'Control function', aliases: ['Function'], group: 'Controls',
    short: 'What a control does: prevent, detect, correct, deter, recover or compensate.',
    explain: 'Choosing a mix matters: if prevention fails, detection and recovery limit the damage. This is called defence in depth.',
    related: ['preventive', 'detective', 'corrective'],
  },

  // ---- Frameworks and audits -------------------------------------------------
  {
    id: 'framework', term: 'Framework', aliases: ['framework', 'frameworks', 'Framework', 'Frameworks'], group: 'Frameworks and audits',
    short: 'A published list of good security practices to measure yourself against.',
    explain: 'Frameworks give a common language and checklist. Some can be certified (ISO 27001), some are reports from auditors (SOC 2), and some are guidance (NIST CSF).',
    related: ['nist-csf', 'iso27001', 'soc2', 'requirement'],
  },
  {
    id: 'requirement', term: 'Requirement', aliases: ['requirement', 'requirements', 'Requirement'], group: 'Frameworks and audits',
    short: 'One item in a framework that you must meet.',
    explain: 'Each has a reference so everyone can find it, such as A.8.13 (ISO backups) or PR.AA (NIST identity and access).',
    related: ['framework', 'mapping'],
  },
  {
    id: 'nist-csf', term: 'NIST CSF', aliases: ['NIST CSF', 'NIST CSF 2.0', 'NIST Cybersecurity Framework'], group: 'Frameworks and audits',
    short: 'A free US framework that organises security into six functions.',
    explain: 'Govern, Identify, Protect, Detect, Respond, Recover. It is guidance, not a certification, and is popular as a maturity baseline.',
    related: ['framework'],
  },
  {
    id: 'iso27001', term: 'ISO 27001', aliases: ['ISO 27001', 'ISO/IEC 27001', 'ISO 27001:2022', 'ISO-27001'], group: 'Frameworks and audits',
    short: 'The international standard for an information security management system; organisations can be certified.',
    explain: 'It requires a risk-based management system plus a set of 93 controls listed in Annex A. An external auditor certifies you.',
    related: ['annex-a', 'soa', 'framework'],
  },
  {
    id: 'annex-a', term: 'Annex A', aliases: ['Annex A'], group: 'Frameworks and audits',
    short: 'The list of 93 security controls in ISO 27001.',
    explain: 'Grouped into Organizational (5.x), People (6.x), Physical (7.x) and Technological (8.x). You decide which apply and why, in a Statement of Applicability.',
    related: ['iso27001', 'soa'],
  },
  {
    id: 'soa', term: 'Statement of Applicability (SoA)', aliases: ['Statement of Applicability', 'SoA'], group: 'Frameworks and audits',
    short: 'An ISO 27001 document listing every Annex A control, whether it applies and why.',
    explain: 'Auditors use it to check you considered every control.', related: ['annex-a'],
  },
  {
    id: 'soc2', term: 'SOC 2', aliases: ['SOC 2', 'SOC2', 'SOC 2 Type II', 'SOC 2 Type I', 'Type II'], group: 'Frameworks and audits',
    short: 'An audit report, common for tech companies, showing customers your controls work.',
    explain: 'An independent CPA firm tests your controls against the Trust Services Criteria. Type I checks design at one point in time; Type II checks they operated over a period (often 6–12 months).',
    related: ['tsc', 'framework'],
  },
  {
    id: 'tsc', term: 'Trust Services Criteria', aliases: ['Trust Services Criteria', 'Common Criteria', 'Common criteria'], group: 'Frameworks and audits',
    short: 'The criteria a SOC 2 auditor tests against.',
    explain: 'The Security category (the Common Criteria CC1–CC9) is always included; Availability, Confidentiality, Processing Integrity and Privacy are optional.',
    related: ['soc2'],
  },
  {
    id: 'compliance-score', term: 'Compliance score', aliases: ['compliance', 'Compliance', 'Average compliance', 'compliance %'], group: 'Frameworks and audits',
    short: 'How much of a framework is covered by working controls, as a percentage.',
    explain: 'Each requirement scores the average of its mapped controls: implemented 1, partial 0.5, planned or missing 0. A requirement with no control scores 0.',
    related: ['gap', 'mapping'],
  },
  {
    id: 'gap', term: 'Gap', aliases: ['gap', 'gaps', 'Gap analysis', 'gap analysis', 'No control'], group: 'Frameworks and audits',
    short: 'A requirement you do not meet yet.',
    explain: 'A gap analysis compares where you are with where the framework says you should be. Each gap becomes work to do.',
    related: ['compliance-score', 'finding'],
  },
  {
    id: 'coverage', term: 'Coverage', aliases: ['Coverage', 'coverage', 'Not met'], group: 'Frameworks and audits',
    short: 'Whether a requirement is met, partly met, not met or has no control.',
    explain: 'Met: all mapped controls implemented. Partial: some. Not met: mapped controls exist but are not in place. No control: nothing mapped yet.',
    related: ['gap'],
  },
  {
    id: 'assessment', term: 'Assessment', aliases: ['assessment', 'assessments', 'Assessment', 'Assessments', 'audit', 'internal audit'], group: 'Frameworks and audits',
    short: 'A structured check of how well you meet a framework.',
    explain: 'You go through each requirement, look at evidence and record a result. Internal assessments prepare you for the real external audit.',
    related: ['evidence', 'finding', 'result'],
  },
  {
    id: 'result', term: 'Assessment result', aliases: ['Compliant', 'compliant', 'Non-compliant', 'non-compliant', 'Partially compliant', 'Not assessed', 'Not applicable', 'N/A'], group: 'Frameworks and audits',
    short: 'Your verdict on one requirement: compliant, partial, non-compliant or not applicable.',
    explain: 'Base it on evidence, not on what people tell you. Non-compliant or partial results usually become findings.',
    related: ['assessment', 'finding'],
  },
  {
    id: 'evidence', term: 'Evidence', aliases: ['evidence', 'Evidence'], group: 'Frameworks and audits',
    short: 'Proof that a control works: documents, screenshots, logs, samples.',
    explain: 'Auditors say "if it isn\'t documented, it didn\'t happen". Good evidence is dated, complete and from the system itself.',
    example: 'A screenshot of MFA settings, a signed policy, a list of leavers with access removal dates.',
    related: ['assessment', 'control-testing'],
  },
  {
    id: 'finding', term: 'Finding', aliases: ['finding', 'findings', 'Finding', 'Findings'], group: 'Frameworks and audits',
    short: 'A problem found during an assessment, audit or check, tracked until it is fixed.',
    explain: 'A good finding states the condition (what is wrong), the requirement it breaks, the risk, a severity, an owner and a due date.',
    related: ['severity', 'remediation'],
  },
  {
    id: 'severity', term: 'Severity', aliases: ['severity', 'Severity'], group: 'Frameworks and audits',
    short: 'How serious a finding is: low, medium, high or critical.',
    explain: 'It decides how fast the finding must be fixed. Critical findings usually need action within days.',
    related: ['finding'],
  },
  {
    id: 'remediation', term: 'Remediation', aliases: ['remediation', 'Remediation', 'Remediation plan'], group: 'Frameworks and audits',
    short: 'The work to fix a finding.',
    explain: 'It has an owner and due date. Once done, someone checks the fix worked before closing the finding.',
    related: ['finding'],
  },
  {
    id: 'overdue', term: 'Overdue', aliases: ['overdue', 'Overdue', 'Due soon'], group: 'Frameworks and audits',
    short: 'Past its due date.',
    explain: 'Overdue findings, reviews and tests are a common audit concern: they show the programme is not keeping up.',
  },

  // ---- Governance ------------------------------------------------------------
  {
    id: 'policy', term: 'Policy', aliases: ['policy', 'policies', 'Policy', 'Policies'], group: 'Governance',
    short: 'A management-approved rule that says what must be done.',
    explain: 'Policies say what and why ("all staff must use MFA"); standards and procedures say how. Policies need an owner, an approval date and regular review.',
    related: ['review-cycle'],
  },
  {
    id: 'review-cycle', term: 'Review cycle', aliases: ['Review cycle', 'review cycle', 'Next review'], group: 'Governance',
    short: 'How often a policy must be re-checked and re-approved, usually yearly.',
    explain: 'Out-of-date policies are an easy audit finding.', related: ['policy'],
  },
  {
    id: 'governance', term: 'Governance', aliases: ['Governance', 'governance'], group: 'Governance',
    short: 'How decisions about security are made and checked.',
    explain: 'Roles, policies, committees and reporting to leadership.', related: ['grc', 'policy'],
  },

  // ---- Third parties ---------------------------------------------------------
  {
    id: 'third-party', term: 'Third-party risk', aliases: ['third-party risk', 'Third-party risk', 'Third party', 'third party', 'third parties', 'vendors', 'Vendors'], group: 'Third parties',
    short: 'Risk that comes from suppliers and partners who handle your data or run your systems.',
    explain: 'Their breach can become your breach. You manage it by tiering vendors, checking them (due diligence), writing security into contracts and re-checking regularly.',
    related: ['tier', 'due-diligence'],
  },
  {
    id: 'tier', term: 'Vendor tier', aliases: ['Tier', 'tier', 'Tier 1', 'Tier 2', 'Tier 3'], group: 'Third parties',
    short: 'How closely a vendor must be checked: Tier 1 most, Tier 3 least.',
    explain: 'Here it is worked out from the data the vendor sees, how critical it is and whether it can reach your systems. Tier 1 is reassessed yearly, Tier 2 every two years, Tier 3 every three.',
    related: ['third-party', 'classification', 'criticality'],
  },
  {
    id: 'due-diligence', term: 'Due diligence', aliases: ['due diligence', 'Due diligence', 'Assurance', 'questionnaire'], group: 'Third parties',
    short: 'Checking a vendor before and while you use them.',
    explain: 'Ask for security reports (SOC 2, ISO certificate), send a questionnaire, review the contract. Due care is acting responsibly; due diligence is the checking that informs it.',
    related: ['third-party', 'soc2'],
  },
  {
    id: 'sla', term: 'SLA', aliases: ['SLA', 'service level agreement', 'uptime'], group: 'Third parties',
    short: 'Service level agreement: what a vendor promises, such as 99.9% uptime.',
    explain: 'If they miss it you may get service credits. An SLA reduces impact only if it is backed by a real recovery plan.',
    related: ['transfer'],
  },
  {
    id: 'classification', term: 'Data classification', aliases: ['Classification', 'classification', 'Restricted', 'restricted', 'Confidential', 'confidential'], group: 'Third parties',
    short: 'Labelling data by how sensitive it is: public, internal, confidential, restricted.',
    explain: 'The label decides how it must be handled. Restricted data (health records, ID documents, card data) needs the strongest protection.',
    related: ['asset', 'tier'],
  },
  {
    id: 'criticality', term: 'Criticality', aliases: ['Criticality', 'criticality', 'Business criticality'], group: 'Third parties',
    short: 'How much the business depends on something.',
    explain: 'A critical system or vendor stops the business when it fails.', related: ['asset', 'tier'],
  },

  // ---- Security controls in plain words ----------------------------------------
  {
    id: 'mfa', term: 'MFA', aliases: ['MFA', 'Multi-factor authentication', 'multi-factor authentication', 'two-factor'], group: 'Security terms',
    short: 'Multi-factor authentication: proving it is you with two things, like a password plus a phone code.',
    explain: 'A stolen password alone is no longer enough. App-based codes and passkeys are stronger than text messages.',
    related: ['phishing', 'sim-swap'],
  },
  {
    id: 'edr', term: 'EDR', aliases: ['EDR', 'Endpoint detection & response', 'endpoint protection'], group: 'Security terms',
    short: 'Endpoint detection and response: modern antivirus that also watches for suspicious behaviour.',
    explain: 'It runs on laptops and servers ("endpoints"), blocks malware and lets the security team investigate and isolate a device.',
    related: ['ransomware'],
  },
  {
    id: 'siem', term: 'SIEM', aliases: ['SIEM', 'logging', 'Logging', 'Centralised logging', 'monitoring'], group: 'Security terms',
    short: 'A system that collects logs from everywhere and raises alerts.',
    explain: 'Logs are records of what happened (logins, changes). Without central logging you cannot spot or investigate an attack.',
    related: ['detective', 'incident-response'],
  },
  {
    id: 'dlp', term: 'DLP', aliases: ['DLP', 'Data loss prevention', 'data loss prevention'], group: 'Security terms',
    short: 'Data loss prevention: tools that stop sensitive data leaving by email, USB or upload.',
    explain: 'Rules look for things like card numbers or health data and block or warn.', related: ['classification'],
  },
  {
    id: 'encryption', term: 'Encryption', aliases: ['encryption', 'Encryption', 'encrypted', 'unencrypted', 'Full-disk encryption', 'full-disk encryption'], group: 'Security terms',
    short: 'Scrambling data so only someone with the key can read it.',
    explain: '"At rest" protects stored data (a lost laptop); "in transit" protects data moving across a network (HTTPS). Encryption usually lowers impact, not likelihood.',
    related: ['https'],
  },
  {
    id: 'segmentation', term: 'Network segmentation', aliases: ['segmentation', 'Segmentation', 'flat network', 'VLAN'], group: 'Security terms',
    short: 'Splitting a network into separate zones so one breach cannot spread everywhere.',
    explain: 'Guest Wi-Fi, office PCs and critical systems should be on different segments with firewalls between them. A "flat network" has no separation.',
    related: ['firewall'],
  },
  {
    id: 'firewall', term: 'Firewall', aliases: ['firewall', 'Firewall'], group: 'Security terms',
    short: 'A filter that decides which network traffic is allowed in or out.',
    explain: 'It enforces the boundaries between network segments and the internet.', related: ['segmentation'],
  },
  {
    id: 'pam', term: 'Privileged access management', aliases: ['privileged access', 'Privileged access', 'PAM', 'admin access', 'standing admin', 'privileged'], group: 'Security terms',
    short: 'Tight control over administrator accounts, which can change anything.',
    explain: 'Admins get access only when needed, sessions are recorded and access is reviewed regularly.', related: ['least-privilege'],
  },
  {
    id: 'least-privilege', term: 'Least privilege', aliases: ['least privilege', 'Least privilege', 'least-privilege'], group: 'Security terms',
    short: 'Give people only the access they need to do their job, nothing more.',
    explain: 'Fewer permissions means less damage if an account is misused or stolen.', related: ['pam', 'sod'],
  },
  {
    id: 'sod', term: 'Segregation of duties', aliases: ['segregation of duties', 'Segregation of duties', 'separation of duties'], group: 'Security terms',
    short: 'No single person should be able to complete a risky task alone.',
    explain: 'Split steps between people so mistakes and fraud get caught.', example: 'One person enters a payment, another approves it.', related: ['least-privilege'],
  },
  {
    id: 'jml', term: 'Joiner-mover-leaver', aliases: ['joiner-mover-leaver', 'Joiner-mover-leaver', 'leaver', 'leavers', 'offboarding'], group: 'Security terms',
    short: 'The process for giving, changing and removing access when people start, change job or leave.',
    explain: 'Forgotten accounts of people who have left are a classic weakness.', related: ['least-privilege'],
  },
  {
    id: 'patching', term: 'Patch management', aliases: ['patching', 'Patching', 'Vulnerability & patch management', 'unpatched', 'Unpatched'], group: 'Security terms',
    short: 'Installing security updates quickly and on a schedule.',
    explain: 'Attackers use known flaws that already have fixes. A patch SLA (for example "critical within 14 days") keeps you ahead.',
    related: ['vulnerability', 'legacy'],
  },
  {
    id: 'legacy', term: 'Legacy system', aliases: ['legacy', 'Legacy', 'unsupported', 'end of life'], group: 'Security terms',
    short: 'Old technology the vendor no longer updates.',
    explain: 'New flaws are never fixed, so you either replace it (avoid) or protect it with compensating controls.', related: ['compensating', 'patching'],
  },
  {
    id: 'phishing', term: 'Phishing', aliases: ['phishing', 'Phishing'], group: 'Security terms',
    short: 'Fake messages that trick people into giving passwords or clicking malware.',
    explain: 'The most common way attacks start. Defences: MFA, training, email filtering.', related: ['mfa', 'bec'],
  },
  {
    id: 'ransomware', term: 'Ransomware', aliases: ['ransomware', 'Ransomware'], group: 'Security terms',
    short: 'Malware that locks your files and demands payment.',
    explain: 'Modern gangs also steal data and threaten to publish it. Best defences: good backups kept offline, EDR, MFA and patching.', related: ['backup', 'edr'],
  },
  {
    id: 'bec', term: 'Business email compromise', aliases: ['business email compromise', 'BEC', 'banking-detail fraud', 'wire fraud'], group: 'Security terms',
    short: 'Fraud where criminals pose as a supplier or boss by email to redirect payments.',
    explain: 'Stopped by calling the supplier back on a known number before changing bank details.', related: ['phishing'],
  },
  {
    id: 'credential-stuffing', term: 'Credential stuffing', aliases: ['credential stuffing', 'Credential stuffing'], group: 'Security terms',
    short: 'Trying usernames and passwords leaked from other websites.',
    explain: 'Works because people reuse passwords. Defences: MFA, rate limiting, bot detection.', related: ['mfa'],
  },
  {
    id: 'sim-swap', term: 'SIM swap', aliases: ['SIM swap', 'SIM-swap', 'SIM swaps'], group: 'Security terms',
    short: 'Tricking a phone company into moving someone\'s number to the criminal\'s SIM card.',
    explain: 'The criminal then receives text-message codes. That is why app-based MFA is safer than SMS.', related: ['mfa'],
  },
  {
    id: 'backup', term: 'Backup', aliases: ['backup', 'backups', 'Backup', 'Backups', 'immutable', 'Immutable'], group: 'Security terms',
    short: 'A copy of data you can restore from.',
    explain: '"Immutable" backups cannot be changed or deleted, even by an attacker with admin rights. A backup you have never restored from is not proven to work.',
    related: ['ransomware', 'recovery'],
  },
  {
    id: 'drp', term: 'Business continuity / DR', aliases: ['disaster recovery', 'Disaster recovery', 'business continuity', 'Business continuity', 'continuity plan'], group: 'Security terms',
    short: 'Plans for keeping the business running, and recovering IT, after a disruption.',
    explain: 'Includes targets like RTO (how fast to recover) and RPO (how much data you can afford to lose), plus manual workarounds.', related: ['backup', 'recovery'],
  },
  {
    id: 'incident-response', term: 'Incident response', aliases: ['incident response', 'Incident response'], group: 'Security terms',
    short: 'The plan for what to do when an attack or breach happens.',
    explain: 'Who to call, how to contain it, how to recover and who must be notified. Practise it with tabletop exercises.', related: ['siem'],
  },
  {
    id: 'sdlc', term: 'Secure SDLC', aliases: ['SDLC', 'Secure SDLC', 'secure development', 'code review'], group: 'Security terms',
    short: 'Building security into how software is written, tested and released.',
    explain: 'Includes code review, scanning for flaws and secrets, and testing before release.', related: ['change-management'],
  },
  {
    id: 'change-management', term: 'Change management', aliases: ['change management', 'Change management', 'CAB', 'Change advisory board', 'change approval'], group: 'Security terms',
    short: 'Reviewing and approving changes to systems before they go live.',
    explain: 'Stops untested or unauthorised changes breaking things. A change advisory board (CAB) approves significant changes.', related: ['sdlc'],
  },
  {
    id: 'scada', term: 'SCADA / OT', aliases: ['SCADA', 'operational technology', 'OT'], group: 'Security terms',
    short: 'Systems that control physical equipment, like pumps at a water plant.',
    explain: 'Called operational technology (OT). An attack can affect safety, so it must be kept separate from office IT.', related: ['segmentation'],
  },

  // ---- Laws and rules ----------------------------------------------------------
  {
    id: 'pipeda', term: 'PIPEDA', aliases: ['PIPEDA'], group: 'Laws and rules (Canada)',
    short: 'Canada\'s federal privacy law for businesses.',
    explain: 'It covers how private companies collect, use and protect personal information, and requires reporting serious breaches.', related: ['privacy'],
  },
  {
    id: 'phipa', term: 'PHIPA', aliases: ['PHIPA'], group: 'Laws and rules (Canada)',
    short: 'Ontario\'s health privacy law.',
    explain: 'Clinics and hospitals ("custodians") must protect personal health information and report certain breaches to patients and the Information and Privacy Commissioner.', related: ['privacy'],
  },
  {
    id: 'mfippa', term: 'MFIPPA', aliases: ['MFIPPA'], group: 'Laws and rules (Canada)',
    short: 'Ontario\'s privacy and access-to-information law for municipalities.',
    explain: 'Towns must protect residents\' personal information and respond to information requests.', related: ['privacy'],
  },
  {
    id: 'casl', term: 'CASL', aliases: ['CASL'], group: 'Laws and rules (Canada)',
    short: 'Canada\'s anti-spam law.',
    explain: 'You need consent before sending marketing emails, and must make unsubscribing easy.', related: ['privacy'],
  },
  {
    id: 'pci', term: 'PCI DSS', aliases: ['PCI DSS', 'PCI'], group: 'Laws and rules (Canada)',
    short: 'The card-payment industry\'s security standard.',
    explain: 'Any business that takes card payments must follow it. Breaches can bring fines and the loss of the ability to take cards.', related: ['encryption'],
  },
  {
    id: 'kyc', term: 'KYC', aliases: ['KYC'], group: 'Laws and rules (Canada)',
    short: 'Know Your Customer: checking customers\' identity, required for financial services.',
    explain: 'Usually means collecting ID documents, which are very sensitive and must be strongly protected.', related: ['classification'],
  },
  {
    id: 'privacy', term: 'Privacy', aliases: ['privacy', 'Privacy', 'personal information', 'PII', 'privacy breach'], group: 'Laws and rules (Canada)',
    short: 'Handling people\'s personal information fairly, legally and securely.',
    explain: 'Security protects data; privacy is about whether you should collect and use it at all, and telling people when it is exposed.', related: ['pipeda', 'phipa'],
  },

  // ---- Website check ---------------------------------------------------------
  {
    id: 'https', term: 'HTTPS', aliases: ['HTTPS'], group: 'Website security',
    short: 'The secure version of web browsing; the padlock in the address bar.',
    explain: 'HTTPS encrypts traffic between the visitor and the site so nobody in between can read or change it. Plain HTTP sends everything in the clear.',
    related: ['tls-certificate', 'hsts'],
  },
  {
    id: 'tls-certificate', term: 'TLS certificate', aliases: ['TLS certificate', 'certificate', 'Certificate', 'TLS'], group: 'Website security',
    short: 'The website\'s ID card, proving the site is really who it claims to be.',
    explain: 'Issued by a trusted authority and valid for a limited time. An expired or wrong certificate shows visitors a scary warning.',
    related: ['https'],
  },
  {
    id: 'hsts', term: 'HSTS', aliases: ['HSTS', 'Strict-Transport-Security'], group: 'Website security',
    short: 'A setting that tells browsers to always use HTTPS for this site.',
    explain: 'Without it, a visitor\'s first request might go over plain HTTP and be intercepted on public Wi-Fi.',
    related: ['https', 'security-header'],
  },
  {
    id: 'csp', term: 'Content Security Policy', aliases: ['CSP', 'Content Security Policy', 'Content-Security-Policy'], group: 'Website security',
    short: 'Rules telling the browser which scripts and content the page may load.',
    explain: 'It limits damage from injected scripts, such as card skimmers or cross-site scripting (XSS).',
    related: ['security-header', 'xss'],
  },
  {
    id: 'xss', term: 'Cross-site scripting (XSS)', aliases: ['XSS', 'cross-site scripting'], group: 'Website security',
    short: 'An attack that sneaks malicious script into a web page.',
    explain: 'The script runs in visitors\' browsers and can steal sessions or data.', related: ['csp'],
  },
  {
    id: 'clickjacking', term: 'Clickjacking', aliases: ['clickjacking', 'Clickjacking', 'X-Frame-Options', 'frame-ancestors'], group: 'Website security',
    short: 'Hiding a real site inside another page to trick people into clicking buttons.',
    explain: 'Prevented by telling browsers the site must not be shown inside other sites\' frames (X-Frame-Options or CSP frame-ancestors).',
    related: ['security-header'],
  },
  {
    id: 'security-header', term: 'Security header', aliases: ['security header', 'security headers', 'Security headers'], group: 'Website security',
    short: 'Instructions a website sends to the browser to turn on protections.',
    explain: 'They are free to add, invisible to visitors and switch on browser defences such as HTTPS-only (HSTS) or script rules (CSP).',
    related: ['hsts', 'csp', 'clickjacking'],
  },
  {
    id: 'cookie', term: 'Cookie flags', aliases: ['cookie', 'cookies', 'Cookie', 'Cookies', 'HttpOnly', 'SameSite'], group: 'Website security',
    short: 'Settings that protect the small files that keep you logged in.',
    explain: 'Secure: only sent over HTTPS. HttpOnly: scripts cannot read it, so XSS cannot steal it. SameSite: not sent with requests from other sites, which blocks some attacks.',
    related: ['https', 'xss'],
  },
  {
    id: 'security-txt', term: 'security.txt', aliases: ['security.txt'], group: 'Website security',
    short: 'A small file that tells researchers how to report a security problem.',
    explain: 'It lives at /.well-known/security.txt. Without it, people who find a flaw may not know who to tell.',
    related: ['incident-response'],
  },
  {
    id: 'info-disclosure', term: 'Information disclosure', aliases: ['information disclosure', 'Information disclosure', 'Server header', 'X-Powered-By', 'server banner'], group: 'Website security',
    short: 'Revealing technical details that help attackers.',
    explain: 'Telling the world the exact server software and version makes it easier to look up known flaws.',
    related: ['patching'],
  },
  {
    id: 'passive-check', term: 'Passive check', aliases: ['passive', 'Passive', 'passive check'], group: 'Website security',
    short: 'Looking only at what any visitor\'s browser already sees, without attacking anything.',
    explain: 'This app reads the home page, its headers, its certificate and security.txt. It does not try to log in, guess pages or exploit anything. Still, only check sites you own or have permission to assess.',
  },
];

const byId = new Map(GLOSSARY.map((t) => [t.id, t]));
export const termById = (id: string) => byId.get(id);
