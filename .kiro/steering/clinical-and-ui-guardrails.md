---
inclusion: fileMatch
fileMatchPattern: "{frontend/src/**/*,backend-mcp/src/**/*}"
---

# Steering Directive: Clinical & UI Guardrails

## 1. UI & Visual Aesthetics Preservation (Strict Lock)
- Do NOT alter `frontend/src/app/globals.css`, `frontend/tailwind.config.ts`, or the font configuration in `frontend/src/app/layout.tsx`.
- All newly added components (including the 1995 DTMF Keypad & POCSAG Pager Telemetry Bar) MUST blend seamlessly into the existing PulseTone-95: GhostLine visual language:
  - Base cards: `bg-white border border-slate-200 rounded-xl shadow-sm`
  - Typography: Crisp slate hierarchy (`text-slate-900`, `text-slate-600`, `text-slate-500`, `font-mono` for telecom telemetry)
  - Status indicators: `emerald` (active/safe/in-bounds), `amber` (warning/pending), `rose`/`red` (critical/alert), `blue` (telecom signaling/info)
- Ensure high contrast (WCAG AAA) for geriatric accessibility and visual impairments.

## 2. Clinical Safety Guardrails (2023 AGS Beers Criteria)
- Ensure zero silent failures on known contraindicated drug combinations.
- Any drug interaction query or prescription refill containing high-risk drug pairs (e.g., Warfarin + Aspirin/NSAIDs, ACE Inhibitor + Potassium) must return `hasInteractions: true` and recommend immediate physician consult.
- When interactions are detected, autonomous refilling must be blocked and an escalation pager alert generated.
