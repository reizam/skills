---
name: aim
description: Use before handing an objective to an autonomous run — Codex `/goal`, a Claude Code `/loop`, a scheduled automation — to turn a loose intention into a brief with a terminal state that is a command, a verification loop, a journal, and written stopping conditions.
---

# Aim

An autonomous run is decided before it starts. Once it is going, the brief is
the only thing steering it: the model cannot ask, and every ambiguity resolves
itself in whatever direction the next token happens to favour.

The named primary failure mode of long-horizon runs is the vague objective.
Second is letting the agent that did the work decide the work is done. This
skill exists because the brief a person writes unaided almost never carries
enough, and writing it is cheap next to a night spent running against the wrong
target.

Produce the brief. Do not launch the run.

## 0. Decide whether this is loopable at all

A run belongs in a loop when **done is a command**. If no command, script or
exit code can tell done from not-done, the work is exploratory, and an
autonomous run will either declare victory early or grind until the budget dies.

Say so plainly and hand it back to an interactive session. Refusing here is the
most valuable thing this skill does — everything below assumes the gate passed.

Design work, open questions, anything whose answer is a judgement: interactive.
Mechanical work with a gate: loopable.

## 1. Write the terminal state as a command

One command whose exit code decides done. Not a description of doneness — the
command.

**Run it now, before writing the brief.** Record what it prints today. Two
outcomes disqualify the goal on the spot: a command that already passes has no
work in it, and one that cannot pass for a reason unrelated to the task sends
the run hunting a target it can never hit.

When the real objective has no single command, the goal is too big. Split it
until each piece has one.

## 2. Bound the scope

Name what is in — the files, directories or packages the run may change — and
what it must leave alone. An unbounded run will eventually touch the thing you
assumed was obviously off-limits, because nothing told it.

## 3. State the verification loop

The command the run executes **every iteration**, not only at the end. It has to
be cheap enough to run every time; a gate that only fires at the end lets an
error compound across the whole night.

Where the full check is slow, name two: the fast one for every iteration, the
full one before declaring done.

## 4. Separate the maker from the verifier

The agent that wrote the code does not get to grade it. Put verification
somewhere the maker cannot flatter: a command's exit code, or a reviewer given
read-only access and the acceptance criteria — never the maker's own reading of
its own diff.

This is the difference between a loop that ships ten good changes and one that
ships the same subtle defect ten times. Unattended mistakes compound faster
than attended ones.

## 5. Give it a journal

Name a markdown file the run appends to every iteration: what it tried, what
worked, what it ruled out and why. Without it, iteration nine rediscovers what
iteration three already refuted, and the budget goes to re-deriving.

Put the objective at the top of that file. Long runs get their context
compacted mid-flight and drift off the target; a journal that restates the
objective is how a compacted run finds its way back.

## 6. Write all three stopping conditions

A run that only knows how to succeed will spin forever on the case it cannot.

- **Achieved** — the terminal command passes. Say what to leave behind: the
  branch, the summary, the journal entry.
- **Blocked** — define what counts as blocked, concretely: a dependency it
  cannot install, a decision only a person can make, the same failure twice in
  a row with no new information. Then: write it in the journal and stop. Never
  "try something else" without a bound.
- **Budget spent** — summarise progress, commit what is green, stop. Budgets
  steer toward wrap-up rather than killing the process, so the brief has to say
  what wrapping up means here.

## 7. Isolate it

A branch or a worktree, never the default branch. Say where output is logged,
and set the diff size past which a person signs off before anything merges.

## Then write the brief

Assemble exactly this, filled in, as one block the user can paste:

```
OBJECTIVE
  <one sentence, the outcome — not the method>

DONE WHEN
  <exact command>   # exit 0 means done
  Today it reports: <what you observed in step 1>

IN SCOPE
  <paths the run may change>
OUT OF SCOPE
  <paths and concerns it must not touch>

EVERY ITERATION
  1. <fast verification command>
  2. Append to <journal path>: what was tried, the result, what is ruled out.

VERIFIED BY
  <the command or the read-only reviewer that decides — not self-assessment>

STOP WHEN
  achieved — <terminal command passes; what to leave behind>
  blocked  — <what counts as blocked; write it to the journal and stop>
  budget   — <what to commit and summarise before stopping>

WORK ON
  branch <name>, logs at <path>, human sign-off past <N> changed lines
```

Then, in one line each, say how to launch it: Codex `/goal` with the block as
its prompt, a Claude Code `/loop` with the block as its prompt, or a scheduled
automation carrying the same text. The brief is harness-agnostic on purpose —
only the launch line differs.

Close by naming the one thing most likely to send this run wrong, so the person
launching it knows what to check first.

## Red flags

- a terminal state phrased as a description rather than a command;
- a terminal command nobody ran before the brief was written;
- verification the maker performs on its own work;
- a run with no journal, rediscovering each night what it learned last night;
- "stop when done" as the only stopping condition;
- a goal accepted for exploratory work because the request sounded confident.
