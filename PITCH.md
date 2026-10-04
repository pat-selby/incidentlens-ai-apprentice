# IncidentLens: recording guide

Each Hack-Nation video must be at most 60 seconds. Record these in your own voice, show the live product for the demo and technical videos, and keep every claim tied to the current prototype. The sponsor challenge is ElevenLabs AI Apprentice. Use the [Vercel demo](https://incidentlens-ai-apprentice.vercel.app/) for ElevenLabs voice.

## Team introduction

"I'm Patrick Selby, a cybersecurity student at Grambling State University. I built IncidentLens around a question I kept running into while learning security: how do new analysts learn the judgment behind an expert's decision? A checklist can tell you to review an alert, but it does not explain why a suspicious signal might be harmless, or when it is too risky to close. My project captures that explanation while the expert works and turns it into a practice case. The demo uses fictional security alerts so anyone can test it safely."

## Product demo

"Here is an impossible-travel alert. As the expert, I open the device and VPN signals, then choose to verify the session before closing or escalating. IncidentLens asks why, and ElevenLabs speaks the question. I explain the evidence, name an exception that could change my decision, and record a safety check. The Work Map saves the sequence I followed. In apprentice mode, I make my own call and explain it. The coach checks my action, evidence, and safety step, then shows the expert's reasoning and exception. The goal is to teach judgment, not just the right button."

## Technical walkthrough

"IncidentLens runs on Vercel with three synthetic alert cases. It records the evidence an expert opens, the decision, reasoning, exception, and guardrail. The Work Map stays in the browser and exports as JSON. Apprentice mode compares the learner's response with an authored reference path. The feedback engine is deterministic. A server function sends only authored case text to ElevenLabs Text-to-Speech, keeping the API key and freeform notes out of the browser request. The repo includes tests for map capture, coaching, and the voice endpoint."

## Final submission check

1. Take or choose a real photo of yourself for the solo team photo. Do not use a generated likeness.
2. Record each video as MP4 or MOV, at most 60 seconds and 1 GB.
3. Upload the photo and all three videos to your saved HackOS project, then click **Submit project**. The draft is not a submission.
4. Submit the separate Google Form linked from HackOS.
5. Confirm HackOS shows the submitted status and save the confirmation.
