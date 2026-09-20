# Solo

The single-juror form of `/evaluate`: one subagent, one ranked verdict.
Standalone evaluations use all nine counts. `/land` selects a smaller count
set for bounded, lower-risk diffs using its §4 tier table.

The measured fact still holds: findings come from reading each count on its
own, not from a general look. A solo juror pays for that by **sequence** — it
tries the counts one at a time, closes each before opening the next, and
writes each count's return before moving on, so a later count cannot quietly
absorb an earlier one.

## Brief for the subagent

Give the juror the dossier path (assembled exactly as `SKILL.md` §1), the
selected counts in order, and this:

> Read `CHARGES.md` beside this file in full. Try the target
> under each selected count **in the supplied order**, one at a time, and
> write that count's return — findings or *nothing to charge* — before
> starting the next. A standalone `/evaluate` selects all nine:
> `coherence`, `omission`, `proof`, `performance`, `state-of-the-art`,
> `blast-radius`, `surface`, `dry`, `elegance`.
>
> `proof` is run, not read: execute the targeted suite the change claims and
> require red on the preceding head for a behavior fix. Use the already-green
> CI for broad coverage in quick and standard reviews; run wider suites when
> a concrete finding demands them.
>
> Every finding carries the verdict shape from *What every juror owes*:
> `file:line`, what breaks and under which input or state, the refutation you
> attempted and why it failed, the smallest change that answers it, and a
> rank. Evidence is an executable command or a quoted excerpt. `dry` and
> `elegance` rank `to fix` at the highest.
>
> Return one document: findings ranked `blocking`, `to fix`, `noted`; then
> the frozen target (head SHA or merge-base); then the counts that returned
> nothing to charge, named one by one. Write nothing to the code.

## What the convener does with it

The same deliberation as `SKILL.md` §3, minus the merge of overlaps — one
juror already saw them together. Strike an entry whose evidence is a
paraphrase; keep every singleton; read the rank as given.

A verdict with no `blocking` and no `to fix` is **go**. Anything else goes
back to whoever writes code, entry by entry.
