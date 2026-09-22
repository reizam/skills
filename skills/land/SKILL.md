---
name: land
description: Use when a loop iteration must take every open pull request to merged — the PR's ledger read before anything else, every head's chain run concurrently by one Workflow, red heads handed to a fixer, green heads judged once at a tier fixed on the first sweep, later rounds judging only the answers and the delta, a go with a screen demonstrated on video five heads per stack and announced on Slack, three rounds then Karl, every go enqueued in one batch.
---

# Land

One iteration sweeps **every** open pull request. Run it as `/loop /land`.
The loop is done when `gh pr list --state open` returns only PRs that are
**held**, **with Karl**, or deliberately red.

Four actors, never the same one: the iteration steers and enqueues, a
**fixer** subagent writes code on a branch, a **juror** subagent judges a
head, a **demonstrator** subagent performs what a batch of go heads promises
on the running stack, on video. The one who wrote the fix never decides it
is good.

The iteration classifies every head with cheap `gh` reads (§1) and hands
the whole work-list to **one** `Workflow` call (§ Dispatch), where every
head's chain — fix, or judge → answer → re-judge → demo — runs concurrently
and returns one outcome per PR. Fixers, jurors and demonstrators live inside
that workflow; wall clock is the slowest head, not the sum.

The merge queue groups up to 5 PRs per build — the sweep hands it full
groups, not a drip of singletons.

## The ledger

Every decision this loop takes is a comment on the PR whose first line is a
**stamp**. The stamps are the loop's whole memory: a sweep reads them first,
and a judgement exists once it is stamped.

| Stamp | Meaning |
|---|---|
| `land: tier <Sight\|Standard\|Full> <sha>` | Tier fixed on the diff of the first sweep, kept through every round. |
| `land: verdict <n> <sha>` | Round `n` verdict on that head, entries listed below the stamp. |
| `land: fixing <sha>` | A fixer owns the branch; another iteration skips it for 30 minutes. |
| `land: go <sha>` | Judged clean on that head. Enqueue once green — after the demo, when the diff has a screen. |
| `land: demo <sha>` | The gesture works on the batch stack; video attached, feature announced. Enqueue once green. |
| `land: demo failed <sha>` | The gesture fails; video and spec attached. A verdict entry for the fixer. |
| `land: demo skipped — <why>` | The stack could not serve the gesture (down, or needs a model). |
| `land: go <sha> — withheld: <risk>` | Clean, but the merge is Karl's. |
| `land: queued <sha>` | Enqueued. Final. |
| `land: held — <risk>` | Karl's ruling. Skipped until the head changes or Karl speaks. |
| `land: with Karl <sha>` | Three rounds spent. Karl merges, holds or closes. |

`git cat-file -e <sha>` before quoting one — a fixer once reported a SHA
that did not exist, and its ten-character prefix survived the glance.

## 1. Sweep

```bash
gh pr list --state open --json number,isDraft,headRefName,title,mergeable --jq '.[] | select(.isDraft|not)'
```

Skip drafts and PRs titled `test(...): red repro`. For each remaining PR pin
the head SHA, read the latest stamp, then the state:

```bash
gh pr view <N> --json headRefOid,mergeable,mergeStateStatus,autoMergeRequest,comments --jq '{head:.headRefOid, m:.mergeable, s:.mergeStateStatus, auto:(.autoMergeRequest!=null), stamp:[.comments[].body | select(startswith("land:"))] | last}'
gh pr checks <N>
```

Route on the stamp first, the head second:

- **already queued** (`autoMergeRequest` set) — nothing to do.
- **queued but gone** — `land: queued` on this head, `CLEAN`, all green,
  `autoMergeRequest: null`, ten minutes after enqueue: the queue ejected it
  on machinery. `gh pr merge <N> --auto` again. No re-review.
- **held** or **with Karl** on this head — skip.
- **fixing** less than 30 minutes old — another iteration owns it; skip.
- **go on this head**, green — enqueue now (§3) when the diff has no
  screen, or when `land: demo` is stamped on the same head; a go with a
  screen and no demo goes to Dispatch as `state: "demo"`.
- **go on an older head** — §3 *A go survives*.
- **demo failed** on this head — a verdict entry: goes to Dispatch as round
  `n+1`, the demo stamp as `previousVerdict`.
- **loud** — a check has no conclusion. A head with no verdict yet waits
  for the next sweep. A head in round 2 or 3 goes to Dispatch loud: its
  answers and its delta are judged without CI.
- **red** — a check failed, or the branch conflicts. Triage (§2); what the
  diff can reach goes to Dispatch as `state: "red"` with the failed step.
- **green**, no go — fix the tier (§3); goes to Dispatch as `state: "green"`
  with its round count and, from round 2, the previous verdict and answers.

## 2. Red: triage, then one fixer per head

Read the failed step before blaming the diff. **Machinery** — an artifact
403, an action download refused, a port already bound on the runner, a step
in the shared preamble the diff cannot reach, a known flake filed as an issue
— is rerun once the run has finished (`gh run rerun <id> --failed`), then
skipped. Anything the diff can reach is a finding for a fixer.

A fixer gets a worktree on the branch, the pinned head, the failed step's
log, and the conflict if any. It stamps `land: fixing <sha>` before touching
a line. Its brief:

- reproduce the failure locally before touching a line;
- a behaviour fix is **red-proven** — the covering test seen failing on the
  unchanged branch, passing with the commit; a conflict is resolved by
  reading both sides, never by taking one, in a **merge commit**;
- run the project's own gate (its `CLAUDE.md` or `AGENTS.md` names it)
  before pushing;
- push, and return the new head SHA and one line per change.

A fix keeps every assertion and every test as strict as it found them and
pushes through the hooks; a fixer that widened, skipped or `--no-verify`d
gets the branch back with the finding restated. The push moves the head —
the next sweep re-reads it from §1.

## 3. Green: judge once, then batch-enqueue

### Tier — fixed on the first sweep

No `land: tier` stamp yet: read `gh pr view <N> --json additions,deletions,files`,
pick one tier, stamp it. The PR keeps that tier through every round, whatever
tests the fixers add.

| Tier | Bound | Round 1 |
|---|---|---|
| **Sight** | Changesets, lockfiles, locales, test-only diffs; or ≤50 changed lines and no withheld path | No juror. Green CI is the evidence — stamp `land: go`. |
| **Standard** | ≤500 changed lines, ≤12 files, and none of the Full triggers | One juror, counts `coherence`, `omission`, `proof` |
| **Full** | >500 lines or >12 files; or the diff touches concurrency, shared state, or external input | One juror, all nine counts in [`evaluate/SOLO.md`](../evaluate/SOLO.md) |

A trigger is something the diff **does**, read from its files — a line count
that would fit Standard fits Standard.

### Round 1

One independent juror per head, run as [`evaluate/SOLO.md`](../evaluate/SOLO.md)
with the tier's counts on the pinned SHA. It returns `blocking`, `to fix`,
`noted`, and which counts found nothing, and stamps `land: verdict 1 <sha>`
with the entries.

No `blocking`, no `to fix` → **go**. Otherwise the verdict is the fixer's
brief, in the same chain: the fixer answers every entry or refutes it in
writing, and round 2 follows on its push.

### Rounds 2 and 3 — the answers and the delta, nothing else

A round-2 or round-3 juror is convened on **two things only**: the previous
verdict's entries, each with the fixer's answer, and
`git diff <judged sha>..<head>`. Its brief replaces the counts:

> For each entry of the previous verdict, return **closed** (the answer
> holds — quote the test or the excerpt that proves it) or **open** (say
> what is still missing). Then read the delta alone and return any
> `blocking` it introduces. Return nothing else: a `to fix` or `noted` on
> the delta is out of scope, and the rest of the PR has been judged.

Stamp `land: verdict <n> <sha>`. Every entry **closed** and no `blocking` on
the delta → **go**. An **open** entry or a `blocking` → the fixer again, one
more time, in the same chain. Rounds follow each other without waiting for
CI; a go enqueues once the head is green, and a red on a go head is §2 like
any other.

Round 3 is the last. Its verdict still short of go → stamp `land: with Karl
<sha>` with the verdict and put the PR to Karl in §4's batch; it leaves the
loop until Karl speaks.

### A go survives

A `land: go` stamp stands on a **newer** head when every commit since the
go SHA is a merge commit or an empty commit:

```bash
git log --no-merges --format='%h %s' <go sha>..<head>
```

Nothing listed, or only commits whose `git show --stat --format= <h>` prints
nothing → re-stamp `land: go <head>` and enqueue when green. The verdict
stands through a merge of `main`, a conflict resolved in a merge commit, and
a fresh head pushed to dodge a flake.

A real commit listed → one more round (§ Rounds 2 and 3) on
`git diff <go sha>..<head>` only, the previous verdict having no open entry.

### Demo — the last round, five heads on one stack

A **screen** is a diff that changes what a person sees: `packages/ui`,
`packages/blocks`, `packages/react` sources, `apps/sandbox/web` sources. A
head without one has nothing to demonstrate and enqueues on its go. Chat,
architect and every model-backed surface are `land: demo skipped — needs a
model` — the stack carries a placeholder gateway key — and enqueue on CI.

Go heads with a screen wait in a batch; the demonstrator takes **five**, or
whatever is left when every other chain has finished, and works one batch
at a time while fixers and jurors run beside it:

1. In the demo worktree (`.worktrees/land-demo`, its slot fixed by its
   path), a throwaway branch from `origin/main` with the batch merged in,
   never pushed. A head that conflicts with the batch leaves it for the
   next one, stamped nothing — the queue would have found the same.
2. `pnpm sandbox:e2e:up && pnpm sandbox:e2e:ready` once per sweep; then per
   batch, build `@sandbox/web^...`, restart the `sandbox-api` container on
   the batch's dist and the web dev server (`rm -rf .next` first — Turbopack
   keeps a failed resolution). A migration in the batch means
   `sandbox:e2e:reset` first.
3. For each head, the **gesture** written from the title and the issue
   before the diff is read: route, steps, end state. One Playwright spec per
   head under `apps/sandbox/web/e2e/qa/` through `playwright.qa.config.ts`
   (video on), the five in parallel, each asserting its end state.
4. A gesture that fails is replayed **alone** — the head merged with `main`
   only. Fails again → `land: demo failed <sha>`, the video, the spec,
   expected against observed; the fixer takes it as a verdict entry in the
   same run. Passes alone → an interaction inside the batch: both heads
   stay out of the queue, `with Karl`, the pair named.
5. A gesture that passes → `land: demo <sha>` with the video (`gh pr comment
   --attach`), then the **announcement** in `#standards-logs`:

   > 🚀 **Nouvelle feature qui arrive** — <what a person can now do, one sentence, in their words>
   > <where to find it: the screen and the gesture, one line>
   > <the video>

   The sentence names the benefit, never the mechanism. It goes through the
   Slack **connector** of the session — search the tools for `slack` and use
   the one that posts to a channel. The video rides as a file when that tool
   takes one; otherwise the announcement carries the URL of the `land: demo`
   comment, where GitHub already plays it. No Slack tool in the session is
   one line in the report; the stamp stands. `#standards-repository` is the
   curator's channel, which would read an announcement as a request.

A stack that stays down ends the demos of the sweep: every batched head
returns `demo-skipped — stack`, enqueues nothing, and two sweeps in a row
put it to Karl. The judged-alone rule and the machinery rule of §2 hold: a
refused port or a container gone is a rerun, never a `failed`.

### Dispatch — one Workflow, every chain at once

Read [`dispatch.js`](dispatch.js) beside this file and call `Workflow` with
its contents as `script` and this `args`:

```json
{ "skill": "<absolute path of this SKILL.md>",
  "solo": "<absolute path of evaluate/SOLO.md>",
  "stack": "<absolute path of the demo worktree, .worktrees/land-demo>",
  "heads": [ { "number": 4004, "branch": "fix/…", "head": "<sha>", "tier": "Full",
               "round": 1, "state": "green", "screen": true,
               "judged": "<sha the last verdict judged>", "previousVerdict": "<entries + answers>" },
             { "number": 4023, "branch": "…", "head": "<sha>", "tier": "Standard",
               "round": 0, "state": "red", "screen": false, "failure": "<step + log excerpt>" },
             { "number": 4291, "branch": "…", "head": "<sha>", "tier": "Standard",
               "round": 1, "state": "demo", "screen": true } ] }
```

`round` is the number of `land: verdict` and `land: demo failed` stamps the
PR carries, and `judged` the SHA the last one judged — the round-2 delta
starts there; a PR with three goes to Karl, never to Dispatch. `screen` says
whether the diff has one (§ Demo). The workflow runs in the background:
wait for its task notification (a long `ScheduleWakeup` fallback, no
polling), then act on its return — `go` → enqueue below, `with-karl` →
§4, `fixed` → the next sweep re-reads the head, `demo-skipped` → enqueue
when the reason is a model, wait when it is the stack. Every stamp is written by
the fixer or juror inside the chain, so a chain that dies mid-way leaves
the ledger true up to its last stamp.

### Enqueue every go PR in the same iteration

A go with a screen enqueues on `land: demo`; without one, on `land: go`.

```bash
gh pr merge <N> --auto
```

The merge queue sets the strategy, so the command takes none. Stamp
`land: queued <sha>`. A withheld-path go (§4) is stamped `land: go <sha> —
withheld: <risk>` and waits for Karl instead.

## 4. Karl: one batched message, not one per PR

Withheld paths are listed in `.agents/skills/approving-pull-requests/SKILL.md`
§ Withheld paths (migrations, permissions/visibility/identity, billing,
`.github/**`, CLI and HTTP contracts, narrowed public schemas, a PR with no
issue). A go PR on those paths, and a PR stamped `with Karl`, waits for
Karl.

Once per iteration, put **all** such PRs to Karl in a single message — one
line each: number, title, head, verdict summary, the specific risk or the
open entry (name it, never just the path) — each with three choices:

1. **Merge** — enqueue it, stamp `land: queued <sha>`.
2. **Hold** — stamp `land: held — <risk>`.
3. **Close** — `gh pr close <N> --comment "<why>"`.

Nothing for Karl → the iteration ends without a message.

## Red flags

- a judgement without its stamp, or a sweep that judged before reading the
  latest stamp;
- a tier re-decided, a fourth round, a verdict reopened by a merge of `main`;
- a round-2 juror handed the counts instead of the entries and the delta;
- a fixer or juror run as a lone `Agent` while other heads waited;
- a round-1 head judged with a check still pending;
- machinery called without the failed step named;
- the fixer and the juror in one subagent;
- a withheld path or a loud head enqueued, or a screen enqueued without
  its demo;
- a gesture written from the diff, or a failed gesture stamped without its
  solo replay;
- the demo branch pushed, or two demo stacks at once;
- one PR enqueued when five were go.
