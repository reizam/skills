---
name: brainstorm
description: Use before any creative work — a feature, a component, a refactor, a behaviour change — to run superpowers' brainstorming to its written spec, then try that spec with `/evaluate` before a line of code exists.
---

# Brainstorm

An overlay, not a replacement. `superpowers:brainstorming` owns the design
dialogue and this skill does not restate it: invoke it and follow its checklist
**verbatim**, every item, in order, however simple the work looks. "Too simple
to need a design" is that skill's own named anti-pattern.

What this adds is two rules while it runs, and one gate when it ends.

**Prerequisite** — `superpowers:brainstorming` must be installed. Without it,
say so and stop rather than improvising a design dialogue; the point of the
overlay is that the dialogue is the same every time.

## While it runs

**Settle facts yourself, silently.** Anything the code, the project's agent
instructions, the docs or the git history can answer, you answer — by reading,
not by asking. Every question spent on a fact is a question the person stops
reading carefully. Ask only what genuinely forks the work: two answers that
produce different code.

**Bias to the boring version.** The simplest design that reuses what already
exists beats the clever new abstraction. When two approaches ship the same
outcome, recommend the one that adds less surface. This bias belongs in the
recommendation you present, stated out loud, so it can be argued with.

## When it ends: try the spec

Brainstorming's terminal state is a written, approved spec. Before it hands off
to planning or anyone writes code, put that spec through **`/evaluate`**.

A spec is the cheapest thing in the project to fix and the most expensive to
get wrong: every defect in it is about to be copied into parallel
implementation work, where it will read as intentional. The nine jurors reach a
spec the same way they reach a diff — `omission` hunts the failure mode the
document never names, `proof` refuses acceptance criteria that today's code
already satisfies, `dry` catches a design that rebuilds what the system has,
`elegance` catches moving parts the criteria never exercise.

Apply the verdict to the document:

- **`blocking`** — rewrite the spec and re-run the affected counts. Design work
  does not proceed past a blocking finding.
- **`to fix`** — fold it in now, while changing the spec still costs a
  paragraph.
- **`noted`** — record it in the spec under what was considered and set aside,
  with the reason. A rejected idea that leaves no trace comes back.

Then hand off to planning, and say in one line which counts returned nothing to
charge — the spec's clean bill is part of its record.

## Red flags

- reaching for a design dialogue of your own instead of superpowers';
- asking the person a question the repository answers;
- asking a question whose answers produce the same code;
- letting the spec reach planning with a blocking finding open;
- skipping `/evaluate` because the spec was written carefully;
- treating a `noted` finding as handled by having read it.
