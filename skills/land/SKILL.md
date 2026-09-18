---
name: land
description: Use when a loop iteration must take every open pull request to merged — red heads handed to a fixer, green heads tried by one solo juror, the go merged, the dangerous ones put to Karl as merge, hold or close.
---

# Land

One iteration lands one pull request, or moves it one step closer. Run it as
`/loop /land`. The loop is done when `gh pr list --state open` returns only
PRs that are **held** or deliberately red.

Three actors, never the same one: this iteration steers and merges, a
**fixer** subagent writes code on the branch, a **juror** subagent judges the
green head. The one who wrote the fix never decides it is good.

## 1. Pick

```bash
gh pr list --state open --json number,isDraft,headRefName,title,updatedAt,mergeable --jq '.[] | select(.isDraft|not)'
```

Oldest `updatedAt` first. Skip a draft, a PR titled `test(...): red repro`,
and a PR whose latest comment on the current head starts with `land:` and
says `held` or `waiting` less than ten minutes ago.

Pin the head SHA. Every judgement below is about that SHA; a head that moves
voids the iteration and the next one starts over.

## 2. Read the head

```bash
gh pr checks <N>
gh pr view <N> --json mergeable,mergeStateStatus,reviews,comments
```

The head is in exactly one state:

- **loud** — a check has no conclusion yet. Comment `land: waiting — <check>`
  and move to the next PR.
- **red** — a check failed, or the branch conflicts with the base. Go to §3.
- **green** — every check concluded green and no conflict. Go to §4.

Red is triage before it is a verdict. Read the failed step. **Machinery** — an
artifact 403, an action download refused, a port already bound on the runner,
a step in the shared preamble the diff cannot reach — is rerun once the run
has finished (`gh run rerun <id> --failed`), then `waiting`. Anything the diff
can reach is a finding for the fixer.

## 3. Red: dispatch the fixer

One `Agent` call, in a worktree on the branch, with the pinned head, the
failed step's log, and the conflict if any. The fixer's brief:

- reproduce the failure locally before touching a line;
- a behaviour fix is **red-proven** — the covering test seen failing on the
  unchanged branch, passing with the commit; a conflict is resolved by
  reading both sides, never by taking one;
- run the project's own gate (its `CLAUDE.md` or `AGENTS.md` names it) before
  pushing;
- push, and return the new head SHA and one line per change.

The push moves the head: comment `land: waiting — fixed <old>→<new>` and move
on. The next iteration reads the new head from §2.

Widening an assertion, skipping a test, or a `--no-verify` push is not a fix;
a fixer that returns one gets the branch back with the finding restated.

## 4. Green: convene the solo juror

One `Agent` call, the largest model available, running
[`evaluate/SOLO.md`](../evaluate/SOLO.md) on the pinned head. It returns a
ranked verdict: `blocking`, `to fix`, `noted`, and the counts with nothing to
charge.

- Any `blocking` or `to fix` → §3, with the verdict as the fixer's brief. The
  fixer answers every entry or refutes it in writing; a refutation the next
  juror does not accept comes back as `blocking`.
- Only `noted`, or nothing to charge → **go**. Go to §5.

A juror that returns a paraphrase where the verdict shape demands an
executable command or a quoted excerpt has not returned; convene it again.

## 5. Go: the danger gate, then merge

Before merging, read the diff's paths and the verdict's `noted` entries for
**danger** — a change a green CI and a clean verdict do not make safe:

- a migration, a schema or data model change, a backfill;
- permissions, authentication, visibility, tenancy;
- billing, quotas, anything that moves money or credits;
- CI, deploy, and release configuration; a lockfile or a major bump;
- a public contract — an endpoint, a CLI flag, a published export — changed
  or removed;
- a subsystem deleted, or a diff so wide the verdict could not have read it
  all;
- any path the project's own policy names as a human merge.

Danger goes to Karl, one question per PR, with the verdict summary and the
specific risk, and three choices in this order:

1. **Merge** — the risk is accepted.
2. **Hold** — comment `land: held — <risk>`; the PR is skipped until its head
   changes or Karl says otherwise.
3. **Close** — `gh pr close <N> --comment "<why>"`.

The question names the risk, never just the path: "adds a migration that
drops `x` and the down migration is absent", not "touches migrations".

No danger, or Karl said merge:

```bash
gh pr merge <N> --auto
```

The queue sets the strategy. Comment `land: merged <sha>`. Verify on the next
iteration that it landed; a PR reading clean, green, and `autoMergeRequest:
null` ten minutes later is re-enqueued with the same command.

## Red flags

- judging a head with a check still pending;
- calling a red run machinery without naming the failed step;
- merging a head the juror has not seen, or a head that moved since it did;
- the fixer and the juror in the same subagent;
- a danger merged because CI is green and the verdict is clean;
- a held PR with no `land: held` comment saying why;
- two iterations on the same head.
