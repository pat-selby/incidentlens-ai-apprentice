import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/voice.js';

function invoke(body) {
  const request = { method: 'POST', body, headers: { 'x-forwarded-for': '192.0.2.1' } };
  const response = { statusCode: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; }, send(value) { this.body = value; return this; } };
  return handler(request, response).then(() => response);
}

test('voice endpoint rejects unconfigured requests without exposing secrets', async () => {
  const originalKey = process.env.ELEVENLABS_API_KEY;
  const originalVoice = process.env.ELEVENLABS_VOICE_ID;
  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.ELEVENLABS_VOICE_ID;
  try {
    const response = await invoke({ kind: 'question', caseId: 'impossible-travel', choice: 'Close as benign' });
    assert.equal(response.statusCode, 503);
    assert.equal(response.body.error, 'Voice is not configured');
  } finally {
    if (originalKey) process.env.ELEVENLABS_API_KEY = originalKey;
    if (originalVoice) process.env.ELEVENLABS_VOICE_ID = originalVoice;
  }
});

test('voice endpoint sends only authored case text to ElevenLabs', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.ELEVENLABS_API_KEY;
  const originalVoice = process.env.ELEVENLABS_VOICE_ID;
  process.env.ELEVENLABS_API_KEY = 'test-only-key';
  process.env.ELEVENLABS_VOICE_ID = 'test-voice';
  let sent;
  globalThis.fetch = async (_url, options) => {
    sent = { headers: options.headers, body: JSON.parse(options.body) };
    return { ok: true, arrayBuffer: async () => Uint8Array.from([1, 2, 3]).buffer };
  };
  try {
    const response = await invoke({ kind: 'question', caseId: 'impossible-travel', choice: 'Close as benign', inspected: [], privateNote: 'Never send this to ElevenLabs' });
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['Content-Type'], 'audio/mpeg');
    assert.equal(sent.headers['xi-api-key'], 'test-only-key');
    assert.doesNotMatch(sent.body.text, /Never send/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey) process.env.ELEVENLABS_API_KEY = originalKey; else delete process.env.ELEVENLABS_API_KEY;
    if (originalVoice) process.env.ELEVENLABS_VOICE_ID = originalVoice; else delete process.env.ELEVENLABS_VOICE_ID;
  }
});
