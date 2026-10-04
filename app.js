import { cases, createMap, makeCoachQuestion, reviewAnswer } from './engine.js';

const key = 'incidentlens-workmaps-v1';
const $ = id => document.getElementById(id);
let active = cases[0];
let inspected = new Set();
let selected = '';
let maps = readMaps();
let speechRecognition = null;
let workTrace = [];
let currentAudio = null;

function readMaps() {
  try { const data = JSON.parse(localStorage.getItem(key) || '{}'); return data && typeof data === 'object' && !Array.isArray(data) ? data : {}; }
  catch { return {}; }
}
function saveMaps() { localStorage.setItem(key, JSON.stringify(maps)); }
function el(tag, className, text) { const item = document.createElement(tag); if (className) item.className = className; if (text !== undefined) item.textContent = text; return item; }
function clear(node) { node.replaceChildren(); }

function setMode(mode) {
  for (const name of ['expert', 'learner', 'map']) {
    const activeTab = name === mode;
    $(name + 'Tab').classList.toggle('active', activeTab);
    $(name + 'Tab').setAttribute('aria-selected', String(activeTab));
    $(name + 'Panel').classList.toggle('hidden', !activeTab);
  }
  if (mode === 'map') renderMaps();
  if (mode === 'learner') renderLearner();
  $('workbenchTitle').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCase() {
  inspected = new Set(); selected = ''; workTrace = [];
  $('caseBanner').replaceChildren();
  const bannerTop = el('div', 'banner-top');
  bannerTop.append(el('span', 'severity severity-' + active.severity.toLowerCase(), active.severity + ' priority'), el('span', 'banner-category', active.category + ' · ' + active.time));
  $('caseBanner').append(bannerTop, el('h3', '', active.title), el('p', '', active.summary));
  $('caseCount').textContent = `${cases.indexOf(active) + 1} of ${cases.length}`;
  clear($('evidenceList'));
  for (const item of active.evidence) {
    const button = el('button', 'evidence-item'); button.type = 'button'; button.setAttribute('aria-expanded', 'false');
    const heading = el('span', 'evidence-item-heading'); heading.append(el('strong', '', item.label), el('span', 'evidence-caret', '+'));
    button.append(heading, el('span', 'evidence-value', item.value), el('span', 'evidence-detail', item.detail));
    button.addEventListener('click', () => { const open = button.classList.toggle('open'); button.setAttribute('aria-expanded', String(open)); button.querySelector('.evidence-caret').textContent = open ? '−' : '+'; if (open) { inspected.add(item.key); workTrace.push({ action: 'inspected', evidenceKey: item.key, at: new Date().toISOString() }); } $('inspectCount').textContent = `${inspected.size} of ${active.evidence.length} signals inspected`; if (selected) $('coachQuestion').textContent = makeCoachQuestion(active, selected, [...inspected]); });
    $('evidenceList').append(button);
  }
  $('inspectCount').textContent = '0 signals inspected';
  clear($('decisionOptions'));
  for (const choice of active.choices) {
    const button = el('button', 'decision-option', choice); button.type = 'button';
    button.addEventListener('click', () => { selected = choice; workTrace.push({ action: 'decided', choice, at: new Date().toISOString() }); for (const other of $('decisionOptions').children) other.classList.toggle('chosen', other === button); $('promptBox').classList.remove('hidden'); $('coachQuestion').textContent = makeCoachQuestion(active, choice, [...inspected]); $('expertError').textContent = ''; });
    $('decisionOptions').append(button);
  }
  $('expertWhy').value = maps[active.id]?.expertReasoning || '';
  $('expertException').value = maps[active.id]?.expertException || '';
  $('expertGuardrail').value = maps[active.id]?.expertGuardrail || '';
  $('promptBox').classList.add('hidden');
  $('expertError').textContent = '';
  clear($('feedback'));
  $('feedback').classList.add('hidden'); $('feedbackEmpty').classList.remove('hidden');
  $('speakFeedback').classList.add('hidden');
  renderLearner();
}

function renderLearner() {
  $('learnerSetup').textContent = active.setup;
  clear($('learnerEvidence'));
  for (const item of active.evidence) {
    const row = el('div', 'learner-signal'); row.append(el('strong', '', item.label), el('span', '', item.value)); $('learnerEvidence').append(row);
  }
  clear($('learnerChoice'));
  $('learnerChoice').append(new Option('Choose an action', ''));
  for (const choice of active.choices) $('learnerChoice').append(new Option(choice, choice));
  $('learnerWhy').value = '';
}

function renderMaps() {
  clear($('mapContent'));
  const entries = cases.filter(item => maps[item.id]).map(item => maps[item.id]);
  if (!entries.length) {
    const empty = el('div', 'map-empty'); empty.append(el('div', 'empty-symbol', '⌘'), el('h3', '', 'No Work Map yet'), el('p', '', 'Complete an expert walkthrough to capture the first decision.')); $('mapContent').append(empty); return;
  }
  for (const map of entries) {
    const article = el('article', 'map-card'); const top = el('div', 'map-card-top'); top.append(el('span', 'step', map.category.toUpperCase() + ' / CAPTURED DECISION'), el('span', 'map-date', new Date(map.capturedAt).toLocaleDateString()));
    article.append(top, el('h3', '', map.title));
    const grid = el('div', 'map-detail-grid');
    for (const [label, value] of [['Action', map.decision], ['Expert reasoning', map.expertReasoning], ['Exception', map.expertException], ['Expert guardrail', map.expertGuardrail]]) { const block = el('div', 'map-detail'); block.append(el('span', '', label), el('p', '', value || 'Not captured in this earlier map')); grid.append(block); }
    article.append(grid);
    const inspectedText = map.inspectedEvidence?.length ? map.inspectedEvidence.map(item => item.label).join(' · ') : 'No evidence cards opened';
    article.append(el('p', 'map-evidence', 'Signals inspected: ' + inspectedText)); $('mapContent').append(article);
    const trace = (map.workTrace || []).map(step => step.action === 'inspected' ? `Opened ${map.inspectedEvidence?.find(item => item.key === step.evidenceKey)?.label || 'signal'}` : `Chose ${step.choice}`).join(' → ');
    if (trace) article.append(el('p', 'map-evidence', 'Workflow: ' + trace));
  }
}

function saveMap() {
  try {
    const map = createMap(active, selected, $('expertWhy').value, [...inspected], { exception: $('expertException').value, guardrail: $('expertGuardrail').value, trace: workTrace });
    if (!inspected.size) throw new Error('Inspect at least one signal before saving.');
    maps[active.id] = map; saveMaps(); $('expertError').textContent = ''; setMode('map');
  } catch (error) { $('expertError').textContent = error.message; }
}

function submitAnswer() {
  const choice = $('learnerChoice').value;
  const why = $('learnerWhy').value.trim();
  if (!choice || why.length < 15) { $('feedbackEmpty').querySelector('p').textContent = 'Choose an action and write at least one sentence explaining your reasoning.'; return; }
  const result = reviewAnswer(active, maps[active.id], choice, why);
  const box = $('feedback'); clear(box); $('feedbackEmpty').classList.add('hidden'); box.classList.remove('hidden');
  const score = el('div', 'score'); score.append(el('strong', '', `${result.score}/3`), el('span', '', result.score === 3 ? 'A sound, supported decision' : 'A decision to improve')); box.append(score);
  const list = el('ul', 'feedback-list'); for (const line of result.feedback) list.append(el('li', '', line)); box.append(list);
  const guard = el('div', 'feedback-guardrail'); guard.append(el('span', 'step', 'THE GUARDRAIL'), el('p', '', result.guardrail)); box.append(guard);
  if (result.expertNote) { const expert = el('div', 'expert-note'); expert.append(el('span', 'step', 'EXPERT NOTE'), el('p', '', result.expertNote)); box.append(expert); }
  else box.append(el('p', 'muted', 'No expert walkthrough has been saved for this case yet. The feedback above uses the built-in reference path.'));
  if (result.expertException) { const exception = el('div', 'expert-note'); exception.append(el('span', 'step', 'WHEN THE CALL CHANGES'), el('p', '', result.expertException)); box.append(exception); }
  if (result.expertGuardrail) { const guardrail = el('div', 'expert-note'); guardrail.append(el('span', 'step', 'EXPERT SAFETY CHECK'), el('p', '', result.expertGuardrail)); box.append(guardrail); }
  $('speakFeedback').classList.remove('hidden');
}

function browserSpeak(text) {
  if (!('speechSynthesis' in window)) { $('voiceStatus').textContent = 'Speech playback is unavailable in this browser.'; return; }
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text); speech.lang = 'en-US'; speech.rate = 0.96;
  window.speechSynthesis.speak(speech);
}

async function speak(kind) {
  const fallbackText = kind === 'question' ? $('coachQuestion').textContent : $('feedback').innerText;
  try {
    $('voiceStatus').textContent = 'Preparing voice…';
    const response = await fetch('api/voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, caseId: active.id, choice: kind === 'question' ? selected : $('learnerChoice').value, inspected: [...inspected], score: kind === 'feedback' ? Number($('feedback').querySelector('.score strong')?.textContent?.split('/')[0]) : undefined }) });
    if (!response.ok || !response.headers.get('content-type')?.includes('audio/')) throw new Error('Voice service unavailable');
    const url = URL.createObjectURL(await response.blob());
    if (currentAudio) { currentAudio.pause(); URL.revokeObjectURL(currentAudio.src); }
    currentAudio = new Audio(url);
    currentAudio.onended = () => { URL.revokeObjectURL(url); currentAudio = null; $('voiceStatus').textContent = 'ElevenLabs voice played.'; };
    await currentAudio.play();
    $('voiceStatus').textContent = 'Playing ElevenLabs voice.';
  } catch {
    $('voiceStatus').textContent = 'ElevenLabs is unavailable. Using browser voice.';
    browserSpeak(fallbackText);
  }
}

function dictate(targetId) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) { $('voiceStatus').textContent = 'Dictation is unavailable in this browser. You can type instead.'; return; }
  if (speechRecognition) { speechRecognition.stop(); speechRecognition = null; return; }
  const speech = new Recognition(); speech.lang = 'en-US'; speech.interimResults = false;
  speech.onresult = event => { const text = event.results[0][0].transcript; const target = $(targetId); target.value = [target.value.trim(), text].filter(Boolean).join(' '); $('voiceStatus').textContent = 'Captured.'; };
  speech.onerror = event => { $('voiceStatus').textContent = `Dictation stopped: ${event.error}. Type your response instead.`; };
  speech.onend = () => { speechRecognition = null; };
  speechRecognition = speech; $('voiceStatus').textContent = 'Listening…'; speech.start();
}

function exportMaps() {
  if (!Object.keys(maps).length) { setMode('expert'); return; }
  const blob = new Blob([JSON.stringify({ product: 'IncidentLens', version: 1, maps: Object.values(maps) }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'incidentlens-work-map.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

for (const item of cases) $('caseSelect').append(new Option(item.title, item.id));
const speakQuestion = el('button', 'voice-button', '▷ Hear the question'); speakQuestion.type = 'button'; speakQuestion.addEventListener('click', () => speak('question')); $('coachQuestion').after(speakQuestion);
const speakFeedback = el('button', 'voice-button hidden', '▷ Hear the feedback'); speakFeedback.type = 'button'; speakFeedback.id = 'speakFeedback'; speakFeedback.addEventListener('click', () => speak('feedback')); $('feedback').after(speakFeedback);
$('caseSelect').addEventListener('change', event => { active = cases.find(item => item.id === event.target.value) || cases[0]; renderCase(); });
$('expertTab').addEventListener('click', () => setMode('expert'));
$('learnerTab').addEventListener('click', () => setMode('learner'));
$('mapTab').addEventListener('click', () => setMode('map'));
$('startExpert').addEventListener('click', () => setMode('expert'));
$('startLearner').addEventListener('click', () => setMode('learner'));
$('saveMap').addEventListener('click', saveMap);
$('submitAnswer').addEventListener('click', submitAnswer);
$('voiceExpert').addEventListener('click', () => dictate('expertWhy'));
$('voiceLearner').addEventListener('click', () => dictate('learnerWhy'));
$('exportMap').addEventListener('click', exportMaps);
$('resetBtn').addEventListener('click', () => { if (confirm('Clear the saved Work Map and reset the demo?')) { maps = {}; localStorage.removeItem(key); renderCase(); setMode('expert'); } });
renderCase();
