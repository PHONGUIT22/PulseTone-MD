# Requirements Specification: PulseTone-95 GhostLine (DTMF & POCSAG Resurrection)

## Overview
PulseTone-95: GhostLine resurrects 1995 ITU-T Q.23 Dual-Tone Multi-Frequency (DTMF) Landline signaling and 1995 Motorola POCSAG Alphanumeric Pager telemetry, directly interfacing with an autonomous Model Context Protocol (MCP) Healthcare Commerce engine.

Designed for elderly patients with neurodegenerative conditions (e.g., Parkinson's tremors, macular degeneration) who cannot operate smartphone touchscreens or navigate multi-factor authentication, PulseTone-95 bridges legacy landline muscle memory to state-of-the-art agentic medical workflows.

---

## EARS Requirements

### REQ-1: ITU-T Q.23 Dual-Tone Synthesis & Goertzel Audio Decoding
- **REQ-1.1 (Dual-Frequency Tone Synthesis):**
  - **WHEN** the patient presses any DTMF keypad token (`0-9`, `*`, `#`), **THE SYSTEM SHALL** synthesize pure dual-frequency sinusoidal waves combining the corresponding low-group frequency (`697 Hz`, `770 Hz`, `852 Hz`, `941 Hz`) and high-group frequency (`1209 Hz`, `1336 Hz`, `1477 Hz`, `1633 Hz`) conforming to ITU-T Q.23 standards via the Web Audio API without relying on external or pre-recorded audio assets.
- **REQ-1.2 (Macro Sequence Command Decoding):**
  - **WHEN** a valid two-digit terminator macro is registered:
    - Sequence `1#`: **THE SYSTEM SHALL** decode and dispatch the clinical log dose intent (`"I just took my morning Amlodipine"`).
    - Sequence `2#`: **THE SYSTEM SHALL** trigger the autonomous prescription refill intent (`"Refill my Amlodipine prescription"`).
    - Sequence `3#`: **THE SYSTEM SHALL** decode and log vital signs telemetry (`"My blood pressure is 124 over 78"`).
    - Sequence `0#`: **THE SYSTEM SHALL** trigger the 2023 AGS Beers Criteria drug safety evaluation (`"Can I take Aspirin with Warfarin?"`).
    - Sequence `9#`: **THE SYSTEM SHALL** trigger an urgent caregiver POCSAG pager alert dispatch (`"Ring Sarah's caregiver pager urgently"`).
- **REQ-1.3 (Frequency Tolerance & Out-of-Band Noise Rejection):**
  - **WHEN** incoming tone frequencies deviate by more than $\pm 1.5\%$ from ITU-T Q.23 center frequencies, **THE SYSTEM SHALL** reject the frame as transmission noise and prohibit invalid tool invocation.

---

### REQ-2: 1995 POCSAG Alphanumeric Pager Telemetry
- **REQ-2.1 (Compact Alphanumeric Pager Broadcast):**
  - **WHEN** patient medication inventory drops below or equal to 3 pills, wallet autonomous refill spending approaches the monthly cap, or an emergency alert is triggered, **THE SYSTEM SHALL** broadcast a 1200-baud alphanumeric POCSAG pager frame formatted as `[CAP:0995-RX | BEEP-TONE-2400HZ | <PAYLOAD>]` via Server-Sent Events (SSE).
- **REQ-2.2 (Acoustic Pager Alert Synthesis):**
  - **WHEN** an emergency POCSAG frame is received on the caregiver dashboard, **THE SYSTEM SHALL** synthesize an authentic 1995 Motorola POCSAG 2400 Hz 4-burst chirp pattern using dual envelope gain nodes in the Web Audio API.

---

### REQ-3: Clinical & Financial Invariants (AGS Beers Criteria & Wallet Safety)
- **REQ-3.1 (Geriatric Drug Safety Invariant):**
  - **WHEN** any drug interaction query or prescription refill contains known contraindicated geriatric combinations (including Warfarin + Aspirin, Lisinopril + Potassium, or high-risk sedative/anticholinergic compounds per 2023 AGS Beers Criteria), **THE SYSTEM SHALL** flag an immediate high-risk clinical conflict (`hasInteractions: true`), suspend autonomous dispensing, and alert the remote caregiver.
- **REQ-3.2 (Autonomous Family Wallet $50.00 Refill Cap):**
  - **WHEN** an autonomous prescription refill order is calculated with price $P$ and cumulative monthly expenditure $S$:
    - If $S + P \le \$50.00$, **THE SYSTEM SHALL** autonomously capture payment via the PayPal Vault without requiring manual verification.
    - If $S + P > \$50.00$, **THE SYSTEM SHALL** disallow autonomous capture, lock the transaction, issue an invoiced caregiver escrow authorization request, and transmit an urgent POCSAG alert to the caregiver.
- **REQ-3.3 (Property-Based Verification Invariant):**
  - **THE SYSTEM SHALL** pass automated Property-Based Tests (PBT) using `fast-check` across $\ge 100$ randomized iterations verifying mathematical frequency determinism, case-insensitive Beers Criteria matching, and invariant compliance of the $50 wallet threshold.
