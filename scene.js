// Case-specific, authored explanation of the demo's decision path.
// This is a visualization of rules and recorded human judgment, not an ML model.
export function sceneSteps(caseData, map, learnerResult, live = {}) {
  const critical = caseData.evidence.find(item => item.key === caseData.criticalEvidenceKey);
  const opened = caseData.evidence.filter(item => live.inspected?.includes(item.key));
  const inspected = opened.length ? opened.map(item => item.label).join(', ') : map?.inspectedEvidence?.map(item => item.label).join(', ');
  const evidenceCount = opened.length || map?.inspectedEvidence?.length || 0;
  const liveDecision = live.selected || null;
  return [
    { label: 'EVENT', title: 'Something happened', detail: caseData.setup, signal: caseData.time },
    { label: 'ALERT', title: 'A rule raised a flag', detail: caseData.summary + ' The flag starts an investigation; it does not prove the outcome.', signal: caseData.severity + ' priority' },
    { label: 'EVIDENCE', title: 'Check the context', detail: inspected ? `You opened ${inspected}. ${critical?.detail || ''}` : `Open the evidence cards to inspect the signals. ${critical?.detail || ''}`, signal: evidenceCount ? `${evidenceCount} signals inspected` : 'Waiting for inspection' },
    { label: 'DECISION', title: 'Make a defensible call', detail: liveDecision ? `You chose: ${liveDecision}. Explain why, what could change your mind, and what you would verify before acting.` : map ? `Expert chose: ${map.decision}. Why: ${map.expertReasoning}` : `The authored reference action is: ${caseData.recommended}. A real expert should explain their own decision before it becomes a Work Map.`, signal: liveDecision ? 'Decision being explained' : map ? 'Expert recorded' : 'Reference path' },
    { label: 'GUARDRAIL', title: 'Know when to change course', detail: map ? `Exception: ${map.expertException} Safety check: ${map.expertGuardrail}` : caseData.guardrail, signal: map ? 'Expert exception saved' : 'Reference guardrail' },
    { label: 'PRACTICE', title: 'Teach the next analyst', detail: learnerResult ? `The learner received ${learnerResult.score}/3 on action, evidence, and safety check. This is a rule-based practice score, not an ML prediction.` : 'The learner chooses an action and explains the evidence. The rule-based coach checks action, evidence terms, and safety terms, one point each.', signal: learnerResult ? `${learnerResult.score}/3 practice score` : 'Awaiting learner' }
  ];
}
