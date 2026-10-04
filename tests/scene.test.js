import test from 'node:test';
import assert from 'node:assert/strict';
import { cases, createMap, reviewAnswer } from '../engine.js';
import { sceneSteps } from '../scene.js';

test('event view follows the selected case and captured expert decision', () => {
  const item = cases[0];
  const before = sceneSteps(item, null, null);
  assert.equal(before.length, 6);
  assert.match(before[2].detail, /VPN/);
  assert.match(before[3].detail, /reference action/);
  const during = sceneSteps(item, null, null, { inspected: ['vpn'], selected: item.recommended });
  assert.match(during[2].detail, /You opened VPN registry/);
  assert.match(during[2].signal, /1 signals inspected/);
  assert.match(during[3].detail, /You chose/);
  const map = createMap(item, item.recommended, 'The VPN matches, but I would confirm the device and session before closing.', ['vpn', 'device'], { exception: 'Escalate if the device is different or the VPN record is stale.', guardrail: 'Verify the session and VPN registry before closure.', trace: [] });
  const result = reviewAnswer(item, map, item.recommended, 'Verify the VPN and session before closing the alert.');
  const after = sceneSteps(item, map, result);
  assert.match(after[3].detail, /The VPN matches/);
  assert.match(after[4].detail, /device is different/);
  assert.match(after[5].detail, /rule-based practice score/);
});
