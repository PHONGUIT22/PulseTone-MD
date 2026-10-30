# Implementation Tasks: PulseTone-95 GhostLine

- [x] **TASK-1: Repository Re-initialization & Metadata Update**
  - [x] 1.1 Wipe `.git` directory and re-initialize git repository on branch `main`.
  - [x] 1.2 Update root `package.json` package name to `pulsetone-95-ghostline`.
  - [x] 1.3 Ensure `.gitignore` explicitly retains and tracks `/.kiro/`.

- [x] **TASK-2: Spec-Driven Governance & Kiro Artifacts Initialization**
  - [x] 2.1 Author EARS requirements document (`/.kiro/specs/dtmf-pocsag-resurrection/requirements.md`).
  - [x] 2.2 Author system architecture and DSP design document (`/.kiro/specs/dtmf-pocsag-resurrection/design.md`).
  - [x] 2.3 Author implementation task manifest (`/.kiro/specs/dtmf-pocsag-resurrection/tasks.md`).
  - [x] 2.4 Author steering instructions: `product.md`, `tech.md`, `clinical-and-ui-guardrails.md`.
  - [x] 2.5 Author Kiro Agent Hooks: `clinical-pbt-guard.json`, `mcp-schema-sync.json`.
  - [x] 2.6 Author 3-agent Kiro Crew configuration: `kiro-crew.json`.

- [x] **TASK-3: Property-Based Testing (PBT) Suite in `backend-mcp`**
  - [x] 3.1 Install `fast-check` in `backend-mcp`.
  - [x] 3.2 Implement `backend-mcp/tests/kiroweenPbt.test.ts` verifying:
    - [x] Property 1: ITU-T Q.23 frequency encoding/decoding determinism and noise boundary rejection ($\pm 1.5\%$).
    - [x] Property 2: 2023 AGS Beers Criteria geriatric safety invariant across randomized casing, whitespace, and drug combinations.
    - [x] Property 3: Autonomous Family Wallet $50.00 spending cap boundary invariant.
  - [x] 3.3 Validate all 100+ tests pass cleanly without regression.

- [x] **TASK-4: Web Audio 1995 DSP & UI Resurrection**
  - [x] 4.1 Extend `frontend/src/services/soundFxService.ts` with `playDtmfTone()` and `playPagerAlert()` using Web Audio API synthesis.
  - [x] 4.2 Build `frontend/src/components/GhostLine1995Bar.tsx` strictly respecting PulseTone-95: GhostLine's color palette, typography, and accessibility standards.
  - [x] 4.3 Integrate `GhostLine1995Bar` into `frontend/src/app/page.tsx` and update brand titles in `TopNavBar.tsx`.

- [x] **TASK-5: Kiroween 2026 Documentation & Submission Readiness**
  - [x] 5.1 Rewrite `README.md` addressing Track: Resurrection and all 8 judging criteria.
  - [x] 5.2 Rewrite `DEMO_SCRIPT_3MIN.md` featuring Eleanor Vance & Sarah Connor.
  - [x] 5.3 Batch verification and initial clean git commit.

- [x] **TASK-6: Official Kiro IDE & CLI Schema Specification Upgrade**
  - [x] 6.1 Register local MCP server in `.kiro/settings/mcp.json`.
  - [x] 6.2 Prepend official Kiro YAML frontmatter to `.kiro/steering/` and author `.kiro/steering/structure.md`.
  - [x] 6.3 Update `.kiro/hooks/` with native `.kiro.hook` format and exact file paths.
  - [x] 6.4 Upgrade `.kiro/agents/kiro-crew.json` with official resources and 7 real MCP tool bindings.
