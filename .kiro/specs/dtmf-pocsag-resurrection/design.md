# Architecture & Design Specification: PulseTone-95 GhostLine

## 1. System Overview & Resurrection Rationale
PulseTone-95: GhostLine resurrects two iconic telecommunications protocols from 1995:
1. **ITU-T Q.23 Dual-Tone Multi-Frequency (DTMF) Signaling:** Converting physical tactile 12-key matrix landline phone buttons into dual-frequency audio sine waves (697–941 Hz row frequencies × 1209–1633 Hz column frequencies).
2. **Motorola POCSAG (Post Office Code Standardisation Advisory Group) 1200-baud Alphanumeric Pager Telemetry:** Radiating compact Capcode telemetry strings to notify remote caregivers when medication thresholds, spend caps, or drug-drug Beers Criteria interactions occur.

These legacy protocols interface with modern AI infrastructure:
- **Next.js 15 Client Frontend:** Incorporates a Web Audio API synthesizer for zero-asset mathematical tone generation, an interactive DTMF landline terminal, and a real-time POCSAG pager telemetry display.
- **Node.js 22 Model Context Protocol (MCP) Server (`backend-mcp`):** Hosts autonomous healthcare tools for medication inventory management, clinical logging, Beers Criteria drug interaction checking, and PayPal Vault commerce settlement.
- **SQLite WAL Clinical & Ledger Database:** Persists doses, audit trails, and financial records with ACID compliance.
- **AG Grid v36 Enterprise Financial-Clinical Ledger:** Renders real-time telemetry, transaction proofs, and clinical audit records with millisecond responsiveness.

```
+---------------------------------------------------------------------------------------+
|                               Next.js 15 App Frontend                                 |
|                                                                                       |
|  +--------------------------------+       +----------------------------------------+  |
|  |   1995 ITU-T Q.23 DTMF Bar     |       |   1995 POCSAG Alphanumeric Pager Bar   |  |
|  | - Web Audio API Pure Sine DSP  |       | - 2400 Hz Acoustic Chirp Generator     |  |
|  | - Dual-Tone Matrix (697-1633Hz)|       | - Capcode: CAP:0995-RX Frame Stream    |  |
|  | - Tactile Muscle Memory Macros |       | - Live Telemetry & Frequency Readout   |  |
|  +--------------------------------+       +----------------------------------------+  |
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
|  |  (Warfarin, Aspirin, etc.)    |         | - Over $50: Caregiver Pager / Invoice |  |
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

## 2. Mathematical Dual-Tone Synthesis (ITU-T Q.23)
The Web Audio API generates DTMF frequencies purely via two simultaneous `OscillatorNode` instances connected through an audio summing gain network:

$$s(t) = A_1 \sin(2\pi f_{\text{low}} t) + A_2 \sin(2\pi f_{\text{high}} t)$$

| DTMF Token | Low Group ($f_{\text{low}}$) | High Group ($f_{\text{high}}$) | Standard Function / Macro Action |
| :---: | :---: | :---: | :--- |
| **1** | 697 Hz | 1209 Hz | Dose Log Macro (`1#` -> Take Medication) |
| **2** | 697 Hz | 1336 Hz | Refill Macro (`2#` -> Autonomous Refill) |
| **3** | 697 Hz | 1477 Hz | Vitals Macro (`3#` -> Log Blood Pressure) |
| **0** | 941 Hz | 1336 Hz | Beers Safety Macro (`0#` -> Drug Safety Inquiry) |
| **9** | 852 Hz | 1477 Hz | Emergency Pager Macro (`9#` -> Emergency Caregiver Alert) |
| **\*** | 941 Hz | 1209 Hz | Tone Calibration |
| **#** | 941 Hz | 1477 Hz | Command Execution Terminator |

---

## 3. Motorola POCSAG Pager Telemetry Frame Protocol
Telemetry broadcast to caregiver devices follows the 1200-baud alphanumeric POCSAG frame structure:
```text
[CAP:0995-MED] <TIMESTAMP> | BEEP:2400HZ | PRIORITY:HIGH | MSG: <ALERT_PAYLOAD>
```
When an alert fires:
1. The server generates an SSE notification event.
2. The UI triggers the acoustic 2400 Hz 4-chirp burst (`playPagerAlert()`).
3. AG Grid renders a high-visibility incident row in the Clinical-Financial Ledger.

---

## 4. Geriatric Clinical Invariants & Autonomous Commerce
1. **Clinical Safety Guarantee:** The drug interaction service audits patient prescriptions against the 2023 American Geriatrics Society (AGS) Beers Criteria. Severe contraindications (e.g., Warfarin + NSAIDs, ACE inhibitors + Potassium-sparing diuretics) reject automated dispensing and trigger immediate POCSAG pager alerts.
2. **Autonomous Spending Guarantee:**
   - Single refill transactions where cumulative monthly balance $S + P \le \$50.00$ are settled instantaneously via PayPal Vault.
   - Refills exceeding the threshold suspend autonomous execution, generate a PayPal Invoice, and notify Sarah Connor via pager.

---

## 5. 1995 Killer Hardware Subsystems

### 5.1 Real Microphone Acoustic Coupler & 8-Band Goertzel Oscilloscope
- **Acoustic Coupling:** Emulates the classic 1995 modem/telephony acoustic coupler by capturing live ambient audio via `navigator.mediaDevices.getUserMedia({ audio: true })`.
- **8-Band Spectral Oscilloscope:** An `AnalyserNode` (`fftSize = 4096`, frequency bin resolution $\Delta f \approx 10.77\text{ Hz}$ at 44.1kHz / $11.72\text{ Hz}$ at 48kHz) evaluates energy at all 8 ITU-T Q.23 frequencies ($697, 770, 852, 941\text{ Hz}$ and $1209, 1336, 1477, 1633\text{ Hz}$).
- **Goertzel Tone Lock & Debounce:** Requires $>14\text{ dB}$ SNR above local noise floor, a minimum sustained duration of $\ge 120\text{ ms}$, and a $900\text{ ms}$ inter-digit refractory cooldown. Decoded digits automatically dispatch into the MCP clinical/commerce turn engine.
- **Spectral Orthogonality Invariant (PBT Property 4):** Formally proved with `fast-check` to maintain $\ge 6$ bins minimum separation between any two DTMF frequencies across both 44.1kHz and 48kHz sample rates with up to $\pm 1.5\%$ frequency drift.

### 5.2 PSTN Landline 300Hz–3400Hz Bandpass Filter & Mechanical Relay Clicks
- **PSTN Simulation:** Routes AI voice playback (Amazon Polly / Web Speech API) through a dual Biquad filter chain (Highpass $300\text{ Hz}$ + Lowpass $3400\text{ Hz}$, $Q = 0.707$) to replicate authentic copper-wire plain old telephone service (POTS).
- **Mechanical Handset Physics:** Synthesizes realistic 1995 Bell System handset plunger relay clicks ($15\text{ ms}$ shaped noise burst + $180\text{ Hz} / 120\text{ Hz}$ resonant mechanical thud) upon off-hook (turn initiation) and on-hook (turn termination).
- **Toggle Control:** Accessible via the `📞 PSTN Line: ON/OFF` toggle button on the GhostLine panel.

### 5.3 1995 Pharmacy Thermal Fax Receipt Drawer (ITU-T T.30)
- **Stepper Motor & Acoustic Feed:** Web Audio API mathematically synthesizes the classic thermal fax paper-feed stepper motor sound ($28\text{ Hz}$ pulsed white noise through an $1800\text{ Hz}$ bandpass filter followed by a $1400\text{ Hz}$ end-of-page confirmation chirp).
- **Collapsible Rx Slip:** Renders an authentic monospaced thermal paper receipt strip (`bg-slate-50`, dashed border, 200 DPI fax header metadata, patient Eleanor Vance MRN: 95-0812, 2023 AGS Beers Criteria clearance stamp, and PayPal Vault autonomous capture proof).
- **Interactive Action:** Triggered via `📠 1995 Thermal Fax Rx` drawer toggle or `📠 Print Rx Slip` button.
