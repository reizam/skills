# Solo

The single-juror form of `/evaluate`: one subagent, all nine counts, one
ranked verdict. Convened by a loop that cannot afford nine agents per head —
`/land` — or when the target is small enough that one reading covers it.

The measured fact still holds: findings come from reading each count on its
own, not from a general look. A solo juror pays for that by **sequence** — it
tries the counts one at a time, closes each before opening the next, and
writes each count's return before moving on, so a later count cannot quietly
absorb an earlier one.

## Brief for the subagent

Give the juror the dossier path (assembled exactly as `SKILL.md` §1) and this:

> Read `CHARGES.md` beside this file in full. Then try the target under each
> count **in this order**, one at a time, and write that count's return —
> findings or *nothing to charge* — before starting the next:
>
> `coherence`, `omission`, `proof`, `performance`, `state-of-the-art`,
> `blast-radius`, `surface`, `dry`, `elegance`.
>
> `proof` is run, not read: execute the suite the change claims, revert the
> change, and require red.
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
