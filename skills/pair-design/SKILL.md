---
name: pair-design
description: Use when working through the look and feel of a surface live with the developer — spacing, hierarchy, colour, density, states, motion — making many small targeted changes in conversation and running the whole verification gate once at the end.
---

# Pair Design

Two people at one screen, changing it until it is right. The trade this skill
makes: **propose cheaply, apply narrowly, verify once.** Everything below
protects one of those three.

Design decisions are settled by looking, not by reasoning about looking. So the
loop stays visual and stays fast, and the machinery that would slow it down —
the suite, the typecheck, the review — is batched to the end rather than paid
per tweak.

## What makes deferring the gate safe

**Presentation only.** Spacing, hierarchy, colour, type, density, states,
motion, copy. These cannot break a test that was passing, which is the entire
reason the gate can wait.

The moment a change alters behaviour — a condition, a data shape, a request, a
state machine, an error path — it has left this skill. Stop, say so, and pick
it up under whichever skill owns building. A behaviour change smuggled into a
design pass is the one thing that turns the deferred gate into a debugging
session.

## Set up before the first change

- **Put the surface in front of both of you.** Run the app and open the actual
  screen. A design conversation about code neither of you is looking at is a
  conversation about imagined pixels.
- **Start from a clean tree.** Every retained change becomes its own commit, and
  that only works from a known baseline.
- **Read the project's design conventions first** — its tokens, its component
  library, the skills its instructions name for UI work. Proposals that ignore
  the system get rejected for reasons nobody enjoys repeating.

## The loop

Repeat until the developer says stop. One intention per turn.

### 1. Ask

Ask more than feels necessary. This skill is a conversation, and a question is
cheaper than an edit that gets reverted.

One question at a time, concrete, with your recommendation first and the reason
it is your recommendation. Ask about what genuinely forks the design — a
decision where two answers produce different screens. Everything the running
app, the tokens or the component source can answer, answer yourself in silence.

When the developer's answer is "I don't know, show me" — that is the expected
answer, and step 2 is the reply.

### 2. Show two or three, never one

Render the options as a small inline widget beside your reply — the visualize
tool where the harness has it, otherwise the smallest standalone HTML you can
put in front of them. Isolate the component: the widget shows the thing being
decided, not the whole page.

- **Two or three variants, labelled**, so the answer can be "B".
- **Use the project's real values** — its tokens, its font stack, its radii. A
  mockup in generic styling decides nothing, because the choice will not
  transfer.
- **Keep it cheap.** A mockup that takes longer than the edit has lost its
  purpose. Small, disposable, roughly right.

Show the current state as one of the variants whenever the change is a
refinement rather than a new element. Half of design decisions are "is this
actually better", and that question needs the before in the frame.

### 3. Apply one atomic change

One intention, the narrowest edit that carries it. The test of atomic: if the
commit message needs "and", it is two changes — split it.

### 4. Commit it immediately

One line, present tense, what changed and for whom: `tighten card padding to
12px for denser lists`. No test run, no typecheck, no review.

These commits are the safety net the deferred gate depends on. When the gate
comes back red at the end, the fault is bisected in seconds and a single change
is undone on its own. Squash them at the end if the history bothers you — after
the gate, never before.

## The gate, once, at the end

When the developer is done looking, run everything, in this order, and report
each result:

1. Typecheck the packages touched.
2. The targeted test suite for what changed — not the whole suite.
3. The project's formatter and linter.
4. `/evaluate` on the accumulated diff.

Red gate → `git bisect` or a plain read of the commit list, undo the single
offending change, re-run. Do not repair forward through a diff you can revert
precisely.

Report what the gate covered and what it did not: a design pass changes what
people see, and no suite in the project asserts that it looks right. The
developer's eye was the acceptance test, and saying so keeps the deferred gate
honest rather than mistaken for full coverage.

## Red flags

- describing a design option in prose when a widget would settle it;
- offering exactly one option, which is a decision wearing a question's clothes;
- a mockup in generic styling that the project's tokens will contradict;
- bundling three tweaks into one commit because they felt related;
- letting a behaviour change ride along in a design pass;
- running the suite between tweaks, which spends the speed the skill exists for;
- reaching the gate with an uncommitted working tree and nothing to bisect.
