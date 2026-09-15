---
name: quick-feature
description: Fast brainstorming → plan → execute workflow optimized for the @stndrds/standard monorepo where integration tests are slow (Meili Docker, cross-package builds). Compresses the 3-skill superpowers pipeline (brainstorming + writing-plans + subagent-driven-development) into a 30-45 min workflow without sacrificing correctness. Use when Karl asks for a fast implementation, says "quick", "rapidement", "30 min", or wants to ship a refactor/feature without the full ceremonial pipeline. Skip for chantiers > 50 files or with hard safety requirements (security, billing, migrations).
---

# Quick Feature — Fast Chantier Workflow

<role>
You are an efficiency-optimized implementation orchestrator. You compress the brainstorming → plan → execute pipeline by removing avoidable overhead, while keeping enough quality gates to catch real bugs. Target wall-clock: 30-45 min for a chantier touching ~20-40 files.
</role>

## When to use

- Karl asks for a "quick" / "rapidement" / "30 min" implementation
- Chantier touches ≤ 50 files, ≤ 25 commits
- No hard safety requirements (security, billing, irreversible migrations)
- Tests slow enough that re-running per-task is wasteful (Meili Docker, e2e suites)

**Do NOT use for**: security-critical work, multi-week refactors, anything Karl explicitly says "do it properly with full review".

## The 4-step compressed workflow

```
1. SCOPE (5 min)     →  2 questions max, draft 1-paragraph spec, no doc file
2. PLAN (3 min)      →  6 phases max, inline in conversation, no separate plan file
3. EXEC (25-35 min)  →  1 subagent per phase, pre-build once, integration tests last
4. WRAP (5 min)      →  Final review + commit/PR decision
```

Total ceiling: **~45 min**. If you can't fit it, you picked the wrong workflow — escalate to the full pipeline.

## Step 1 — SCOPE (5 min)

**Goal**: align on intent + approach in 2 questions max, no spec document.

- Ask **one** multi-choice question covering scope (what's in / what's out).
- Ask **one** multi-choice question covering approach (the 2-3 viable architectural choices, with your recommendation).
- Skip the design doc. Capture the agreed scope in **2-3 paragraphs inline** in the conversation. That IS the spec.

If Karl objects or pivots significantly, fall back to the full `brainstorming` skill — quick-feature is for clear-intent chantiers.

## Step 2 — PLAN (3 min)

**Goal**: ≤ 6 phases, each phase = a single subagent dispatch.

Phases are coarse, not fine. Examples for the typical chantier:
- **Foundation** (additive types, helpers, services — no breaking change)
- **Migration** (move consumers to new API)
- **Cleanup** (delete legacy)
- **Breaking** (flip type, remove guards)
- **Polish** (CHANGELOG, final grep, docs)

For each phase: 2-3 bullet points describing what changes and what the success criteria are (file paths + grep invariants).

**NO separate plan file**. The plan lives inline. If you find yourself wanting a plan file → the chantier is too big for quick-feature; escalate.

## Step 3 — EXEC (25-35 min)

**One subagent per phase**. Not per task.

### Subagent prompt structure (≤ 300 lines max)

```
You are implementing Phase X of the "<feature>" chantier.

Working directory: <absolute path>

Context (3-5 sentences): what's already done, what this phase changes.

Tasks to complete in this phase (numbered list, 2-5 items):
1. ...
2. ...
3. ...

For each task:
- Files to modify (absolute paths)
- The minimal change (code snippet)
- Acceptance: tests pass + typecheck passes

Quality discipline:
- Use TDD ONLY for new logic (new services, new functions). For mechanical refactors (signature change + threading param), write code + adapt tests in one pass.
- Run typecheck + relevant unit tests at the end of the phase (NOT after each task).
- Skip integration tests (Meili Docker) — they run once at the end of the chantier.

Commit per task (atomic), conventional commit messages.

Self-review checklist before reporting:
- Acceptance grep invariants pass?
- Typecheck clean?
- Unit tests pass for the package(s) touched?
- One commit per task with descriptive message?
- No scope creep (didn't fix unrelated things)?

Report: status + commits + concerns.
```

### Discipline during exec

- **Pre-build cross-package ONCE** at the start (`pnpm --filter @stndrds/schema build && pnpm --filter @stndrds/runtime build`). Each phase subagent uses the warm dist.
- **Integration tests (Meili Docker)** run ONCE at the end of the chantier. Don't re-run per phase.
- **Reviewer subagents**: skip for mechanical refactor phases. Use for:
  - Phases that add new services/handlers (catches design smells)
  - Breaking-change phases (catches missed call sites)
  - The final phase (always — single dispatch for the whole chantier)
- **If a phase reports DONE_WITH_CONCERNS**: read the concern. If it's a real bug or production risk, dispatch a fix subagent. If it's an observation, note it and proceed.

### Concretely

For a typical 6-phase chantier:
- Phase A (Foundation): impl subagent → typecheck → next
- Phase B (Migration mechanical): impl subagent → typecheck → next (skip review)
- Phase C (New handler): impl subagent → final review subagent → typecheck → next
- Phase D (Cleanup): impl subagent → typecheck → next (skip review)
- Phase E (Breaking): impl subagent → review subagent → typecheck → next
- Phase F (Polish): impl subagent → typecheck → next (skip review)
- Final: ONE comprehensive review subagent for the whole chantier.

That's 7 dispatches, not 30+.

## Step 4 — WRAP (5 min)

- Run integration tests (Meili Docker) ONCE. If they pass, we're good.
- Dispatch the comprehensive final reviewer.
- If green: ask Karl for merge/PR decision via `superpowers:finishing-a-development-branch`.

## Anti-patterns to avoid

- ❌ Dispatching a subagent per task (the original cause of slowness)
- ❌ Writing a separate spec file + plan file (overhead without proportional value for short chantiers)
- ❌ Running the full test suite after every commit (Meili Docker = minutes per run)
- ❌ Pre-building dist/ inside every subagent (Turbo cache helps but cold cache per subagent = waste)
- ❌ Spec review + code quality review for refactors that just thread a param
- ❌ TDD ceremony (write test → see fail → write impl → see pass) for code that's a 5-line signature change
- ❌ Reading subagent reports in full when a skim suffices

## Quality gates you MUST keep

- ✅ Each phase's subagent runs typecheck + relevant unit tests before reporting
- ✅ Acceptance grep invariants verified at the end (the "zero matches in production code" pattern)
- ✅ Final comprehensive code review for the whole chantier
- ✅ Integration tests pass before merge/PR
- ✅ Pre-existing test failures noted and verified as baseline (not caused by chantier)
- ✅ Breaking changes documented (CHANGELOG / .changeset)

## Concrete time budget (per phase)

| Phase type | Subagent target | Review? |
|---|---|---|
| Foundation (additive) | 3-5 min | Skip |
| Mechanical migration | 4-6 min | Skip |
| New handler/service | 5-8 min | Yes (1 review subagent) |
| Breaking change | 6-10 min | Yes (1 review subagent) |
| Cleanup (deletion) | 2-4 min | Skip |
| Polish (changelog) | 2-3 min | Skip |
| Final review | 5-7 min | This IS the review |

Total: ~30-45 min wall-clock for the typical chantier.

## Escape hatch

If at any point you realize the chantier is bigger than expected (touching > 50 files, needing > 25 commits, encountering an architectural decision not in the spec), STOP and switch to the full `superpowers:brainstorming` → `superpowers:writing-plans` → `superpowers:subagent-driven-development` pipeline. Don't try to force quick-feature on a chantier that needs ceremony.

## Worked example — "feat: search adapter unification"

39 files, 21 commits, 6 packages. Full pipeline took ~3h35.

Quick-feature would have been:
- Scope: 1 question (scope A+B+D vs A+B+C+D) + 1 question (Noop adapter strategy) = 5 min
- Plan: 6 phases inline, 3 min
- Exec: 6 phase subagents (each 5-8 min) + 2 review subagents (E + final) = ~35 min wall-clock with overlapping wait
- Wrap: integration tests once + final review + PR = 5 min

**Estimated total: ~45 min** vs 3h35 actual. The 2h45 difference is the avoidable overhead of per-task dispatches and per-task tests.

## Reminder

This skill is a deliberate tradeoff: **speed over ceremony**. The pipeline still produces working, tested, reviewable code. It just skips intermediate quality theater that didn't add value on chantiers with clear intent.
