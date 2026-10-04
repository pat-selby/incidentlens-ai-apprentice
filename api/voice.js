import { cases, makeCoachQuestion } from '../engine.js';

// Vercel Function. The key is read only on the server and never sent to the browser.
const recent = new Map();
const MAX_PER_MINUTE = 8;

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'POST required' });
  if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_VOICE_ID) return response.status(503).json({ error: 'Voice is not configured' });
  const input = request.body || {};
  const item = cases.find(value => value.id === input.caseId);
  if (!item || !['question', 'feedback'].includes(input.kind) || !item.choices.includes(input.choice)) return response.status(400).json({ error: 'Invalid case or request' });
  const ip = String(request.headers['x-forwarded-for'] || request.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const history = (recent.get(ip) || []).filter(at => now - at < 60000);
  if (history.length >= MAX_PER_MINUTE) return response.status(429).json({ error: 'Voice rate limit reached' });
  history.push(now); recent.set(ip, history);
  if (recent.size > 1000) for (const [key, times] of recent) if (times.every(at => now - at >= 60000)) recent.delete(key);

  let script;
  if (input.kind === 'question') {
    const inspected = Array.isArray(input.inspected) ? input.inspected.filter(key => item.evidence.some(signal => signal.key === key)).slice(0, item.evidence.length) : [];
    script = makeCoachQuestion(item, input.choice, inspected);
  } else {
    const score = Number(input.score);
    if (!Number.isInteger(score) || score < 0 || score > 3) return response.status(400).json({ error: 'Invalid score' });
    script = `Your response scored ${score} out of 3 on this practice case. The reference action is ${item.recommended}. ${item.guardrail}`;
  }

  try {
    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(process.env.ELEVENLABS_VOICE_ID)}/stream`, {
      method: 'POST',
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text: script, model_id: 'eleven_multilingual_v2' }),
      signal: AbortSignal.timeout(12000)
    });
    if (!upstream.ok) return response.status(502).json({ error: 'Voice provider rejected the request' });
    const bytes = Buffer.from(await upstream.arrayBuffer());
    if (!bytes.length || bytes.length > 2000000) return response.status(502).json({ error: 'Voice provider returned invalid audio' });
    response.setHeader('Content-Type', 'audio/mpeg');
    return response.status(200).send(bytes);
  } catch {
    return response.status(502).json({ error: 'Voice provider unavailable' });
  }
}
