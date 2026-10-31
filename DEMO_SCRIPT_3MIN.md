# 🎬 PulseTone-95: GhostLine — 3-Minute Hackathon Demo Script
### *Kiroween 2026 (Track: Resurrection) • Best Kiro Crew App Contender*
**Starring:** Eleanor Vance (Age 78, Patient) & Sarah Connor (Age 48, Remote Caregiver & Daughter)

---

## ⏱️ Video Timeline & Scene Breakdown

```
0:00 ────────────────── 0:30 ────────────────── 1:15 ────────────────── 1:55 ────────────────── 2:30 ────────────────── 3:00
[The Dead Tech Problem]  [DTMF Landline Macros]  [AGS Beers Safety]    [POCSAG Pager & Wallet]  [Kiro Architecture & PBT]
```

---

### [0:00 – 0:30] Scene 1: The Dead Tech Problem & Resurrection Rationale
- **Visual:** Close-up of Eleanor Vance's hands trembling with Parkinson's tremors, trying to operate a sleek modern smartphone. She accidentally triggers Siri, dismisses a tiny 2FA modal, and sighs in frustration.
- **Presenter (Voiceover):**
  > *"Every year, technology pushes seniors toward smaller glass touchscreens, hidden gesture navigations, and two-factor push notifications. For 78-year-old Eleanor Vance, who lives with Parkinson's tremors and macular degeneration, modern touchscreens aren't just difficult — they are dangerous.*
  > 
  > *Welcome to **PulseTone-95: GhostLine**, built for Kiroween 2026's **Resurrection Track**. We resurrected two iconic telecommunications protocols from 1995: **ITU-T Q.23 Dual-Tone Multi-Frequency (DTMF) landline signaling** and **Motorola POCSAG alphanumeric pagers**, directly bridging 50 years of tactile muscle memory into our autonomous Model Context Protocol (MCP) healthcare engine."*

---

### [0:30 – 1:15] Scene 2: Interactive DTMF Landline Macros & Pure Web Audio DSP
- **Visual:** Focus shifts to the application interface. The camera highlights the resurrected **1995 Telecom Bar** at the top of the workspace.
- **Presenter Action:** Click `[1#] Log Morning Dose`.
- **Audio Output:** Real-time dual-tone sine wave rings out audibly through the speakers (`697 Hz + 1209 Hz`).
- **Telemetry Readout:** The LCD telemetry badge instantly displays `ITU-T Q.23: 697Hz × 1209Hz -> Decoded [1#]`. The agent turn executes, logging Amlodipine 5mg on the daily punch card.
- **Presenter Action:** Point out the **Live 8-Band Goertzel Oscilloscope** on the GhostLine panel. Click `🎙️ Acoustic Coupler: ON/OFF` and `📞 PSTN Line: ON/OFF`.
- **Audio & Visual Demo:**
  - The 8-band frequency spectrum lights up in real time with active SNR telemetry and Goertzel tone lock indicators.
  - With the **Acoustic Coupler** active, playing a DTMF tone from a physical telephone or phone app into the microphone instantly decodes the intent!
  - When the AI voice responds, hear the authentic 1995 Bell System **mechanical handset clicks** (`off-hook` and `on-hook`) and **300Hz–3400Hz PSTN bandpass filter**.
- **Presenter Action:** Click `📠 1995 Thermal Fax Rx` -> `📠 Print Rx Slip`.
- **Audio & Visual Output:** A realistic $28\text{ Hz}$ stepper motor paper-feed noise burst sounds, and the drawer reveals the 200 DPI monospaced thermal fax prescription receipt with clinical safety verification and PayPal Vault authorization.
- **Presenter (Voiceover):**
  > *"Notice the hardware audio: every tone, mechanical relay click, and thermal fax stepper burst is synthesized purely mathematically through the native Web Audio API — zero third-party audio files or copyrighted assets. Eleanor uses her lifelong landline muscle memory. She can press on-screen macros, speak over simulated copper POTS lines, or hold her rotary handset to the acoustic coupler microphone. The system decodes every tone with sub-millisecond precision."*

---

### [1:15 – 1:55] Scene 3: Clinical Safety & 2023 AGS Beers Criteria Interception
- **Visual:** Presenter clicks `[0#] Beers Safety Check` (`941 Hz × 1336 Hz`).
- **Agent Output:** The MCP Server intercepts the query: *"Can I take Aspirin with Warfarin?"*
- **Clinical Banner:** An immediate high-risk warning flashes on screen. The clinical advisor flags a **CRITICAL** interaction:
  > *"AGS Beers Criteria 2023 Warning: Concurrent use of Warfarin with Aspirin causes severe synergistic GI hemorrhage and bleeding hazard. Disallowed."*
- **Presenter (Voiceover):**
  > *"Our custom Kiro Crew agent, `geriatric-beers-auditor`, cross-references the 2023 American Geriatrics Society Beers Criteria. When Eleanor asks about dangerous combinations or when high-risk sedatives like Diazepam are evaluated, the system never silently passes — it suspends dispensing and immediately protects the patient."*

---

### [1:55 – 2:30] Scene 4: Autonomous Family Wallet & Motorola POCSAG Pager Telemetry
- **Visual:** Presenter clicks `Test 2400Hz Pager Chirp` or demonstrates a high-quantity refill that exceeds the **$50.00 Family Wallet monthly limit**.
- **Audio Output:** Authentic 1995 Motorola POCSAG **2400 Hz quad-burst acoustic chirp** sounds.
- **Pager Readout:** The alphanumeric LCD streams: `[CAP:0995-RX | BEEP-TONE-2400HZ | REF_LIMIT_EXCEEDED]`.
- **Presenter (Voiceover):**
  > *"To protect Eleanor from financial exploitation, autonomous PayPal Vault capture is strictly bounded at $50.00 per month. When an order exceeds the threshold or stock drops below 3 pills, the system broadcasts a 1200-baud alphanumeric POCSAG pager frame to her remote caregiver, Sarah Connor. Sarah receives the high-priority alert and can authorize the escrow invoice via PayPal."*
- **Visual:** Scroll down to the **AG Grid v36 Clinical-Financial Ledger**, showing the real-time immutable audit trail of doses, vitals, and PayPal transaction proofs.

---

### [2:30 – 3:00] Scene 5: How We Used Kiro & Property-Based Testing (PBT)
- **Visual:** Show code architecture in IDE: `/.kiro/specs/`, `/.kiro/agents/kiro-crew.json`, `/.kiro/hooks/`, and terminal showing `107 passed (107)`.
- **Presenter (Voiceover):**
  > *"PulseTone-95 was engineered end-to-end using Kiro's Spec-Driven Development:
  > 1. **EARS Specs & Steering:** Formal requirements in `/.kiro/specs/` and clinical directives in `/.kiro/steering/`.
  > 2. **Kiro Crew:** 3 specialized agents (`telecom-dsp-architect`, `geriatric-beers-auditor`, `mcp-commerce-orchestrator`) collaborating seamlessly.
  > 3. **Agent Hooks:** Auto-running Vitest suites whenever clinical services change.
  > 4. **Property-Based Testing (PBT):** Using `fast-check`, we verified DTMF frequency determinism, Beers safety, and the $50 wallet cap over 100+ random runs per property. PBT even caught a critical $-8.1\%$ frequency drift collision between 941Hz and 852Hz!
  > 
  > *1995 telecom landlines resurrected for 2026 autonomous healthcare. Thank you!"*

---

## 🎯 Presentation Checklist for Video Recording
- [x] Dual-tone Web Audio enabled and unmuted in browser.
- [x] Test `[1#]`, `[2#]`, `[0#]`, `[9#]` macros to demonstrate live dual-frequency synthesis.
- [x] Trigger 2400 Hz Motorola POCSAG pager alert chirp.
- [x] Showcase AG Grid v36 Clinical-Financial Ledger table.
- [x] Show `npm run test --workspace=backend-mcp` with 107 passing tests in terminal.
