export const cases = [
  {
    id: 'impossible-travel', category: 'Identity', severity: 'High', time: '09:42 UTC',
    title: 'Impossible travel, or a known VPN?',
    summary: 'A finance employee signed in from an unfamiliar location eight minutes after a normal office login.',
    setup: 'A finance user has two sign-ins eight minutes apart, one from the office and one from a distant city. An automated rule marks the second sign-in as impossible travel.',
    evidence: [
      { label: 'Sign-in timeline', value: 'Office login at 09:34 UTC. Distant-city login at 09:42 UTC.', detail: 'The time gap is too short for physical travel, but location data can reflect a VPN exit node.', key: 'timeline' },
      { label: 'Device fingerprint', value: 'Same managed laptop and browser session on both logins.', detail: 'Continuity reduces confidence that a second person gained access, but does not prove the session is safe.', key: 'device' },
      { label: 'VPN registry', value: 'Second IP matches a corporate VPN exit node.', detail: 'An approved VPN can explain the location anomaly. Confirm the registry entry is current.', key: 'vpn' },
      { label: 'MFA event', value: 'No new challenge. Existing session token was reused.', detail: 'A reused token is consistent with a continuing session, but stolen sessions are possible.', key: 'mfa' }
    ],
    choices: ['Escalate immediately', 'Close as benign', 'Verify VPN and session, then close or escalate'],
    recommended: 'Verify VPN and session, then close or escalate',
    question: 'The location looks impossible, but the device and VPN signals agree. Why verify before closing this alert?',
    evidenceTerms: ['vpn', 'device', 'session', 'ip', 'location'],
    guardrailTerms: ['verify', 'confirm', 'check', 'validate', 'escalate', 'revoke'],
    guardrail: 'Verify that the VPN IP is approved and the session belongs to the user; escalate if either check fails.', criticalEvidenceKey: 'vpn'
  },
  {
    id: 'invoice-phish', category: 'Email', severity: 'Critical', time: '11:17 UTC',
    title: 'A familiar sender, a new payment link',
    summary: 'An accounts payable inbox received an urgent invoice from a display name it recognizes.',
    setup: 'Accounts payable receives an invoice with a familiar display name and a request to update payment details through a new link.',
    evidence: [
      { label: 'Sender identity', value: 'Display name matches a vendor; domain has one extra letter.', detail: 'Display names can be spoofed. Compare the actual address with a trusted vendor record.', key: 'domain' },
      { label: 'Destination URL', value: 'Payment button goes to a newly registered lookalike domain.', detail: 'A new, mismatched domain is a stronger signal than the familiar logo or signature.', key: 'url' },
      { label: 'Message tone', value: 'Requests payment today and discourages a phone call.', detail: 'Urgency alone is weak evidence; it matters more alongside the domain mismatch.', key: 'urgency' },
      { label: 'Vendor record', value: 'No verified payment-change request exists in the vendor system.', detail: 'An out-of-band call to the known vendor contact can confirm or reject the change.', key: 'vendor' }
    ],
    choices: ['Approve payment', 'Quarantine and verify out of band', 'Ignore the email'],
    recommended: 'Quarantine and verify out of band',
    question: 'Why is the familiar display name not enough, and what must happen before any payment detail changes?',
    evidenceTerms: ['domain', 'link', 'url', 'sender', 'vendor'],
    guardrailTerms: ['call', 'phone', 'verify', 'confirm', 'quarantine', 'out of band'],
    guardrail: 'Do not change payment details until the vendor confirms the request through a known channel.', criticalEvidenceKey: 'domain'
  },
  {
    id: 'maintenance-scan', category: 'Network', severity: 'Medium', time: '02:08 UTC',
    title: 'A port scan during the maintenance window',
    summary: 'A scanner touched dozens of internal hosts overnight, during a scheduled vulnerability assessment.',
    setup: 'Network monitoring reports a host scanning many internal addresses at 02:08 UTC. A vulnerability assessment is scheduled overnight.',
    evidence: [
      { label: 'Source asset', value: 'Traffic originates from the registered scanning host.', detail: 'The asset inventory identifies the source, but source identity alone is not enough.', key: 'source' },
      { label: 'Change ticket', value: 'Approved change covers 02:00 to 04:00 UTC and the target subnet.', detail: 'Compare source, time, and destination scope with the approved ticket.', key: 'ticket' },
      { label: 'Scan scope', value: 'All observed targets fall within the approved subnet.', detail: 'A scan outside scope could indicate misuse or compromise.', key: 'scope' },
      { label: 'Host behavior', value: 'No follow-on exploitation or unusual authentication.', detail: 'Continued monitoring can catch a change in behavior after the initial scan.', key: 'behavior' }
    ],
    choices: ['Block the scanner immediately', 'Close without checking', 'Validate change scope and monitor'],
    recommended: 'Validate change scope and monitor',
    question: 'What makes this scan plausibly authorized, and which mismatch would make you escalate?',
    evidenceTerms: ['ticket', 'scope', 'subnet', 'source', 'time'],
    guardrailTerms: ['verify', 'validate', 'check', 'monitor', 'escalate', 'mismatch'],
    guardrail: 'Confirm the host, timing, and target subnet match the change ticket; escalate any deviation.', criticalEvidenceKey: 'ticket'
  }
];

export function normalize(text) { return String(text || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
export function termHits(text, terms) { const body = normalize(text); return terms.filter(term => body.includes(normalize(term))); }
export function makeCoachQuestion(caseData, choice, inspected = []) {
  if (!caseData?.choices.includes(choice)) throw new Error('Choose a valid decision.');
  const critical = caseData.evidence.find(item => item.key === caseData.criticalEvidenceKey);
  if (critical && !inspected.includes(critical.key)) return `Before choosing "${choice}", what would you need to check in ${critical.label}, and why?`;
  if (choice !== caseData.recommended) return `You chose "${choice}". Which evidence supports that call, and what would make you change course?`;
  return caseData.question;
}
export function createMap(caseData, choice, reasoning, inspected, details = {}) {
  if (!caseData || !caseData.choices.includes(choice)) throw new Error('Choose a valid decision.');
  if (normalize(reasoning).length < 24) throw new Error('Add at least one sentence explaining your decision.');
  if (normalize(details.exception).length < 12) throw new Error('Describe an exception or signal that could change this decision.');
  if (normalize(details.guardrail).length < 12) throw new Error('Describe a safety check before acting.');
  const inspectedEvidence = caseData.evidence.filter(item => inspected.includes(item.key)).map(({ label, value, key }) => ({ label, value, key }));
  return { id: caseData.id, title: caseData.title, category: caseData.category, decision: choice, expertReasoning: reasoning.trim(), expertException: details.exception.trim(), expertGuardrail: details.guardrail.trim(), inspectedEvidence, workTrace: Array.isArray(details.trace) ? details.trace.slice() : [], coachQuestion: makeCoachQuestion(caseData, choice, inspected), recommended: caseData.recommended, referenceGuardrail: caseData.guardrail, capturedAt: new Date().toISOString(), origin: 'synthetic-demo' };
}
export function reviewAnswer(caseData, map, choice, reasoning) {
  const evidence = termHits(reasoning, caseData.evidenceTerms);
  const guardrails = termHits(reasoning, caseData.guardrailTerms);
  const correctChoice = choice === caseData.recommended;
  const score = Number(correctChoice) + Number(evidence.length > 0) + Number(guardrails.length > 0);
  return {
    score, correctChoice, evidence, guardrails,
    feedback: [
      correctChoice ? 'Your action matches the reference path.' : `The reference path for this case is: ${caseData.recommended}.`,
      evidence.length ? `You named relevant evidence: ${evidence.join(', ')}.` : 'Name at least one signal that supports your decision.',
      guardrails.length ? 'You included a verification or escalation step.' : `Add a safety check: ${caseData.guardrail}`
    ],
    expertNote: map?.expertReasoning || null,
    expertException: map?.expertException || null,
    expertGuardrail: map?.expertGuardrail || null,
    guardrail: caseData.guardrail
  };
}
