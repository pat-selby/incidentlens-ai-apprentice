import test from 'node:test';
import assert from 'node:assert/strict';
import { cases, createMap, makeCoachQuestion, reviewAnswer, termHits } from '../engine.js';

const details = { exception: 'Escalate if the VPN entry is stale or the device differs.', guardrail: 'Confirm the IP and device with the current registry before closing.', trace: [{ action: 'inspected', evidenceKey: 'vpn' }] };

test('captures only inspected evidence and expert reasoning', () => {
  const item = cases[0];
  const map = createMap(item, item.recommended, 'The registered VPN explains the location, but I would verify the active session first.', ['vpn', 'device'], details);
  assert.equal(map.inspectedEvidence.length, 2);
  assert.equal(map.expertReasoning.includes('registered VPN'), true);
  assert.equal(map.origin, 'synthetic-demo');
  assert.equal(map.expertException, details.exception);
  assert.equal(map.workTrace.length, 1);
});
test('rejects unsupported decisions and empty reasoning', () => {
  const item = cases[0];
  assert.throws(() => createMap(item, 'Ban all users', 'A very long explanation that is still invalid.', []));
  assert.throws(() => createMap(item, item.recommended, 'Looks fine', []));
});
test('feedback separately checks action, evidence, and guardrail', () => {
  const item = cases[1];
  const full = reviewAnswer(item, null, item.recommended, 'The sender domain and payment link differ. Call the known vendor to verify before changing payment details.');
  assert.equal(full.score, 3);
  const weak = reviewAnswer(item, null, 'Approve payment', 'It seems fine to me.');
  assert.equal(weak.score, 0);
});
test('term matching handles case and punctuation', () => {
  assert.deepEqual(termHits('Verify the VPN-IP.', ['vpn', 'verify']), ['vpn', 'verify']);
});

test('coach asks about missing critical evidence before accepting a decision', () => {
  const item = cases[0];
  assert.match(makeCoachQuestion(item, item.recommended, ['device']), /VPN registry/);
  assert.equal(makeCoachQuestion(item, item.recommended, ['vpn']), item.question);
});
