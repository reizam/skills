---
name: land
description: Use when a loop iteration must take every open pull request to merged — the PR's ledger read before anything else, every head's chain run concurrently by one Workflow, red heads handed to a fixer, green heads judged once at a tier fixed on the first sweep, later rounds judging only the answers and the delta, a go that survives a merge of main, three rounds then Karl, every go enqueued in one batch.
---

# Land

One iteration sweeps **every** open pull request. Run it as `/loop /land`.
The loop is done when `gh pr list --state open` returns only PRs that are
**held**, **with Karl**, or deliberately red.

Three actors, never the same one: the iteration steers and enqueues, a
**fixer** subagent writes code on a branch, a **juror** subagent judges a
head. The one who wrote the fix never decides it is good.

The iteration itself runs no fixer and no juror. It classifies every head
with cheap `gh` reads (§1), then hands the whole work-list to **one**
`Workflow` call (§ Dispatch) that runs every head's chain — fix, or judge →
answer → re-judge — concurrently, and returns one outcome per PR. Wall
clock is the slowest single head, not the sum.

The merge queue groups up to 5 PRs per build — the sweep hands it full
groups, not a drip of singletons.

## The ledger

Every decision this loop takes is a comment on the PR whose first line is a
**stamp**. The stamps are the loop's only memory; a sweep reads them before
it reads anything else, and a judgement that is not stamped did not happen.

| Stamp | Meaning |
|---|---|
| `land: tier <Sight\|Standard\|Full> <sha>` | Tier fixed on the diff of the first sweep. Never re-decided. |
| `land: verdict <n> <sha>` | Round `n` verdict on that head, entries listed below the stamp. |
| `land: fixing <sha>` | A fixer owns the branch; another iteration skips it for 30 minutes. |
| `land: go <sha>` | Judged clean on that head. Enqueue as soon as green. |
| `land: go <sha> — withheld: <risk>` | Clean, but the merge is Karl's. |
| `land: queued <sha>` | Enqueued. Never re-read. |
| `land: held — <risk>` | Karl's ruling. Skipped until the head changes or Karl speaks. |
| `land: with Karl <sha>` | Three rounds spent. Karl merges, holds or closes. |

Before quoting a SHA, `git cat-file -e <sha>` — a fixer once reported one
that did not exist, and a ten-character prefix survived the glance.

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
- **go on this head**, green — enqueue now (§3).
- **go on an older head** — §3 *A go survives*.
- **loud** on a head with no verdict yet — a check has no conclusion. Skip;
  the next sweep will see it. A head already in round 2 or 3 is judged on
  its answers and its delta, which need no CI: it goes to Dispatch loud.
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

Widening an assertion, skipping a test, or a `--no-verify` push is not a
fix; a fixer that returns one gets the branch back with the finding
restated. The push moves the head — the next sweep re-reads it from §1.

## 3. Green: judge once, then batch-enqueue

### Tier — fixed on the first sweep

No `land: tier` stamp yet: read `gh pr view <N> --json additions,deletions,files`,
pick one tier, stamp it. Every later round runs at that tier; the tests a
fixer adds to answer a verdict never promote a PR.

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
more time, in the same chain. CI is not waited for between rounds: a go
enqueues only when the head is green, and a red on a go head is §2 like any
other.

Round 3 is the last. Its verdict still not go → stamp `land: with Karl <sha>`
with the verdict, and put the PR to Karl in §4's batch. The loop stops
touching it.

### A go survives

A `land: go` stamp stands on a **newer** head when every commit since the
go SHA is a merge commit or an empty commit:

```bash
git log --no-merges --format='%h %s' <go sha>..<head>
```

Nothing listed, or only commits whose `git show --stat --format= <h>` prints
nothing → re-stamp `land: go <head>` and enqueue when green. A merge of
`main`, a conflict resolved in a merge commit, a fresh head pushed to dodge
a flake: none of these reopen a verdict.

A real commit listed → one more round (§ Rounds 2 and 3) on
`git diff <go sha>..<head>` only, the previous verdict having no open entry.

### Dispatch — one Workflow, every chain at once

Read [`dispatch.js`](dispatch.js) beside this file and call `Workflow` with
its contents as `script` and this `args`:

```json
{ "skill": "<absolute path of this SKILL.md>",
  "solo": "<absolute path of evaluate/SOLO.md>",
  "heads": [ { "number": 4004, "branch": "fix/…", "head": "<sha>", "tier": "Full",
               "round": 1, "state": "green", "previousVerdict": "<entries + answers>" },
             { "number": 4023, "branch": "…", "head": "<sha>", "tier": "Standard",
               "round": 0, "state": "red", "failure": "<step + log excerpt>" } ] }
```

`round` is the number of `land: verdict` stamps the PR carries; a PR with
three goes to Karl, never to Dispatch. The workflow runs in the background:
wait for its task notification (a long `ScheduleWakeup` fallback, no
polling), then act on its return — `go` → enqueue below, `with-karl` →
§4, `fixed` → the next sweep re-reads the head. Every stamp is written by
the fixer or juror inside the chain, so a chain that dies mid-way leaves
the ledger true up to its last stamp.

### Enqueue every go PR in the same iteration

```bash
gh pr merge <N> --auto
```

Never pass a strategy — the merge queue sets it. Stamp `land: queued <sha>`.
A withheld-path go (§4) is stamped `land: go <sha> — withheld: <risk>` and
waits for Karl instead.

## 4. Karl: one batched message, not one per PR

Withheld paths are listed in `.agents/skills/approving-pull-requests/SKILL.md`
§ Withheld paths (migrations, permissions/visibility/identity, billing,
`.github/**`, CLI and HTTP contracts, narrowed public schemas, a PR with no
issue). A go PR on those paths, and a PR stamped `with Karl`, does not
enqueue.

Once per iteration, put **all** such PRs to Karl in a single message — one
line each: number, title, head, verdict summary, the specific risk or the
open entry (name it, never just the path) — each with three choices:

1. **Merge** — enqueue it, stamp `land: queued <sha>`.
2. **Hold** — stamp `land: held — <risk>`.
3. **Close** — `gh pr close <N> --comment "<why>"`.

Nothing for Karl → nothing to ask.

## Red flags

- a judgement without its stamp, or a sweep that judged before reading the
  latest stamp;
- a tier re-decided on a head that already carries `land: tier`;
- a round-2 juror handed the counts instead of the entries and the delta;
- a fixer or juror run as a lone `Agent` when other heads were waiting — one
  Workflow carries the whole sweep;
- a round-2 chain held for CI it does not need;
- a fourth round;
- a go reopened by a merge of `main`;
- judging a head with a check still pending;
- calling a red run machinery without naming the failed step;
- the fixer and the juror in the same subagent;
- a withheld path enqueued because CI is green and the verdict is clean;
- a go enqueued on a head that is not green;
- a sweep that enqueues one PR when five were go.
