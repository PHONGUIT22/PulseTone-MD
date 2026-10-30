---
inclusion: always
---

# Steering Directive: Repository & Monorepo Architecture

## Monorepo Layout

```
PulseTone-MD/
├── .kiro/                                # Kiro IDE, CLI, Spec & Steering Configuration
│   ├── agents/                           # Multi-agent crew definitions (kiro-crew.json)
│   ├── hooks/                            # Kiro Agent Hooks (auto-testing & auditing)
│   ├── settings/                         # Kiro IDE local settings & MCP registrations
│   ├── specs/                            # EARS requirements, system design, and task checklists
│   └── steering/                         # Persistent behavioral and technical steering directives
│
├── backend-mcp/                          # Node.js 22 Model Context Protocol (MCP) Server
│   ├── src/
│   │   ├── aws/                          # Bedrock, Polly & SNS clients
│   │   ├── config/                       # Environment variable validation
│   │   ├── database/                     # SQLite WAL repository layer (medicine, logs, vitals, txns)
│   │   ├── prompts/                      # Standardized clinical prompt templates
│   │   ├── resources/                    # Streamable MCP JSON resources (adherence, prescriptions)
│   │   ├── routes/                       # Express REST endpoints (/api/agent/turn, /api/today)
│   │   ├── services/                     # Drug interactions (2023 AGS Beers), PayPal Orders & Vault
│   │   ├── tools/                        # 7 Registered MCP Tool Handlers
│   │   │   ├── agentTurnHandler.ts       # Orchestrates incoming voice & DTMF intents
│   │   │   ├── clinicalAdvisor.ts        # Emergency triage & Beers Criteria interaction checker
│   │   │   ├── getTodaySchedule.ts       # Daily dose regimen scheduler
│   │   │   ├── logDoseStatus.ts          # Dose logging (taken, skipped, snoozed)
│   │   │   ├── negotiateAdherence.ts     # AI Health Guardians & Sarah Circuit-Breaker
│   │   │   ├── orderRefill.ts            # Autonomous PayPal Vault settlement & Family Wallet cap
│   │   │   └── ringDeviceHub.ts          # Proactive porch delivery & paramedic door unlocking
│   │   └── server.ts                     # MCP Server bootstrap & HTTP SSE transport
│   └── tests/                            # Vitest & Fast-Check Property-Based Testing (PBT) suites
│
└── frontend/                             # Next.js 15 Client Frontend
    ├── src/
    │   ├── app/                          # Next.js App Router (layout, page, globals.css)
    │   ├── components/                   # Interactive UI widgets
    │   │   ├── GhostLine1995Bar.tsx      # 1995 DTMF Touch-Tone Keypad & POCSAG Pager Telemetry
    │   │   ├── MedicalFinancialLedger.tsx# AG Grid v36 Enterprise Telemetry Ledger
    │   │   ├── AlexaAgentConsole.tsx     # MCP Agent turn transcript & execution log viewer
    │   │   ├── TopNavBar.tsx             # Brand header & viewport switcher
    │   │   └── RichCards/                # Adaptive Alexa / Echo Show modal cards
    │   ├── screens/                      # Main views (TodayScheduleView, HistoryMatrixView, AnalyticsView)
    │   ├── services/                     # Web Audio API procedural DSP (soundFxService) & speechService
    │   └── hooks/                        # React hooks (useAlexaAgent, useMedicines, useHeatmap)
```

## Module Boundaries & Import Rules
- **No Circular Imports:** Backend tools must only import repositories and services; they must not import `server.ts`.
- **Pure Math Audio DSP:** Frontend audio in `soundFxService.ts` must use Web Audio API sine oscillators exclusively; no external audio files are permitted.
- **ACID Invariants:** All database operations in `backend-mcp/src/database/` must execute inside SQLite transactions under WAL mode.
