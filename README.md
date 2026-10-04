# IncidentLens

IncidentLens is a working prototype for Hack-Nation's **ElevenLabs AI Apprentice** challenge. It focuses on one expert workflow: security alert triage. The expert opens evidence, chooses an action, and explains a judgment call. That explanation becomes a Work Map. A new analyst then practices the same case and gets feedback on their action, evidence, and guardrail.

**[Try the live voice demo](https://incidentlens-ai-apprentice.vercel.app/)** | [Read the 60-second recording guide](PITCH.md)

**Demo status:** The cases are synthetic. The expert flow captures inspection order, a decision, reasoning, exceptions, and a safety check. The coach question changes with the selected decision and evidence opened. Scoring is deterministic, not a large language model. ElevenLabs Text-to-Speech narrates the question and feedback through a server-side Vercel function. Both voice buttons were tested on the live Vercel site on October 3, 2026. The [GitHub Pages mirror](https://pat-selby.github.io/incidentlens-ai-apprentice/) uses browser speech because it has no server function.

## Run

From this directory:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`. No packages or secrets are needed. Run `node --test tests/*.test.js` for the engine tests.

## Demo flow

1. Choose **Impossible travel, or a known VPN?** and open the evidence cards.
2. Choose **Verify VPN and session, then close or escalate**. Explain why the location signal alone is not enough.
3. Explain the decision, name an exception, and record the guardrail. Save the Work Map and review the inspection trace.
4. Switch to **Apprentice practice**. Choose a response and explain your evidence and safety check. Review the three-part feedback.
5. Try the email and network cases. Export the Work Map as JSON.

## Design and safety

- All alerts, people, and organizations in the demo are fictional.
- Captured expert notes remain in browser `localStorage` until reset or export. The voice endpoint accepts only case IDs, choices, inspected signal IDs, and scores. It does not receive freeform notes.
- The expert's own reasoning is preserved verbatim. The app does not fabricate expert quotes.
- The coach's reference path and guardrail are authored case data. The current score measures whether the learner names a relevant signal and verification step. It is a teaching aid, not a reliable assessment of analyst competency.
- Dictation depends on browser support and may use the browser vendor's speech service. Typing always works.

## ElevenLabs setup

The Vercel project uses `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` as server-side Production environment variables. The `/api/voice` function uses ElevenLabs Text-to-Speech streaming to narrate an authored question or feedback summary. It never sends the expert's or learner's freeform writing. The key is restricted to Text-to-Speech, expires after 30 days, and has a 3,000-credit limit per refresh period. The function has input validation and a small per-instance rate limit, but that limit is not a hard spending cap.

The GitHub Pages URL remains a browser-voice fallback because static hosting cannot run `/api/voice`. A missing or failed voice response falls back to browser speech. Browser dictation may depend on the browser vendor's speech service.

## Submission checklist

The HackOS FAQ says the event needs three videos of at most 60 seconds each, a live demo link, a public GitHub link, and a team photo. HackOS also requires submission on its platform and a separate Google Form. Saving a project alone does not submit it. Confirm the live requirements in your event workspace before submission.
