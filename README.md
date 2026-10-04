# IncidentLens

IncidentLens is a working prototype for Hack-Nation's **ElevenLabs AI Apprentice** challenge. It focuses on one expert workflow: security alert triage. The expert opens evidence, chooses an action, and explains a judgment call. That explanation becomes a Work Map. A new analyst then practices the same case and gets feedback on their action, evidence, and guardrail.

**Demo status:** The current prototype runs entirely in the browser with synthetic cases. It uses built-in browser speech recognition for optional dictation and speech synthesis for a spoken coach where supported. Its feedback engine is deterministic keyword and decision matching, not a large language model. It does not currently call ElevenLabs. This distinction matters for an honest submission.

## Run

From this directory:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`. No packages or secrets are needed. Run `node --test tests/*.test.js` for the engine tests.

## Demo flow

1. Choose **Impossible travel, or a known VPN?** and open the evidence cards.
2. Choose **Verify VPN and session, then close or escalate**. Explain why the location signal alone is not enough.
3. Save the Work Map. Review the captured decision, reasoning, inspected evidence, and guardrail.
4. Switch to **Apprentice practice**. Choose a response and explain your evidence and safety check. Review the three-part feedback.
5. Try the email and network cases. Export the Work Map as JSON.

## Design and safety

- All alerts, people, and organizations in the demo are fictional.
- Captured expert notes remain in browser `localStorage` until reset or export. The app does not send them to a server.
- The expert's own reasoning is preserved verbatim. The app does not fabricate expert quotes.
- The coach's reference path and guardrail are authored case data. The current score measures whether the learner names a relevant signal and verification step. It is a teaching aid, not a reliable assessment of analyst competency.
- Dictation depends on browser support and may use the browser vendor's speech service. Typing always works.

## Next step for the sponsor track

Add a server-side ElevenLabs integration to speak the apprentice's question and tutor feedback. Keep API credentials on the server. Record a real expert workflow and test the resulting Work Map with learners. Do not describe this future integration as already built.

## Submission checklist

The HackOS FAQ says the event needs three videos of at most 60 seconds each, a live demo link, a public GitHub link, and a team photo. HackOS also requires submission on its platform and a separate Google Form. Saving a project alone does not submit it. Confirm the live requirements in your event workspace before submission.
