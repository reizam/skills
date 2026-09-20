---
name: pair
description: Use when building a change live with the developer at the keyboard — code first, hand it over, take feedback in conversation, commit each retained step, and run the build, the tests and `/evaluate` once, when the developer gives the go.
---

# Pair

Two people at one screen, building it until it is right. The trade this skill
makes: **code first, hand over, gate once.** Everything below protects one of
those three.

A harness left to itself pays the whole toolchain before every edit: the
reading tour, the plan, the test run, the rebuild. In a pair session that cost
lands on the person waiting. So the developer's hands are the suite while the
loop runs, and the machinery — the build, the typecheck, the tests, the review —
is paid once, at the end, on their go.

## What makes deferring the gate safe

**Checkpoints.** Every retained change is its own commit, so the tree is always
one revert from the last thing the developer approved. When the gate comes back
red, the fault is bisected in seconds and one change is undone on its own.

**The surface in front of both of you.** The developer is trying each change
as it lands, in the running app with hot reload or the REPL or the CLI, not
reading about it. A change they tried and kept has passed the only test the
loop runs.

**A running process that stays running.** The dev server's own compile error
or crash is the surface breaking, not the gate firing early: fix it in the same
turn, before handing over. Anything that forces a restart — a dependency, an
env variable, a schema — is announced as such, done once, and the loop resumes.

## Set up before the first change

- **Start the app and open the thing being changed.** Pair programming about a
  process neither of you is watching is a conversation about imagined output.
- **Start from a clean tree**, on a branch. Checkpoints only work from a known
  baseline.
- **Read the project's agent instructions**, then only the files the first edit
  touches. The reading tour is the habit this skill retires; read what the next
  edit needs, when it needs it.

## The loop

Repeat until the developer says go. One intention per turn.

### 1. Code your recommendation

When the request is clear, edit. When it forks — two readings that produce
different code — pick the boring one, code it, and say in one line which fork
you took and what the other would have been. A revert costs a checkpoint;
a question costs the developer's attention. Ask first only when the fork is
expensive to walk back: a data shape, a public contract, a migration.

The narrowest edit that carries the intention. Reuse what the codebase has.
The test of atomic: if the commit message needs "and", it is two changes —
split it.

When the fork is visual — spacing, hierarchy, layout — two or three labelled
variants in an inline mockup settle it faster than prose or a revert; use the
project's real tokens so the choice transfers.

### 2. Hand over

Say what changed, where to look, and what to try. Then stop and wait. No
typecheck, no test run, no build: the developer is about to run the one test
that matters, and running yours first makes them wait for an answer they were
about to give.

### 3. Take the feedback

The developer's reply is the test result. Green — keep it. Red — adjust in
place, narrowly, and hand over again. "Not that, the other way" — revert the
checkpoint and code the other fork. Each retained step commits before the next
begins.

### 4. Checkpoint

One line, present tense, what changed and for whom: `debounce search input
so typing stops firing requests`. Squash the checkpoints at the end if the
history bothers you — after the gate, never before.

## The gate, once, on the go

When the developer says go, run everything, in this order, and report each
result:

1. The build for the packages touched.
2. Typecheck.
3. The targeted test suite for what changed — not the whole suite.
4. The project's formatter and linter.
5. `/evaluate` on the accumulated diff.

Red gate → `git bisect` or a plain read of the checkpoint list, undo the single
offending change, re-run. Repair a diff you can revert precisely by reverting,
never by patching forward through it.

Then apply the verdict: `blocking` is fixed before anything ships, `to fix` is
one more checkpoint, `noted` is reported to the developer and left to them.
Close by naming what the gate covered and what it did not: the developer's
hands were the acceptance test, and no suite asserts what they saw.

## Signs the loop has drifted

- a plan, a reading tour or a test run standing between the request and the
  edit;
- a question the codebase, the running app or a revert would answer cheaper;
- three tweaks in one checkpoint because they felt related;
- reaching the gate with an uncommitted tree and nothing to bisect.
