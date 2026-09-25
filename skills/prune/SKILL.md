---
name: prune
description: Use when a test suite costs more than it protects — to scout the tests whose time, flakiness or upkeep outweighs what they alone catch, or to cut one such candidate, folding its lone assertion into a surviving test first.
---

# Prune

A test is paid for on every run and repaid only on the day it goes red on a
defect nothing else would have caught. Pruning removes the tests whose cost is
measured and whose protection is shared, borrowed, or absent.

Every deletion is a **trade**: time and noise bought back, coverage given up.
The trade is written down. And a deletion often improves another test — when
the candidate is the lone **witness** of something worth keeping, that
assertion moves into a cheaper surviving test before the candidate goes. That
move is the **fold**, and it is as much the output of this skill as the
deletion.

## Two branches

- **Scouting** — find candidates, measure them, and file or report the best
  few. Follow [`SCOUT.md`](SCOUT.md).
- **Cutting** — take one candidate (an issue, a name, a file) to a merged-ready
  change: probe, fold, delete, measure, ledger. Follow [`CUT.md`](CUT.md).

A run that was handed a candidate cuts. A run that was handed a suite scouts.
Both use the vocabulary below.

## Vocabulary

**Promise** — one behaviour of the code under test, stated as a sentence about
the product or the module: *"a refresh from another client is refused with
`invalid_grant`"*. Never a sentence about the test's mechanics. A test holds
one or more promises; every assertion in it maps to one.

**Witness** — a test witnesses a promise when it goes red as that promise
breaks. A promise with several witnesses is *shared*; with one, that test is
its *lone witness*. Witness is established by the probe, never by reading.

**Probe** — the proof of witness. Break the promise in the **source**, run the
candidate and its neighbourhood, record the *red set* — every test that failed
— and restore the source. Line coverage says a line ran; only a probe says a
test would notice. Suites reduced by coverage lose up to a fifth of the defects
they caught; reduced by red sets, none.

- Start **extreme**: make the function under the promise return a default —
  empty, `null`, zero, the input unchanged. One edit per function, and it maps
  which tests care at all. Then write two or three targeted breaks aimed at the
  promise itself: invert a condition, drop a call, skip a guard.
- Leave **arid** code alone — logging, metrics, buffer sizes, cache capacities,
  messages. A promise that only an arid break reveals is a change-detector, and
  the test pinning it is a mirror.
- A break nobody catches may be **equivalent** — code that still behaves the
  same. Show the behaviour actually changed (a call's output, a returned value)
  before reading the empty red set.
- A **timeout** is its own outcome, recorded as one — never as a red.
- Probe only from a green baseline: run the neighbourhood once untouched first.

When the red set holds another test, the promise is shared. When it holds only
the candidate, the candidate is its lone witness. When it holds nothing on a
real break, the candidate witnesses nothing and its cost is pure loss.

**Cost** — measured, in the unit the suite pays:

- *time* — the test's own duration, and the file's fixed cost (environment,
  imports, setup), which often outweighs every test body in it. Deleting one
  test from a file saves only that test's body; deleting the last test, or the
  last test that needs a heavy environment (a DOM, a database, a browser),
  saves the fixed cost too. Read the phase breakdown your runner reports before
  pricing a candidate.
- *noise* — a flake rate: both outcomes on the same commit, counted on the
  default branch and the merge queue only (a pull request under development
  fails for its own reasons). Every wasted rerun and every red nobody believed
  counts. Judge the rate against its layer — end-to-end suites run noisier than
  unit suites.
- *upkeep* — commits that edited the test without changing the promise it
  pins: a snapshot refreshed, a mock re-wired after a refactor, a bound widened.

A file whose time is mostly environment, imports and setup is an environment
problem, and it goes to whoever owns the test setup — unless the whole file, or
its heavy environment, can go.

A test that has **never failed** is a prior, never a proof: most tests never
fail, and a quiet test can still be the lone witness of the promise that breaks
next year. The probe decides.

**Value** — the promises the candidate alone witnesses, weighted by what a
regression of each would cost. Permissions, tenant isolation, money and data
loss weigh most.

**Kill set** — the union of the red sets across every probe of a cut. After the
cut it holds every break it held before, or the cut is vetoed.

**Ledger** — one row per deleted test: its cost, its promises, the witness each
promise has now — a named surviving test, or *traded* — and the command that
restores it.

## Shapes of low return

Each shape is a place to look, never a verdict: the probe decides.

- **Twin** — a sibling asserts the same promise, often at a cheaper layer: an
  end-to-end spec replaying what an integration test already pins, two unit
  tests over the same branch with different fixtures.
- **Mirror** — asserts the implementation back to itself: a mock called with
  the arguments it was configured to receive, a snapshot of whatever the code
  produced, a constant equal to its own definition. Its probe red set is often
  empty.
- **Borrowed promise** — pins the framework, the library or the type checker:
  that a component renders its prop, that a schema library rejects a wrong
  type, a type-level fact the compiler already enforces.
- **Weather vane** — a ratio or a bound between measured timings on shared
  machines. It goes red on load, not on defects, and each repair widens the
  bound until it asserts nothing.
- **Costly smoke** — "renders without crashing" paying a DOM, a database or a
  browser for a promise a lighter test could hold.
- **Tombstone** — pins code whose feature is gone or whose only caller is the
  test.

Two look like candidates and are not:

- **Lucky** — green by coincidence (a clock second, an ordering, a sleep) while
  its promise is real. A flaky lone witness is repaired, not pruned: the defect
  is in the assertion, and the promise deserves its witness. A flaky test whose
  promises are all shared is cut.
- **Drift guard** — a deliberate duplicate: two implementations of one contract
  checked against each other, a constant restated so a change to it is noticed.
  The duplication is the promise.

## Guardrails

- A repair in flight outranks a deletion. Before cutting, and again before the
  change lands, search open issues and pull requests for the test's name and
  file; a candidate someone is already repairing is left to that repair.
- A test named after a bug or an issue is a regression pin: its promise once
  broke for real. It leaves only when the probe shows another witness, or
  after a fold.
- A lone witness of a permission, isolation, money or data-loss promise is
  folded, never traded.
- The probe edits source, and the source is restored before anything else
  happens. The only lasting changes are to tests, their helpers and their
  configuration.

The evidence behind these rules, with its sources, is in
[`SOURCES.md`](SOURCES.md) — for a human questioning a rule, not for a run.
