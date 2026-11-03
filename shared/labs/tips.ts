// Study help for every lab: a short "before you start" explanation of the idea the
// lab practises, and one hint per step. Hints point to where to look or what to
// think about; they should not give the answer away.

export interface LabTips {
  before: string;
  hints: string[];
}

export const LAB_TIPS: Record<string, LabTips> = {
  'access-review': {
    before: 'An access review checks that everyone with access still needs it. You compare the access list with HR records and the job each person does now. Look for three things: people who have left, people who changed jobs and kept old access, and accounts nobody owns.',
    hints: [
      'Read the HR status, last login and notes columns together. Be careful with deletions: removing an account that is still in use can break something.',
      'Think about what the login after the termination date might mean, and whether disabling the account is enough on its own.',
      'Who knows what each person\'s job needs? IT can see access but cannot judge need.',
      'The person moved teams and kept the old rights. What is the name for access building up over time?',
      'Auditors want proof the review happened and that the decisions were carried out. Statements are weaker than records.',
    ],
  },
  'phishing-results': {
    before: 'A phishing test sends a fake scam email to see how staff react. The numbers tell you where to focus, but the goal is behaviour: people who spot a scam and report it quickly. Shame drives the opposite.',
    hints: [
      'Use the Total row: clicks divided by staff, then times 100.',
      'Same method, using the "Entered a password" column.',
      'Which behaviour helps you stop a real attack early, for everyone?',
      'Some of these help people learn; some just make people hide mistakes. Three people gave away passwords: what technical control limits that damage?',
      'Acknowledge his concern, explain the effect naming people has on reporting, then offer a better alternative.',
    ],
  },
  'mfa-exception': {
    before: 'A policy exception is a formal, temporary permission to skip a rule. Exceptions are approved by the policy owner, not by the person asking, and they come with compensating controls and an end date.',
    hints: [
      'Read section 4.7 of the policy. Who does it say can approve?',
      'Look for options that solve the inconvenience while keeping a second factor in place.',
      'The policy extract sets a maximum length.',
      'Be friendly, say what you cannot do and why, and offer a practical way forward.',
    ],
  },
  'data-classification': {
    before: 'Data classification labels information by how much harm its exposure would cause. The label then decides how it must be protected. The data owner chooses the label; the custodian applies the protections.',
    hints: [
      'For each one ask: who would be harmed if this leaked, and how badly? Check the four definitions.',
      'Who is accountable for this data? That is different from who runs the servers.',
      'Two harmless lists combined reveal something sensitive. What is that called?',
      'Which role carries out the owner\'s decisions day to day?',
    ],
  },
  'privacy-misdirected': {
    before: 'Most privacy breaches are honest mistakes. The usual order is contain, record the facts, tell the privacy lead, assess, notify and then fix the cause. Fast reporting by staff is what makes containment possible.',
    hints: [
      'Stop the harm first, then make sure the right people know, then deal with notification and prevention.',
      'Read the PHIPA line in the procedure. Does deleting the email undo the disclosure?',
      'Think of the three core properties: confidentiality, integrity and availability. Which one did this break?',
      'Look for changes to the process or the tools. Consider what punishing someone for reporting would teach other staff.',
    ],
  },
  'media-disposal': {
    before: 'Sanitisation removes data so it cannot be recovered. The right method depends on the media type and whether it will be reused. Before anything is destroyed, check retention and legal holds.',
    hints: [
      'Ask two questions for each item: is it paper, magnetic or flash memory? And will it be reused or thrown away?',
      'Past retention is necessary but not always enough. What could stop records being destroyed?',
      'Degaussing uses a strong magnetic field. Which media do not store data magnetically?',
      'Think about what an auditor would want to see later as proof.',
    ],
  },
  'password-guidance': {
    before: 'Current guidance, such as NIST SP 800-63B, focuses on long passphrases, blocking known breached passwords and multi-factor authentication. Complexity rules and scheduled changes make passwords more predictable, not stronger.',
    hints: [
      'Ask whether each change makes passwords harder to guess or just harder to remember.',
      'Which control still protects the account when the password is stolen?',
      'Cover length, unique passwords, when to change one, and MFA, in words staff will follow.',
    ],
  },
  'policy-reviews': {
    before: 'Policies need an owner and a regular review, usually yearly. A review checks the content still fits the law and the way the organisation works, and ends with re-approval, a new version and a date.',
    hints: [
      'Today is 3 November 2026. Count 12 months back from today and compare each approval date.',
      'Can staff be held to a document management has not approved?',
      'Think about what evidence an auditor would expect to see after a review.',
    ],
  },
  'awareness-plan': {
    before: 'Good awareness programmes are short, frequent and tailored to each role, and they are measured. Match the topic to the people who face that risk in their daily work.',
    hints: [
      'Think about each group\'s daily tasks. Who handles patient requests, who takes devices home, who makes breach decisions?',
      'How much do people remember from a once-a-year session, and how much time do clinic staff have?',
      'Look for measures that show behaviour or outcomes changing, not just activity.',
    ],
  },
  'vendor-offboarding': {
    before: 'Ending a vendor relationship is like a staff leaver, but with more places to look. Find all their access, remove it, change any shared secrets they knew, and get your data back or destroyed.',
    hints: [
      'You can only remove what you know about. What comes before any removal?',
      'The data is your customers\'. What proof would you keep for an auditor or regulator?',
      'Which terms are easier to agree at the start of a contract than at the end?',
    ],
  },
  'vendor-questionnaire': {
    before: 'A vendor questionnaire collects evidence about a supplier\'s security. Read it for vague or missing answers: no dates, no numbers, no names. Then tier the vendor by risk and decide what to ask for.',
    hints: [
      'Look for answers that are old, optional, vague or missing a list. Strong technical answers are not red flags.',
      'Combine three things: how sensitive the data is, how much the clinic depends on it, and whether it connects to clinic systems.',
      'Turn each vague answer into a specific contract term.',
      'Is there a setting the clinic controls inside the product?',
    ],
  },
  'audit-evidence': {
    before: 'Audit evidence must cover the whole audit period and come from the process itself. The auditor picks the sample so the test stays independent. Exceptions that were caught and fixed should be shown openly.',
    hints: [
      'The request asks for backups performed and tested during the period. Which items show that over time?',
      'Who should choose the sample so the result can be trusted?',
      'Daily controls get larger samples than monthly or quarterly ones.',
      'What does a failure that was detected and fixed say about the control? Hiding it changes the question.',
    ],
  },
  'tablet-ale': {
    before: 'Quantitative risk puts a price on risk. SLE = asset value × exposure factor is the cost of one incident. ALE = SLE × ARO is the cost per year. A safeguard is worth buying when the loss it prevents is bigger than its yearly cost.',
    hints: [
      'Each theft costs $1,500 in total, and a stolen tablet is a total loss.',
      'Multiply the cost of one theft by how many happen in a year.',
      'Same calculation, with the vendor\'s new rate of thefts.',
      'ALE before minus ALE after, then subtract the yearly cost. A negative answer is possible.',
      'Look at your answer to the last step. Is there a price at which it would make sense?',
      'Which number came from the person selling the product?',
    ],
  },
  'incident-triage': {
    before: 'Triage decides how serious an alert is and what happens first. Use the organisation\'s severity matrix, verify quickly through a trusted channel, then contain the threat before investigating in depth.',
    hints: [
      'Check the matrix: what kind of account is this, and is there a sign of compromise?',
      'Verify, contain, preserve evidence, investigate, recover, then write it up.',
      'Which phase is about limiting damage while you investigate?',
      'Notification decisions need people with legal and compliance authority.',
      'The attacker got past MFA. Which changes address how this happened and limit what a stolen login can do?',
    ],
  },
  'change-review': {
    before: 'Change management makes sure changes are reviewed, tested and approved by someone other than the person making them. Freeze periods block non-emergency changes when the business can least afford an outage.',
    hints: [
      'Check the date against the freeze, and look at how complete the request is.',
      'Compare the request with the policy, and think about what a new script on a payment page could do.',
      'An emergency fixes a live problem causing harm now.',
    ],
  },
  'risk-acceptance': {
    before: 'Accepting a risk is a deliberate decision by someone senior enough to own the consequences. It only makes sense within appetite, usually depends on compensating controls, and always has an end date.',
    hints: [
      'Who is accountable for the town\'s risks? Analysts recommend; they do not accept.',
      'Compare inherent and residual scores with the appetite. What has to be true first?',
      'Imagine someone reading this in a year. What would they need to know?',
      'Describe the risk, the scores, the controls with owners and dates, the conditions and the expiry. Add a signature line.',
    ],
  },
  'firewall-review': {
    before: 'Firewall rules are read top to bottom and should allow only what is needed. Look for rules that are too broad, connect untrusted networks to trusted ones, expose admin services to the internet, or are labelled "temporary".',
    hints: [
      'For each rule ask: is the source trusted, is the destination sensitive, and is the service needed?',
      'What happens to traffic that no rule allows?',
      'Vendor access should have one controlled entry point that you can switch off and record.',
      'It is the network zone for public-facing servers.',
    ],
  },
  'contract-clauses': {
    before: 'Contracts are a security control. Look for terms covering breach notice, audit rights, subprocessors, data location and what happens to data at the end. Remember what risk transfer can and cannot move.',
    hints: [
      'Read the summary and ask what is missing about breaches, assurance, other parties, location and exit.',
      'Compare the cap with what a breach of 400,000 ID documents would really cost.',
      'Can a contract move accountability, or only some of the cost?',
    ],
  },
  'sod-review': {
    before: 'Segregation of duties splits steps so one person cannot commit and hide fraud alone. The classic conflicts are creating a vendor and paying it, approving and paying, and paying and reconciling.',
    hints: [
      'Look for one person holding two steps that together allow fraud or concealment.',
      'If you cannot split the duties, what would catch misuse after the fact?',
      'Two people must act together on the same step. What is that called?',
    ],
  },
  'vuln-priorities': {
    before: 'A CVSS score measures how severe a flaw is, not how risky it is for you. Combine severity with exposure to the internet, signs of active exploitation and what the system does.',
    hints: [
      'Rank by internet exposure, active exploitation and impact on people. A score alone can mislead.',
      'Some serious weaknesses are configuration problems that have no CVE number.',
      'You cannot patch another organisation\'s system. What can you do?',
    ],
  },
  'shared-responsibility': {
    before: 'In the cloud, the provider secures the underlying infrastructure and the customer secures what it builds and configures on top. Data and user access always stay with the customer.',
    hints: [
      'Ask who can actually touch it: the physical building, the virtualisation layer, or Aurora\'s own settings and code?',
      'What does the customer control even in software as a service?',
      'The less the provider manages, the more falls to the customer.',
    ],
  },
  'register-cleanup': {
    before: 'A good risk statement names the cause, the event and the effect, so it can be scored and treated. Each risk needs a named person as owner and a recent review.',
    hints: [
      'Check each row for a clear statement, a named owner, a recent review and duplication.',
      'Look for the option that says why it could happen, what happens, and what the impact is.',
      'Fewer, specific risks with one owner each are easier to manage than several vague ones.',
      'Ask: because of what, could what happen, leading to what impact for the town? Then name an owner.',
    ],
  },
  'kri-thresholds': {
    before: 'Key risk indicators warn that risk is rising before an incident. Thresholds turn numbers into green, amber and red. Anchor them to policy where you can, and watch the trend as well as the latest value.',
    hints: [
      'Which kind of indicator gives early warning of exposure?',
      'Compare each October number with its policy or target, and look at the direction over three months.',
      'Would 17 mean the same thing if it were falling instead of rising?',
    ],
  },
  'emr-roles': {
    before: 'Role-based access gives each role only the permissions its tasks need. Start from the tasks, apply least privilege and need to know, and add regular reviews to catch people looking where they should not.',
    hints: [
      'Who legally or practically does each task in a clinic?',
      'Does the front desk need clinical detail to do its own job?',
      'Roles prevent. What would detect misuse by someone who has legitimate access?',
    ],
  },
  'cloud-posture': {
    before: 'Cloud posture tools flag risky settings. Rank them for your business: what data is involved, whether it is reachable from the internet, and how much an attacker could do with it.',
    hints: [
      'Start with anything that may be exposing data right now, then powerful accounts, then open admin access.',
      'Closing the bucket stops future access. What about the time it was open?',
      'The provider supplies the setting. Who chooses its value?',
    ],
  },
  'dpia-location': {
    before: 'A privacy impact assessment checks a new use of personal data before it is built. Test every data point against the stated purpose: collect only what is needed, keep it only as long as needed, and use it only for that purpose.',
    hints: [
      'The purpose is checking a payment\'s location. What goes beyond that?',
      'Look for the option that still meets the fraud purpose with the least data.',
      'Location is sensitive. What does the person need to understand and agree to?',
    ],
  },
  'customer-questionnaire': {
    before: 'Answering customer questionnaires is about being accurate without being unhelpful. "Not yet, here is the plan and date" is a valid answer. Keep evidence ready for every "Yes".',
    hints: [
      'Answer from the engineering facts only. Where something is in progress, say so and give a date.',
      'Which evidence comes from the system itself rather than a person\'s word?',
      'Think about what happens when the bank checks, and what the answer becomes once the contract is signed.',
    ],
  },
  'bia-targets': {
    before: 'A business impact analysis turns business consequences into recovery targets. Maximum tolerable downtime (MTD) is how long the business can survive an outage. The recovery time objective (RTO) must be shorter. The recovery point objective (RPO) is how much data you can afford to lose.',
    hints: [
      'At what point does the business suffer harm it cannot survive or undo?',
      'The RTO must leave room inside the MTD. When do the penalties start?',
      'How many hours of orders can the team re-key by hand?',
      'Compare the backup frequency with the RPO, and the restore time with the RTO.',
      'Look for changes that meet the targets. Changing the targets to fit the system does not count.',
    ],
  },
  'leaver-control-test': {
    before: 'Control testing checks whether a control worked across a sample. Record every exception, calculate the rate and conclude honestly. Findings follow the structure condition, criteria, cause, effect and recommendation.',
    hints: [
      'Count business days only. Friday to Monday is one business day.',
      'Exceptions divided by sample size, times 100.',
      'Would you trust a control that failed in nearly a third of cases?',
      'You found a live risk. What should happen before anything else?',
      'Write each part in turn: what you found, the rule it breaks, why it happened, why it matters, and what to do.',
    ],
  },
  'soa-applicability': {
    before: 'An ISO 27001 Statement of Applicability lists all 93 Annex A controls, says whether each applies, why, and whether it is in place. Excluding a control needs a real reason. Relying on a provider means verifying the provider.',
    hints: [
      'Does Aurora have any physical premises or devices at all?',
      'Match each control to a fact in Fatima\'s message.',
      'Think about what an auditor checks the SoA against.',
      'Who has physical access to the data centres, and how would Aurora get assurance?',
    ],
  },
  'board-slide': {
    before: 'Boards make decisions about risks outside appetite and about funding. A good board update leads with the overall position, names the few things that need attention in plain words, and ends with a clear ask.',
    hints: [
      'What does the committee need to decide or know? Technical detail and long lists do not help them.',
      'Which kind of indicator warns that risk is rising?',
      'Give the position against appetite, name the two problem risks plainly, say what is being done, and make one ask.',
    ],
  },
  'tabletop-lessons': {
    before: 'A tabletop exercise walks through an incident on paper to find gaps before a real one. The value comes afterwards: each gap becomes an action with an owner and a date, and is checked later.',
    hints: [
      'For each problem, ask what would have prevented that particular delay or confusion.',
      'Reviewing what happened comes after the incident is over.',
      'Summarise the findings, list specific actions with owners and dates, and plan a follow-up.',
    ],
  },
  'management-response': {
    before: 'A management response answers an audit finding. It says whether management agrees, fixes the root cause with specific actions, names owners and dates, and explains how the fix will be checked.',
    hints: [
      'What would convince an auditor that the problem will not happen again?',
      'The cause was emergency access by phone. Which actions keep speed while adding approval and detection?',
      'Agree, state the cause, list actions with owners and dates, and say how effectiveness will be tested.',
    ],
  },
  'pci-scope': {
    before: 'PCI DSS applies to every system that stores, processes or transmits card data, and to systems connected to them. The easiest way to shrink the work is to stop card numbers touching your systems at all.',
    hints: [
      'Follow the full card number. Where does it go? The last four digits are treated differently.',
      'Which option means card numbers never reach Northline\'s own servers?',
      'Full card numbers outside the payment system are a serious problem. What else might have happened to that file?',
      'Confirm scope can shrink, name today\'s in-scope systems, and give a fix for the website, the phone orders and the spreadsheet.',
    ],
  },
  'audit-plan': {
    before: 'Internal audit time is limited, so plans are risk based: focus on high residual risk, areas getting worse, areas not audited for a long time, and areas of outside interest. The board approves the plan to keep audit independent.',
    hints: [
      'Rank by residual risk, time since the last audit and the notes column.',
      'What should drive where limited audit time goes?',
      'Who can approve the plan without being one of the areas audited?',
    ],
  },
  'ransom-decision': {
    before: 'Paying a ransom is a business and legal decision for senior leaders. Before deciding, involve law enforcement, the insurer and legal advisers, and find out whether backups can restore the systems.',
    hints: [
      'Which people and facts does the town need before any decision can be informed?',
      'What does a criminal\'s promise guarantee?',
      'Say what happened, what the backups mean, the risks of paying, your recommendation and the next update.',
    ],
  },
  'soc-report-review': {
    before: 'A SOC 2 Type II report tests a vendor\'s controls over a period. Read the opinion, the period, the exceptions, any carved-out subservice organisations and the complementary user entity controls, which are the customer\'s own responsibilities.',
    hints: [
      'The report covers last year. What covers the months since?',
      'These are controls the report assumes someone else runs. Who?',
      'A clean opinion can still contain exceptions and gaps worth following up.',
    ],
  },
};
