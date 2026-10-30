---
inclusion: always
---

# Steering Directive: Technical Architecture & DSP Standards

## Core Engineering Directives

### 1. Pure Mathematical Signal Processing (Zero Third-Party Audio Files)
- All telecom audio signaling (ITU-T Q.23 DTMF tones and Motorola POCSAG 2400 Hz pager chirps) MUST be generated purely via the browser's native `AudioContext` (Web Audio API).
- No external MP3, WAV, or copyrighted telecom sound files are permitted.
- Frequencies must strictly adhere to ITU-T Q.23:
  - Low group: 697 Hz, 770 Hz, 852 Hz, 941 Hz
  - High group: 1209 Hz, 1336 Hz, 1477 Hz, 1633 Hz
- POCSAG chirp must be generated as 4 bursts of 2400 Hz sine oscillation with smooth gain envelope ramping to prevent acoustic clicks.

### 2. Autonomous MCP Agent Server Integration
- Client interacts with the Node.js 22 MCP server via `/api/agent/turn`.
- DTMF macros decode client-side and trigger agent turns with structured clinical intent.
- Real-time updates stream back to the client via Server-Sent Events (SSE).

### 3. Property-Based Testing (PBT) Mandate
- All core invariants must be covered by `fast-check` property tests running $\ge 100$ iterations per test.
- Tests must prove:
  - DTMF frequency mapping bijectivity and rejection outside $\pm 1.5\%$ noise window.
  - Drug interaction detection invariance under string casing, spacing, and alias permutations.
  - Hard mathematical boundary enforcement on the $50.00 family wallet threshold.
