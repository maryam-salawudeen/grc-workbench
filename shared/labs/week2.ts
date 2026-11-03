import type { Lab } from './types.ts';

export const WEEK2: Lab[] = [
  {
    id: 'tablet-ale',
    week: 2,
    level: 'Medium',
    title: 'Is the $18,000 tablet mount worth it?',
    client: 'Pinecrest Logistics',
    from: { name: 'Grace Adeyemi', role: 'Chief Operating Officer' },
    channel: 'Email',
    received: 'Monday 8:45',
    priority: 'Normal',
    minutes: 15,
    domain: 1,
    skills: ['Quantitative risk', 'Cost-benefit'],
    message: [
      'Hi,',
      'Drivers\' tablets keep getting stolen from cabs. A vendor is offering lockable mounts with tracking for $18,000 a year across the fleet. They say it will cut thefts by three quarters.',
      'Is it worth it? I need a yes or no for Thursday.',
      'Grace',
    ],
    attachments: [
      {
        kind: 'text',
        title: 'Fleet tablet losses, last 12 months',
        body: [
          '12 tablets stolen.',
          'Each tablet costs $900 to replace. Setting up a new one and the driver\'s lost time add $600, so each theft costs $1,500 in total.',
          'Tablets are managed and encrypted, so no customer data is exposed.',
          'Vendor estimate: with the mounts, about 3 thefts a year.',
        ],
      },
    ],
    steps: [
      { type: 'number', prompt: 'What is the single loss expectancy (SLE) for one stolen tablet?', answer: 1500, tolerance: 0, unit: '$', working: 'AV is $1,500 per incident and a theft loses all of it (EF 100%), so SLE = $1,500 × 100% = $1,500.' },
      { type: 'number', prompt: 'What is the annualised loss expectancy (ALE) today?', answer: 18000, tolerance: 0, unit: '$', working: 'ARO is 12 thefts a year. ALE = $1,500 × 12 = $18,000.' },
      { type: 'number', prompt: 'What would the ALE be with the mounts?', answer: 4500, tolerance: 0, unit: '$', working: 'ARO drops to 3. ALE = $1,500 × 3 = $4,500.' },
      { type: 'number', prompt: 'What is the yearly value of the safeguard?', answer: -4500, tolerance: 0, unit: '$', working: 'Value = ALE before − ALE after − annual cost = $18,000 − $4,500 − $18,000 = −$4,500. It costs more than it saves.' },
      {
        type: 'single',
        prompt: 'What do you recommend to Grace?',
        options: [
          { text: 'Buy it. Fewer thefts is always better', why: 'It would lose about $4,500 a year compared with doing nothing.' },
          { text: 'Not at $18,000. Negotiate the price or look at cheaper locks, and keep tracking losses', correct: true, why: 'At any price under $13,500 a year the mounts pay for themselves, so there is a deal to be had.' },
          { text: 'Accept the losses forever', why: 'Accepting is reasonable for now, but you should still look for a cheaper control.' },
          { text: 'Insure the tablets instead', why: 'Insurance might help, but premiums and deductibles on $900 devices rarely beat a cheap lock.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Which figure would you challenge first?',
        options: [
          { text: 'The vendor\'s estimate of 3 thefts a year', correct: true, why: 'It comes from the seller and drives the whole result. Ask for evidence from similar fleets.' },
          { text: 'The $900 tablet price', why: 'That comes from your own invoices.' },
          { text: 'The 12 thefts last year', why: 'That is your own incident data.' },
          { text: 'The EF of 100%', why: 'A stolen tablet is a total loss, so 100% is right.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Managers rarely ask "what is the ALE?". They ask "is it worth it?". Quantitative analysis gives a defensible answer, and the useful insight is often the break-even price, here $13,500, which turns a no into a negotiation.',
        'Always ask where each number came from. Estimates from the person selling the control deserve the most scrutiny.',
      ],
      examTip: 'Safeguard value = ALE before − ALE after − annual cost of the safeguard. If the result is negative, the exam expects you not to buy the control at that price.',
    },
  },

  {
    id: 'incident-triage',
    week: 2,
    level: 'Medium',
    title: 'ALERT: impossible travel on an admin account',
    client: 'Aurora Pay',
    from: { name: 'SOC (managed service)', role: 'Security monitoring' },
    channel: 'Ticket',
    received: 'Monday 8:27',
    priority: 'Urgent',
    minutes: 20,
    domain: 7,
    skills: ['Incident triage', 'Incident response'],
    message: [
      'Ticket SOC-4471. Severity to be confirmed by the client.',
      'User jordan.blake (Head of Platform Engineering, cloud administrator) signed in from Toronto at 08:02. At 08:19 the same account signed in from a hosting provider IP address in another country. An MFA push was approved at 08:19. At 08:24 the account created a new cloud access key.',
      'Mei Lin asked us to loop you in as the GRC analyst on call this week.',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Aurora Pay incident severity matrix',
        columns: ['Level', 'When to use it', 'Response'],
        rows: [
          ['SEV1 Critical', 'Likely compromise of privileged access or customer data', 'Incident lead paged now, CTO informed, war room'],
          ['SEV2 High', 'Likely compromise of a standard account, or a contained malware infection', 'Incident lead within 1 hour'],
          ['SEV3 Medium', 'Suspicious activity with no sign of compromise', 'Next business day'],
          ['SEV4 Low', 'Policy breach with no security impact', 'Tracked in the normal queue'],
        ],
      },
    ],
    steps: [
      {
        type: 'single',
        prompt: 'Which severity applies?',
        options: [
          { text: 'SEV1 Critical', correct: true, why: 'An admin account was used from an unusual location, the MFA prompt was approved and a new access key was created: a likely privileged compromise.' },
          { text: 'SEV2 High', why: 'SEV2 is for standard accounts. This is a cloud administrator.' },
          { text: 'SEV3 Medium', why: 'There are signs of compromise: the MFA approval and the new key.' },
          { text: 'SEV4 Low', why: 'There is a potential security impact.' },
        ],
      },
      {
        type: 'order',
        prompt: 'Put the first actions in a sensible order.',
        items: [
          { text: 'Call Jordan on a known phone number to ask if it was him', why: 'A two-minute check tells you whether you are dealing with travel or an attacker. Use a channel the attacker does not control.' },
          { text: 'Disable the new access key and revoke Jordan\'s active sessions', why: 'Containment: cut off the attacker\'s access quickly.' },
          { text: 'Export and preserve sign-in and cloud audit logs', why: 'Protect the evidence before anything is cleaned up or ages out.' },
          { text: 'Review everything the new key did', why: 'Investigation: what was accessed, changed or created.' },
          { text: 'Reset Jordan\'s password and re-enrol his MFA', why: 'Eradication and recovery: remove the attacker\'s way back in.' },
          { text: 'Write the incident report and lessons learned', why: 'Post-incident work comes last.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Disabling the key and revoking sessions belongs to which incident response phase?',
        options: [
          { text: 'Detection and analysis', why: 'That was the SOC alert and your triage.' },
          { text: 'Containment', correct: true, why: 'Containment limits the damage while you investigate.' },
          { text: 'Eradication', why: 'Eradication removes the cause, such as resetting credentials or removing malware.' },
          { text: 'Recovery', why: 'Recovery returns systems to normal operation.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Logs show the new key listed the KYC storage bucket but downloaded nothing. Who needs to know now?',
        options: [
          { text: 'All Aurora users, by email', why: 'Too early. There is no evidence their data was accessed.' },
          { text: 'The incident lead and the Chief Compliance Officer, who decide on regulator and customer notification', correct: true, why: 'Notification decisions belong to people with legal and compliance authority, based on the evidence.' },
          { text: 'Nobody, nothing was downloaded', why: 'A privileged compromise still needs to be recorded and assessed. Listing the bucket means the attacker was close to sensitive data.' },
          { text: 'The media, to get ahead of the story', why: 'External communications follow the incident and legal process.' },
        ],
      },
      {
        type: 'multi',
        prompt: 'Jordan confirms he did not sign in. Which changes would best stop a repeat?',
        options: [
          { text: 'Phishing-resistant MFA (security keys or passkeys) for administrators', correct: true, why: 'Push approvals can be tricked or fatigued. Security keys cannot be approved by mistake.' },
          { text: 'Just-in-time admin access instead of standing admin rights', correct: true, why: 'With no standing admin rights, a stolen login does far less.' },
          { text: 'Alert when a new access key is created', correct: true, why: 'Key creation is a strong signal an attacker is setting up persistence.' },
          { text: 'Make Jordan\'s password longer', why: 'The attacker got past MFA. A longer password does not address how this happened.' },
        ],
      },
    ],
    debrief: {
      work: [
        'GRC analysts are not usually the people disabling keys, but you will sit on incident calls, check severity against policy, track actions and make sure notification decisions are made and recorded.',
        'Most of the value comes after the incident. The lessons learned here (phishing-resistant MFA, just-in-time access) will become risks, findings and projects you track for months.',
      ],
      examTip: 'Learn the incident response steps as the CISSP presents them: detection, response, mitigation, reporting, recovery, remediation, lessons learned. NIST SP 800-61 groups them as preparation; detection and analysis; containment, eradication and recovery; post-incident activity.',
    },
  },

  {
    id: 'change-review',
    week: 2,
    level: 'Medium',
    title: 'CAB this afternoon: new reviews widget on checkout',
    client: 'Northline Outfitters',
    from: { name: 'Ben Kowalski', role: 'Operations Director' },
    channel: 'Email',
    received: 'Tuesday 11:10',
    priority: 'High',
    minutes: 15,
    domain: 8,
    skills: ['Change management', 'Secure development', 'Third-party scripts'],
    message: [
      'Hi,',
      'Pixel & Pine want to add a product reviews widget to the checkout page on 25 November. The change request is attached. You are on the change advisory board now, so I want your view before 3 p.m.',
      'Ben',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Change request CR-2026-114',
        columns: ['Field', 'Value'],
        rows: [
          ['Change', 'Add StarProof reviews script to the checkout page'],
          ['Requested by', 'Pixel & Pine (agency)'],
          ['Approved by', 'Lead developer, Pixel & Pine'],
          ['Risk rating', 'Low'],
          ['Testing', 'Tested on our development store'],
          ['Rollback', 'Remove the script'],
          ['Planned date', '25 November, 09:00'],
        ],
      },
      {
        kind: 'text',
        title: 'Change Management Policy (extract)',
        body: [
          'Peak freeze: no non-emergency changes to the storefront from 20 November to 2 December.',
          'Changes must be approved by someone other than the person or team making them.',
        ],
      },
    ],
    steps: [
      {
        type: 'single',
        prompt: 'What should the CAB decide?',
        options: [
          { text: 'Approve, the rollback plan is fine', why: 'It falls inside the peak freeze and has gaps in review.' },
          { text: 'Approve it as an emergency change', why: 'A new widget is not an emergency.' },
          { text: 'Defer until after 2 December and ask for the missing information', correct: true, why: 'It breaks the freeze, and the request needs proper approval and a security review first.' },
          { text: 'Reject it permanently', why: 'Nothing says the widget is a bad idea, only that this request is not ready.' },
        ],
      },
      {
        type: 'multi',
        prompt: 'What is wrong with the change request?',
        options: [
          { text: 'The agency approved its own change', correct: true, why: 'The policy requires approval by someone outside the team doing the work.' },
          { text: 'Rated "Low" even though it adds a third-party script to checkout', correct: true, why: 'Scripts on payment pages are a known route for card skimming. PCI DSS v4 requires an inventory and integrity checks for them.' },
          { text: 'No security review of StarProof as a vendor', correct: true, why: 'A new third party that can run code on checkout needs vendor due diligence.' },
          { text: 'Tested only on the development store', correct: true, why: 'There is no test in a production-like environment, and no evidence checkout still works.' },
          { text: 'The rollback plan is too simple', why: 'Removing a script is a reasonable rollback. The bigger problems are elsewhere.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Which of these would justify an emergency change during the freeze?',
        options: [
          { text: 'A new holiday promotion banner', why: 'Planned marketing work can wait or should have been done before the freeze.' },
          { text: 'A fix for a checkout bug that is blocking payments', correct: true, why: 'Emergencies fix live problems that cause harm now. They still get recorded and reviewed afterwards.' },
          { text: 'The reviews widget, because marketing wants it before Black Friday', why: 'Business preference is not an emergency.' },
          { text: 'Updating the site\'s colours', why: 'Cosmetic change.' },
        ],
      },
    ],
    debrief: {
      work: [
        'On a change advisory board your job is to ask the questions nobody else will: who approved this, who reviewed the security of the new component, and what happens if it goes wrong at peak.',
        'Third-party scripts on payment pages deserve extra attention. They run with full access to whatever the customer types.',
      ],
      examTip: 'Change management in the CISSP follows request, review, approve, test, schedule, implement, document. Separation of duties between the person making a change and the person approving it is a classic exam point.',
    },
  },

  {
    id: 'risk-acceptance',
    week: 2,
    level: 'Medium',
    title: 'Draft the risk acceptance for PermitPro',
    client: 'Town of Riverside',
    from: { name: 'Omar Siddiqui', role: 'Chief Administrative Officer' },
    channel: 'Email',
    received: 'Wednesday 16:30',
    priority: 'Normal',
    minutes: 20,
    domain: 1,
    skills: ['Risk acceptance', 'Governance', 'Writing'],
    message: [
      'Hello,',
      'IT tells me PermitPro cannot be patched and the replacement is not budgeted until 2028. Council meets next week and I would like to go in with a signed risk acceptance.',
      'Could you draft it for me? The risk details are attached.',
      'Omar',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Risk register entry',
        columns: ['Field', 'Value'],
        rows: [
          ['Risk', 'Unsupported permitting system (PermitPro on Windows Server 2012) is exploited'],
          ['Inherent score', 'Likelihood 4 × Impact 3 = 12'],
          ['Compensating controls', 'Move the server to its own network segment (Marcus Bell, by 31 Dec); add monitoring alerts (Marcus Bell, by 31 Jan)'],
          ['Residual score', 'Likelihood 2 × Impact 3 = 6'],
          ['Risk appetite', 'Residual 9 or less'],
          ['Replacement', 'Budgeted for 2028'],
        ],
      },
    ],
    steps: [
      {
        type: 'single',
        prompt: 'Who should sign the acceptance?',
        options: [
          { text: 'Omar, as the accountable executive', correct: true, why: 'Acceptance needs someone senior enough to own the consequences, usually the business owner or an executive.' },
          { text: 'Marcus, the IT manager', why: 'Marcus delivers the controls. He should not accept risk on behalf of the town.' },
          { text: 'You, as the analyst who wrote it', why: 'Analysts recommend. They do not accept risk.' },
          { text: 'The PermitPro vendor', why: 'The vendor no longer supports the product and is not accountable for the town.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Is accepting this risk appropriate?',
        options: [
          { text: 'Yes, once the compensating controls are in place, for a fixed period', correct: true, why: 'Residual 6 is within appetite, but only after segmentation and monitoring are done. The acceptance should say so.' },
          { text: 'Yes, today, with no extra controls', why: 'Inherent 12 is above appetite. Accepting it as it stands needs a much stronger case.' },
          { text: 'No, unsupported systems can never be accepted', why: 'Organisations accept legacy systems all the time, with compensating controls and an end date.' },
          { text: 'No, it must be transferred to insurance', why: 'Insurance does not stop the system being exploited.' },
        ],
      },
      {
        type: 'multi',
        prompt: 'What must the acceptance document include?',
        options: [
          { text: 'The risk and the asset it affects', correct: true, why: 'Anyone reading it later needs to know exactly what was accepted.' },
          { text: 'Inherent and residual scores, against appetite', correct: true, why: 'Shows the decision was informed.' },
          { text: 'Compensating controls, each with an owner and date', correct: true, why: 'The acceptance depends on them, so they must be tracked.' },
          { text: 'An expiry or review date', correct: true, why: 'Acceptance is never permanent.' },
          { text: 'The signature of the accountable owner', correct: true, why: 'Accountability needs a name and a date.' },
          { text: 'A statement that the risk is now eliminated', why: 'Accepted risk still exists. Saying otherwise is misleading.' },
        ],
      },
      {
        type: 'write',
        prompt: 'Draft the acceptance in a few short paragraphs for Omar to sign.',
        model: [
          'Risk acceptance: unsupported permitting system (PermitPro)',
          'PermitPro runs on Windows Server 2012, which no longer receives security updates. An attacker could exploit known flaws to reach permit data and use the server to move further into the town network. Inherent risk is 12 (likelihood 4, impact 3), above the town\'s appetite of 9.',
          'Until PermitPro is replaced in 2028, the town will rely on two compensating controls: moving the server into its own network segment (Marcus Bell, by 31 December) and adding monitoring alerts (Marcus Bell, by 31 January). With both in place, residual risk is 6, within appetite.',
          'I accept this residual risk on condition that both controls are completed by those dates. This acceptance expires in 12 months, or sooner if the controls slip or the threat changes, and will then be reviewed.',
          'Signed: Omar Siddiqui, Chief Administrative Officer. Date: ____',
        ],
        rubric: [
          'Describes the risk and the affected system',
          'States inherent and residual scores against appetite',
          'Lists compensating controls with owners and dates',
          'Makes acceptance conditional on those controls',
          'Includes an expiry or review date',
          'Has a signature line for the accountable owner',
        ],
      },
    ],
    debrief: {
      work: [
        'Drafting acceptances for executives is common. Keep them short and specific, and always tie the acceptance to conditions and a date. "Accepted forever" risks are how organisations end up running 15-year-old systems.',
        'Add the acceptance to the risk register and set a reminder before it expires.',
      ],
      examTip: 'Risk acceptance is a valid treatment when residual risk is within appetite or the cost of treatment outweighs the benefit. Senior management owns the decision. Ignoring a risk (risk rejection) is never acceptable.',
    },
  },

  {
    id: 'privacy-misdirected',
    week: 2,
    level: 'Easy',
    title: 'I sent lab results to the wrong patient',
    client: 'Harbourview Family Clinic',
    from: { name: 'Julie Tran', role: 'Front Desk Lead' },
    channel: 'Teams message',
    received: 'Thursday 15:52',
    priority: 'Urgent',
    minutes: 15,
    domain: 1,
    skills: ['Privacy breach response', 'PHIPA'],
    message: [
      'Help. 20 minutes ago I emailed a patient\'s blood test results to the wrong person. Another patient with the same last name. I\'ve emailed them asking them to delete it. Nadia is out today. What do I do??',
    ],
    attachments: [
      {
        kind: 'text',
        title: 'Clinic privacy breach procedure (summary)',
        body: [
          'Contain the breach, record the facts, tell the privacy lead (Nadia Rahman), assess the risk, notify the affected individual, report as required, and fix the cause.',
          'PHIPA: if personal health information is stolen, lost, or used or disclosed without authority, the custodian must notify the individual at the first reasonable opportunity. Some breaches must also be reported to the Information and Privacy Commissioner of Ontario, and all are counted in the annual statistics report.',
        ],
      },
    ],
    steps: [
      {
        type: 'order',
        prompt: 'Put Julie\'s next steps in order.',
        items: [
          { text: 'Ask the recipient to delete the email and confirm in writing that they have', why: 'Containment first, while the email is fresh.' },
          { text: 'Write down the facts: what was sent, to whom, when and how', why: 'Facts fade fast and the privacy lead will need them.' },
          { text: 'Tell Nadia, even though she is out', why: 'The privacy lead must know the same day.' },
          { text: 'Nadia assesses the breach and the risk to the patient', why: 'Assessment decides what notifications are needed.' },
          { text: 'Notify the patient whose results were sent', why: 'Required under PHIPA at the first reasonable opportunity.' },
          { text: 'Record it for the annual report, and report to the IPC if required', why: 'Reporting follows the assessment.' },
          { text: 'Change the process so it does not happen again', why: 'Prevention closes the loop.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Must the patient whose results were sent be told?',
        options: [
          { text: 'Yes, at the first reasonable opportunity', correct: true, why: 'Their health information was disclosed without authority. PHIPA requires notification.' },
          { text: 'Only if the recipient refuses to delete it', why: 'The disclosure has already happened, whatever the recipient does next.' },
          { text: 'No, the recipient deleted it', why: 'Deletion limits the harm but does not undo the breach.' },
          { text: 'Only if the patient asks', why: 'The duty is on the clinic.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Which security property failed?',
        options: [
          { text: 'Confidentiality', correct: true, why: 'Information reached someone who should not see it.' },
          { text: 'Integrity', why: 'The results were not altered.' },
          { text: 'Availability', why: 'The results are still available to the clinic.' },
          { text: 'Non-repudiation', why: 'Nobody is denying sending the email.' },
        ],
      },
      {
        type: 'multi',
        prompt: 'Which changes would prevent this?',
        options: [
          { text: 'Check two identifiers, such as name and date of birth, before sending results', correct: true, why: 'Shared surnames are exactly the case this catches.' },
          { text: 'Send results through the patient portal instead of email', correct: true, why: 'Patients log in to see their own results, so there is no address to mistype.' },
          { text: 'An email warning when health data is sent outside the clinic', correct: true, why: 'Data loss prevention prompts make people pause before sending.' },
          { text: 'Discipline Julie', why: 'She made an honest mistake and reported it within 20 minutes. Punishing that teaches staff to hide errors.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Most privacy breaches are mistakes like this one, not hackers. A calm, quick checklist matters more than anything else in the first hour.',
        'Praise fast reporting. It is the behaviour that makes containment possible.',
      ],
      examTip: 'The CISSP expects you to know that privacy laws differ by jurisdiction and sector (PIPEDA, PHIPA, GDPR, HIPAA) and that breach notification duties sit with the organisation that controls the data, even when a processor causes the breach.',
    },
  },

  {
    id: 'firewall-review',
    week: 2,
    level: 'Medium',
    title: 'Firewall rule review before the insurance renewal',
    client: 'Town of Riverside',
    from: { name: 'Marcus Bell', role: 'IT Manager' },
    channel: 'Email',
    received: 'Friday 10:15',
    priority: 'High',
    minutes: 20,
    domain: 4,
    skills: ['Network security', 'Firewall rules', 'Segmentation'],
    message: [
      'Hi,',
      'Our cyber insurer wants evidence that we review firewall rules. Here is the current rule set from the main firewall. Some of these are older than my time here.',
      'Which ones need to go or be tightened?',
      'Marcus',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Main firewall rules (top to bottom)',
        columns: ['#', 'From', 'To', 'Service', 'Action', 'Comment'],
        rows: [
          ['1', 'Library Wi-Fi', 'Internet', 'Web (80, 443)', 'Allow', 'Public internet access'],
          ['2', 'Library Wi-Fi', 'Staff network', 'Any', 'Allow', '"Temporary", 2023'],
          ['3', 'Internet', 'PermitPro server', 'RDP (3389)', 'Allow', 'Vendor support'],
          ['4', 'Staff network', 'Water SCADA network', 'Any', 'Allow', 'Engineers'],
          ['5', 'AquaControl VPN', 'SCADA operator screen', 'RDP (3389)', 'Allow', 'Always on'],
          ['6', 'Internet', 'Town website', 'HTTPS (443)', 'Allow', 'Public website'],
          ['7', 'Any', 'Any', 'Any', 'Deny', 'Default'],
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'Which rules should be removed or tightened?',
        options: [
          { text: 'Rule 2: public Wi-Fi to the staff network', correct: true, why: 'Anyone in the library can reach staff PCs. Left over from 2023 and should be removed.' },
          { text: 'Rule 3: RDP from the whole internet to PermitPro', correct: true, why: 'Remote desktop open to the internet on an unpatched server is one of the most exploited set-ups there is.' },
          { text: 'Rule 4: any traffic from staff network to SCADA', correct: true, why: 'Too broad. Only named engineers\' devices should reach specific SCADA services, ideally through a jump host.' },
          { text: 'Rule 5: always-on vendor RDP to SCADA', correct: true, why: 'Vendor access should be switched on when needed, with MFA and session recording.' },
          { text: 'Rule 1: Wi-Fi to the internet', why: 'That is what public Wi-Fi is for.' },
          { text: 'Rule 6: HTTPS to the website', why: 'A public website needs this.' },
          { text: 'Rule 7: deny everything else', why: 'This is the rule you want at the bottom.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Rule 7 follows which principle?',
        options: [
          { text: 'Implicit (default) deny', correct: true, why: 'Anything not explicitly allowed is blocked.' },
          { text: 'Defence in depth', why: 'Defence in depth is about layering controls.' },
          { text: 'Fail open', why: 'Fail open would allow traffic when something breaks, the opposite of this rule.' },
          { text: 'Least privilege', why: 'Related, but the firewall term is default deny.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Where should the vendor\'s remote access land instead?',
        options: [
          { text: 'Directly on the SCADA operator screen, as now', why: 'That is the problem: a direct path to the plant controls.' },
          { text: 'On a jump host in a separate zone, with MFA and recorded sessions', correct: true, why: 'One controlled entry point that you can switch off, monitor and audit.' },
          { text: 'On any staff PC', why: 'That would mix vendor access with the staff network.' },
          { text: 'On the town website server', why: 'A public-facing server is the wrong place for privileged access.' },
        ],
      },
      {
        type: 'single',
        prompt: 'The website sits in a separate zone between the internet and the internal network. What is that zone called?',
        options: [
          { text: 'A DMZ (screened subnet)', correct: true, why: 'Public-facing systems go there so a compromise does not land inside the network.' },
          { text: 'A VLAN trunk', why: 'A trunk carries several VLANs over one link.' },
          { text: 'An air gap', why: 'An air gap has no network connection at all.' },
          { text: 'A honeypot', why: 'A honeypot is a decoy to attract attackers.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Rule reviews always find "temporary" rules from years ago. Ask who owns each rule and why it exists; rules nobody can explain should be removed.',
        'For operational technology like SCADA, any path from IT or vendors should be narrow, monitored and switchable.',
      ],
      examTip: 'Domain 4 expects you to know firewall types, the DMZ (screened subnet), implicit deny and segmentation. Rules are processed top to bottom, so the default deny belongs at the end.',
    },
  },
];
