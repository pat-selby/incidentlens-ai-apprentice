# IncidentLens: recording guide

Each Hack-Nation video must be at most 60 seconds. Record these in your own voice, show the live product for the demo and technical videos, and keep every claim tied to the current prototype. The sponsor challenge is ElevenLabs AI Apprentice. This version uses browser speech, not the ElevenLabs API.

## Team introduction

"I'm Patrick Selby, a cybersecurity student at Grambling State University. I built IncidentLens around a question I kept running into while learning security: how do new analysts learn the judgment behind an expert's decision? A checklist can tell you to review an alert, but it does not explain why a suspicious signal might be harmless, or when it is too risky to close. My project captures that explanation while the expert works and turns it into a practice case. The demo uses fictional security alerts so anyone can test it safely."

## Product demo

"Here is an impossible-travel alert. As the expert, I open the device and VPN signals, then choose to verify the session before closing or escalating. IncidentLens asks why. I explain that the VPN may account for the location jump, but I still need to confirm the approved IP and user session. The app saves my decision, evidence, reasoning, and guardrail in a Work Map. Now I switch to apprentice mode. I choose an action and explain my reasoning. The coach checks my action, evidence, and safety step, then shows the expert's note. The goal is to teach judgment, not just the right button."

## Technical walkthrough

"IncidentLens is a browser-based prototype with three synthetic alert cases. It records which evidence cards an expert opens, their decision, and their explanation. A Work Map stores the result locally and can be exported as JSON. Apprentice mode compares a learner's choice and written reasoning with the case's reference path. The three-part feedback engine checks the action, relevant signals, and a verification guardrail. Browser speech APIs support dictation and spoken coaching where available. The current feedback is deterministic, so it does not claim to be an LLM or an ElevenLabs integration. The repo includes tests for map capture and feedback."

## Final submission check

1. Take or choose a real photo of yourself for the solo team photo. Do not use a generated likeness.
2. Record each video as MP4 or MOV, at most 60 seconds and 1 GB.
3. Upload the photo and all three videos to your saved HackOS project, then click **Submit project**. The draft is not a submission.
4. Submit the separate Google Form linked from HackOS.
5. Confirm HackOS shows the submitted status and save the confirmation.
