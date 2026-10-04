---
name: harden
description: Use when code carries a promise no test goes red on — an unwitnessed gap a `prune` audit named, a mutant that survived, a path a defect escaped through — to give it the one witness it lacks, proved red on the break before it is kept.
---

# Harden

`prune` takes away what protects nothing; `harden` adds what is missing. A
**gap** is a break in the source that no test goes red on — code the suite
runs without noticing, or never runs at all. Each gap ends with a **witness**
proved red on that break, or with a written reason it needs none.

The vocabulary — *promise*, *witness*, *probe*, *red set*, the probe outcomes,
*arid*, *echo* — is defined in [`prune/SKILL.md`](../prune/SKILL.md). Read its
*Vocabulary* and *Shapes of low return* sections before step 1.

## 1. Gather and rank the gaps

Take the gaps from whatever names them: the *unwitnessed code* section of a
`prune` audit report, a mutation tool's surviving mutants, an escaped defect's
path, or a module the request names — probed then with the extreme break per
function. Drop the arid ones and the equivalent ones, each with its
demonstration.

Rank what is left by the weight of the promise the code carries — permissions,
tenant isolation, money and data loss first — then by how many callers reach
it.

*Done when:* every gap is ranked or dropped with its reason, and the run
works the ranking from the top.

## 2. State the promise from outside the code

Write the promise the gap breaks as one sentence about the product or the
module, taken from what the code is *for*: the specification, the docs, the
callers, the issue that asked for it, the type's contract. The implementation
says what the code does; only these say what it should do.

When nothing outside the code states a promise, the gap is a question for the
maintainer: record it under *open questions* and move to the next gap.

*Done when:* the gap carries one promise sentence and the source it came from,
or sits under *open questions*.

## 3. Choose where the witness lives

Search for a test that already reaches the code. An assertion added to that
test is the first choice; a new case in the file that covers the behaviour
comes second; a new file comes last. Drive the public seam at the cheapest
layer that reaches the gap, and fake only the edges the project does not own —
network, clock, third-party services.

*Done when:* the witness has a named home, and any new file has a reason no
existing file could take it.

## 4. Write it red first

1. Apply the gap's break to the source.
2. Write the assertion. The expected value is a literal worked out from the
   promise — never a value computed by the code under test or pasted from a
   run of it, which makes an echo.
3. Run it: red on the break. A green here means the assertion missed the
   promise; rewrite it.
4. Restore the source and run it again: green.

A red on the restored source means the code breaks its promise today. That is
a **defect found**: stop on this gap, keep the source as it is, and report the
promise, the failing assertion and its output. The expected value stays what
the promise says.

*Done when:* the witness went red on the break and green on the restored
source, or the gap is reported as a defect found.

## 5. Prove it holds

- Re-apply every break recorded for the gap — the extreme one and the targeted
  ones of `prune`'s *Probe* — and see the witness red on each.
- Run the witness repeatedly with the runner's repeat or retry flag, at least
  twenty times: one failure makes it a **lucky** test, and step 4 starts over.
- Record its duration. A witness that pays for a heavy environment its promise
  does not need moves to a lighter layer.

*Done when:* the witness is red on every break, green on every repeat, and
its cost is a recorded number.

## 6. Report

One row per gap:

| Gap | Promise | Ruling | Witness | Proof |
|---|---|---|---|---|
| `refund()` returns early | a refund never exceeds the captured amount | **witnessed** | `refund.test › caps at captured` | break → red, restored → green, 20/20 |

Rulings: **witnessed**, **defect found**, **equivalent** (with its
demonstration), **arid**, **open question**, **traded** — a gap left
deliberately, with the reason a maintainer gave.

Run the affected suites in full and the type checker over the packages
touched before handing over.

*Done when:* every gap from step 1 has a row, every *witnessed* row names its
test and its proof, the suites pass and the types check.

## Guardrails

- The probe edits source, and the source is restored before anything else
  happens. The lasting changes are tests, their helpers and their fixtures.
- A gap behind a permission, isolation, money or data-loss promise is
  witnessed or raised as an open question; it is never traded.

The evidence behind these rules is in [`prune/SOURCES.md`](../prune/SOURCES.md).
