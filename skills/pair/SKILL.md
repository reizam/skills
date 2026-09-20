---
name: pair
description: Use when pairing live with the developer at the keyboard — each edit tried in the running app as it lands, the build and `/evaluate` run once on their go.
---

# Pair

Two people at one screen, building it until it is right. The trade this skill
makes: **code first, hand over, gate once.**

A harness left to itself pays the whole toolchain before every edit, and in a
pair session that cost lands on the person waiting. So **the hand-over is the
test** while the loop runs, and the toolchain is paid once, on their go.

## What makes deferring the gate safe

**Checkpoints.** A checkpoint is a git commit, not the harness's own rewind.
Every retained change is one, so the tree is always one revert from the last
thing the developer approved.

**An observation, not an assent.** Each hand-over names what the developer
should see, and their reply is the result only when it carries that
observation. A change with nothing to observe — a cron, an error path, a
library without an executable — runs its targeted test before the hand-over
instead.

**A running process that stays running.** The dev server's own compile error
or crash is the surface breaking, not the gate firing early: fix it in the same
turn. Anything that forces a restart is done once, with its undo in hand: a
schema change ships its down migration and the two travel together; a
dependency reverts with a reinstall; an env variable goes in the example file,
its value stays out of the tree, and the hand-over names it so the developer
can remove it.

## Set up before the first change

- **Start the app and open the thing being changed.** Pairing on a process
  neither of you is watching is a conversation about imagined output.
- **Start from a clean tree, on a feature branch off the default branch.**
- **Read the project's agent instructions**, then only the files the first
  edit touches.

## The loop

Repeat until the developer says go. One intention per turn.

### 1. Code your recommendation

When the request is clear, edit. When it forks — two readings that produce
different code — pick the boring one, code it, and say in one line which fork
you took and what the other would have been. Discarding an untried edit costs
nothing; a question costs the developer's attention. Ask first only when the
fork is expensive to walk back: a data shape, a public contract, a migration,
a permission or authentication check.

The narrowest edit that carries the intention. If the commit message needs
"and", it is two changes — split it.

### 2. Hand over

Say what changed, where to look, and what they should see. Then stop and wait:
the hand-over is the test, and running yours first makes them wait for an
answer they were about to give.

### 3. Take the feedback

- **Green** — commit before the next step: stage only the files this turn
  touched, one line in the project's commit convention, what changed and for
  whom: `fix(search): debounce input so typing stops firing requests`.
- **Red** — adjust in place, narrowly, and hand over again.
- **"Not that, the other way"** — the rejected edit is not committed yet:
  `git checkout -- <the files this turn touched>`, then code the other fork.
- **No observation in the reply** — not tried yet: repeat what to try.

## The gate, once, on the go

Run the typecheck, the formatter and the linter first, then the build and the
targeted tests for what changed, together where nothing depends on another;
report each result. Then `/evaluate` on the diff that passed.

Red gate → find the offending checkpoint, by a plain read of the list or
`git bisect` followed by `git bisect reset`, then repair by cause. A test that
asserted the old behaviour of a change the developer kept is updated in its
own checkpoint. A change nobody wanted is undone with `git revert <sha>`, and
its intention recoded fresh if still wanted. The gate runs again on the new
head.

Apply the verdict with `/evaluate`'s ranks: `blocking` and `to fix` are one
more checkpoint each and the gate runs again; `noted` is reported and left to
the developer. Squash the checkpoints only if the branch has not been pushed.
Close by naming what the gate covered and each checkpoint no test reaches,
then hand the branch to `/land` or a pull request.
