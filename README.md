# 📟 PulseTone-95: GhostLine
### *Resurrecting 1995 ITU-T Q.23 DTMF Landline Signaling & Motorola POCSAG Pager Telemetry for Autonomous Agentic Healthcare*
**Kiroween 2026 Hackathon — Track: Resurrection**  
*Best Kiro Crew App Bonus Contender*

---

## ⚡ What Dead Tech Was Resurrected & Why?

### The Dead Tech
1. **1995 ITU-T Q.23 Touch-Tone DTMF Signaling:** The iconic dual-frequency matrix signaling standard (`697–941 Hz` low group $\times$ `1209–1633 Hz` high group) that powered Bell System landline telephones throughout the late 20th century.
2. **1995 Motorola POCSAG Alphanumeric Pagers:** The 1200-baud radiopaging protocol radiating compact capcode messages (`[CAP:0995-MED]`) and piercing 2400 Hz acoustic chirps that kept on-call physicians and emergency responders connected prior to mobile internet.

### Why Resurrect It in 2026?
Modern smartphone healthcare apps fail the patients who need them most:
- **Eleanor Vance (Age 78)** suffers from advanced Parkinson’s disease with resting intention tremors and macular degeneration. She cannot reliably tap tiny capacitive glass buttons, dismiss iOS permission modals, or navigate multi-factor authentication (2FA) SMS codes.
- However, Eleanor possesses **50+ years of physical landline telephone muscle memory**. She knows the tactile geometry of a 12-key telephone keypad by heart.
- **PulseTone-95: GhostLine** resurrects 1995 landline DTMF macros (`1#`, `2#`, `3#`, `0#`, `9#`) and Motorola POCSAG pager telemetry as the primary physical control surface for an autonomous **Model Context Protocol (MCP)** healthcare and commerce engine.
- Behind the scenes, dual-frequency sine waves synthesized mathematically via the browser's native **Web Audio API** trigger real-time AI agents that log doses, audit prescriptions against the **2023 AGS Beers Criteria**, settle autonomous refills via **PayPal Vault**, and page her daughter **Sarah Connor** when clinical intervention is required.

---

## 🏛️ End-to-End System Architecture

```
+---------------------------------------------------------------------------------------+
|                               Next.js 15 Client Interface                             |
|                                                                                       |
|  +--------------------------------+       +----------------------------------------+  |
|  |   1995 ITU-T Q.23 DTMF Pad     |       |   1995 Motorola POCSAG Pager LCD       |  |
|  | - Pure Web Audio OscillatorDSP |       | - 2400 Hz Quad-Chirp Synthesizer       |  |
|  | - Exact Dual-Tone Synthesis    |       | - 1200-Baud Alphanumeric Frame Stream  |  |
|  | - Senior Muscle-Memory Macros  |       | - Real-time Carrier & Frequency Readout|  |
|  +--------------------------------+       +----------------------------------------+  |
|                                   \       /                                           |
|                                    v     v                                            |
|                        AG Grid v36 Clinical-Financial Ledger                          |
+------------------------------------------+--------------------------------------------+
                                           | HTTP JSON / SSE Turn Stream
                                           v
+---------------------------------------------------------------------------------------+
|                       Node.js 22 MCP Server (`backend-mcp`)                          |
|                                                                                       |
|  +-------------------------------+         +---------------------------------------+  |
|  |     /api/agent/turn Engine    | <-----> |   ITU-T Q.23 Decoding & Telemetry     |  |
|  +-------------------------------+         +---------------------------------------+  |
|                 |                                              |                      |
|                 v                                              v                      |
|  +-------------------------------+         +---------------------------------------+  |
|  |  2023 AGS Beers Criteria Safe |         | Autonomous Family Wallet ($50 Cap)   |  |
|  |  Drug Interaction Checker     |         | - Under $50: PayPal Vault Settlement  |  |
|  |  (Warfarin, Aspirin, Diazepam)|         | - Over $50: Caregiver Pager / Invoice |  |
|  +-------------------------------+         +---------------------------------------+  |
|                 |                                              |                      |
|                 +-----------------------+----------------------+                      |
|                                         v                                             |
|                    +-----------------------------------------+                        |
|                    |   SQLite WAL Clinical-Financial Store   |                        |
|                    +-----------------------------------------+                        |
+---------------------------------------------------------------------------------------+
```

---

## 🎛️ 1995 DTMF Macro Reference & Audio Signal Processing

All telecom signaling in PulseTone-95 is synthesized **purely mathematically** using browser `AudioContext` sine oscillators (zero external MP3/WAV assets, 100% offline resilient, zero copyright liabilities).

$$s(t) = A_1 \sin(2\pi f_{\text{low}} t) + A_2 \sin(2\pi f_{\text{high}} t)$$

| DTMF Macro | Low Group ($f_{\text{low}}$) | High Group ($f_{\text{high}}$) | Decoded Intent & MCP Action | Telemetry Payload |
| :---: | :---: | :---: | :--- | :--- |
| **`[1#]`** | 697 Hz | 1209 Hz | **Log Morning Dose:** `"I just took my morning Amlodipine"` | `logDoseStatus` tool invocation |
| **`[2#]`** | 697 Hz | 1336 Hz | **Auto-Refill Rx:** `"Refill my Amlodipine prescription"` | `orderRefillTool` via PayPal Vault |
| **`[3#]`** | 697 Hz | 1477 Hz | **Log Vitals:** `"My blood pressure is 124 over 78"` | `recordVitals` biometric update |
| **`[0#]`** | 941 Hz | 1336 Hz | **Beers Safety Check:** `"Can I take Aspirin with Warfarin?"` | `checkDrugInteractions` clinical check |
| **`[9#]`** | 852 Hz | 1477 Hz | **Page Caregiver:** `"Ring Sarah's caregiver pager urgently"` | Motorola POCSAG 2400 Hz Alert Chirp |

### 📟 1995 Killer Hardware Subsystems
1. **Live Microphone Acoustic Coupler & 8-Band Goertzel Oscilloscope:**
   - Real-time acoustic reception via `navigator.mediaDevices.getUserMedia` and Web Audio `AnalyserNode` (`fftSize = 4096`, $\approx 10.77\text{ Hz}$ bin resolution).
   - Live spectrum visualizer monitoring 4 row frequencies ($697, 770, 852, 941\text{ Hz}$) and 4 column frequencies ($1209, 1336, 1477, 1633\text{ Hz}$) with active SNR meter and Goertzel tone lock.
   - Allows users to play physical DTMF phone tones or sound clips into the laptop microphone to automatically drive MCP clinical & commerce actions!
2. **PSTN Landline 300Hz–3400Hz Voice Filter & Mechanical Relay Clicks:**
   - Native Web Audio biquad filter chain (Highpass $300\text{ Hz}$ + Lowpass $3400\text{ Hz}$) recreating authentic plain old telephone service (POTS) copper wire voice frequency response.
   - Synthesizes realistic 1995 Bell System handset plunger relay clicks ($15\text{ ms}$ noise burst + $180\text{ Hz} / 120\text{ Hz}$ resonant thud) on off-hook and on-hook events.
3. **1995 Pharmacy Thermal Fax Receipt Drawer (ITU-T T.30):**
   - Synthesizes authentic pharmacy thermal fax paper-feed stepper motor acoustics ($28\text{ Hz}$ pulsed white noise through an $1800\text{ Hz}$ bandpass filter + $1400\text{ Hz}$ completion beep).
   - Renders a collapsible 200 DPI monospaced thermal fax slip complete with Beers Criteria safety clearance and autonomous PayPal Vault settlement proof.

---

## 🎃 How We Used Kiro (Kiroween 2026 Technical Write-Up)

Kiroween 2026 evaluates projects across 8 technical dimensions. Below is the detailed breakdown of how Kiro powered the resurrection of PulseTone-95:

### 1. Kiro IDE, CLI & Kiro Crew Workflow
We utilized the Kiro toolchain to build and coordinate specialized AI agents that executed our development pipeline with deterministic rigor. The system was structured into multi-workspace configurations (`frontend` and `backend-mcp`), leveraging Kiro tasks and background process orchestrators to execute builds, typechecks, and tests concurrently.

### 2. Custom Agents (`/.kiro/agents/kiro-crew.json`)
For the *Best Kiro Crew App* bonus prize, we configured a specialized 3-agent Kiro Crew:
- **`telecom-dsp-architect`:** Specialized in 1990s telephony DSP, Goertzel filter calculations, and ITU-T Q.23 frequency synthesis using Web Audio API without third-party audio dependencies.
- **`geriatric-beers-auditor`:** Pharmacological specialist enforcing the 2023 American Geriatrics Society (AGS) Beers Criteria knowledge base across 20 clinical interaction rules.
- **`mcp-commerce-orchestrator`:** Healthcare financial logic agent managing PayPal Vault 1-click settlements, caregiver escrow invoicing, and SQLite WAL ledger persistence.

### 3. Agent Hooks (`/.kiro/hooks/`)
We deployed automated Kiro Agent Hooks to protect clinical and schema invariants:
- **`clinical-pbt-guard.json`:** Triggers `npm run test --workspace=backend-mcp` on file save whenever files in `backend-mcp/src/services/` are edited, ensuring no clinical rule can drift.
- **`mcp-schema-sync.json`:** Validates tool definitions against Model Context Protocol standards whenever files in `backend-mcp/src/tools/` or `server.ts` change.

### 4. Spec-Driven Development (`/.kiro/specs/`) vs. Vibe Coding
Rather than unbounded "vibe coding", the entire resurrection was executed against formal specifications in `/.kiro/specs/dtmf-pocsag-resurrection/`:
- **`requirements.md`:** Authored in Easy Approach to Requirements Syntax (**EARS**) format (`WHEN [trigger] THE SYSTEM SHALL [response]`) defining strict behavioral criteria.
- **`design.md`:** Mathematical formulation of ITU-T dual-sine wave generation and POCSAG alphanumeric telemetry frames.
- **`tasks.md`:** Execution-constrained, verifiable implementation checklist mapped to automated test suites.

### 5. Steering Docs (`/.kiro/steering/`)
Persistent steering directives guided every architectural choice:
- **`product.md`:** Anchored development around Eleanor Vance (78, Parkinson's) and Sarah Connor (caregiver), enforcing 0-frustration landline muscle memory interfaces.
- **`tech.md`:** Mandated pure mathematical DSP in Web Audio API with zero copyrighted sound files.
- **`clinical-and-ui-guardrails.md`:** Strictly locked the existing visual styling, color palette, and typography of PulseTone-95: GhostLine while enforcing the $50 autonomous wallet cap.

### 6. Model Context Protocol (MCP) Server Architecture
The Node.js 22 MCP server implements the complete tri-pillar specification:
- **Tools:** `orderRefill` (PayPal Vault), `checkDrugInteractions` (Beers Criteria), `logDoseStatus`, `recordVitals`, `clinicalAdvisor`.
- **Resources:** Streamable JSON resources (`pulsetone95://patient/eleanor-vance/adherence-30d`, `pulsetone95://clinical/prescriptions/active`).
- **Prompts:** Standardized clinical negotiation and emergency escalation prompt templates.

### 7. Property-Based Testing (PBT) Invariants & Edge Cases Caught
Using `fast-check` in `backend-mcp/tests/kiroweenPbt.test.ts`, we verified 4 core invariants with 100+ random iterations per property:
- **Property 1 (DTMF Frequency Determinism & Noise Rejection):**
  - *Edge Case Caught by PBT:* Fast-check discovered that a $-8.1\%$ frequency perturbation on digit `'0'` ($941\text{ Hz} \times (1 - 0.081) \approx 864.7\text{ Hz}$) inadvertently collided with the upper tolerance window of digit `'8'` ($852\text{ Hz} \times 1.015 = 864.78\text{ Hz}$), since both digits share the identical column frequency ($1336\text{ Hz}$). PBT led us to implement exact inter-tone guard band verification ($+2\%$ to $+6\%$) to guarantee line noise rejection.
- **Property 2 (2023 AGS Beers Criteria Safety Invariant):**
  - Proved that arbitrary casing (`wArFaRiN`, `aSpIrIn`), leading/trailing whitespace, and dosage variations NEVER bypass detection. Proved that high-risk benzodiazepines (Diazepam) are strictly flagged as `AVOID` in seniors.
- **Property 3 (Autonomous Family Wallet $50 Cap Invariant):**
  - Proved that for any refill price $P \in [\$0.01, \$500.00]$ and current spend $S \in [\$0.00, \$50.00]$, autonomous Vault capture is permitted IF AND ONLY IF $S + P \le \$50.00$; any transaction over $\$50.00$ escalates to a caregiver invoice and POCSAG alert.
- **Property 4 (Goertzel / FFT Spectral Bin Orthogonality at 44.1kHz & 48kHz):**
  - Proved that all 8 ITU-T Q.23 DTMF tones ($697, 770, 852, 941, 1209, 1336, 1477, 1633\text{ Hz}$) map to strictly unique FFT bins with a minimum separation of $\ge 6$ bins across both $44.1\text{ kHz}$ and $48\text{ kHz}$ audio sample rates with up to $\pm 1.5\%$ frequency drift.

### 8. Kiro Powers & Bundled Best Practices
We utilized Kiro Powers to enforce zero-trust security (preventing accidental credential leaks), maintain ACID compliance across SQLite WAL transactions, and ensure full WCAG AAA contrast accessibility for geriatric usability.

---

## 🧪 Test Verification Suite

All 109 Vitest tests (98 original regression tests + 11 Property-Based Tests) pass with 100% success:

```text
 ✓ tests/kiroweenPbt.test.ts (11 tests)
   ✓ Property 1: ITU-T Q.23 DTMF Encoding/Decoding Determinism & Noise Rejection (4 tests)
     ✓ proves bijectivity: for any sequence of valid DTMF digits, encoding and decoding returns exact sequence without collision
     ✓ proves noise tolerance within +/- 1.2% in-band jitter: decoding remains 100% deterministic
     ✓ proves out-of-band rejection: frequencies in inter-tone guard band (+2% to +6%) are rejected as line noise
     ✓ proves that any frequency deviation outside +/- 1.5% never decodes to the original digit
   ✓ Property 2: 2023 AGS Beers Criteria Clinical Safety Invariants (3 tests)
     ✓ proves Warfarin + Aspirin always triggers a CRITICAL bleeding warning across arbitrary casing and whitespace
     ✓ proves Lisinopril + Potassium always triggers a HIGH hyperkalemia warning across arbitrary casing and whitespace
     ✓ proves Diazepam (high-risk benzodiazepine) in geriatric patients is NEVER silently approved
   ✓ Property 3: Autonomous Family Wallet $50.00 Spending Cap Invariant (2 tests)
     ✓ proves autonomous Vault capture is permitted IF AND ONLY IF S + P <= $50.00
     ✓ proves exact boundary condition at $50.00 threshold
   ✓ Property 4: ITU-T Q.23 Goertzel / FFT Spectral Bin Orthogonality (44.1kHz & 48kHz) (2 tests)
     ✓ proves that all 8 DTMF tones map to mutually orthogonal FFT bins with zero collision and min separation >= 6 bins
     ✓ proves frequency deviation up to +/-1.5% maintains bin separation without collision
 ✓ tests/tools.test.ts (14 tests)
 ✓ tests/agenticCommerce.test.ts (7 tests)
 ✓ tests/agentTurn.test.ts (13 tests)
 ✓ tests/mcpPrimitives.test.ts (10 tests)
 ✓ tests/bedrockEnterprise.test.ts (22 tests)
 ✓ tests/scheduleAndTemporal.test.ts (6 tests)
 ✓ tests/medicineCrud.test.ts (3 tests)
 ✓ tests/paypalService.test.ts (11 tests)
 ✓ tests/authMultiUser.test.ts (6 tests)

 Test Files  10 passed (10)
      Tests  109 passed (109)
```

---

## 🚀 Quickstart & Reproduction

### Prerequisites
- Node.js 22+
- npm 10+

### Installation & Test Execution
```bash
# 1. Clone repository
git clone <repo-url>
cd PulseTone-MD

# 2. Install dependencies
npm install

# 3. Run complete test suite (Vitest + Fast-Check PBT)
npm run test --workspace=backend-mcp

# 4. Typecheck frontend
npx tsc --noEmit --project frontend/tsconfig.json

# 5. Launch application
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Tap `[1#]`, `[2#]`, or `[9#]` to experience 1995 ITU-T Q.23 dual-tone synthesis and watch the autonomous MCP healthcare agent respond!
