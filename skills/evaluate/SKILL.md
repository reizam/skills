---
name: evaluate
description: Use when a pull request, an unpushed branch, or a written spec must be tried before it is trusted — seven sealed jurors instructed in parallel, one ranked verdict, nothing written to the code.
---

# Evaluate

The work is the accused. Seven jurors each instruct one count, in isolation, and
the court returns a single ranked verdict. Nothing is committed, no issue is
filed, no line is fixed: the tribunal judges and reports.

Measured across four review tools on 617 findings, **93.4% were raised by
exactly one reviewer** and almost none by three. Coverage comes from
cloistering the counts, not from more eyes on the same one. Two rules follow
and they govern everything below: a juror reports its own count and stays
silent on the rest, and a finding raised by one juror alone stands on its own
evidence.

## 1. Instruct the dossier

Freeze one target and build the dossier every juror will read. The three
targets differ only in how the dossier is assembled:

- **A pull request** — `gh pr view <N>` for the description and bot comments,
  `gh pr diff <N>`, and the head SHA. Record the head SHA: a new head voids the
  trial.
- **The current branch** — the merge-base against the default branch, `git diff`
  against it, and the commit list.
- **A spec or plan** — the document, plus the code it claims to change, read at
  the default branch.

Add the originating issue when there is one, and the project's own agent
instructions — `CLAUDE.md`, `AGENTS.md`, and whatever they point at for the
surface being touched. Write the dossier to one file in the scratchpad and pass
its path to every juror, so all seven try the same frozen thing.

## 2. Convene the seven

Dispatch all seven in a **single message**, one `Agent` call each, so they run
concurrently and none can see another's reasoning. Convene every count on every
target: a count with no material returns *nothing to charge*, which is cheap
and is a real answer.

| Count | What it prosecutes |
|---|---|
| `coherence` | the diff against the patterns already in the code and the project's stated rules |
| `omission` | what the work should have touched and did not |
| `proof` | whether the test fails without the change |
| `performance` | the hot path, the unbounded query, the re-render, the extra round trip |
| `state-of-the-art` | the deprecated API, the idiom the upstream docs retired |
| `blast-radius` | tenancy, permissions, visibility, migrations, rollback |
| `surface` | secrets, injection, the authorization the change exposes |

Each juror's prompt carries the dossier path, its own count name, and this
instruction: read your section of the `CHARGES.md` beside this skill and return
only that section's verdict shape. The president reads none of them.

## 3. Deliberate

The president receives seven returns and does four things:

- **Strike what left its lane.** A finding outside the juror's own count is
  struck, not promoted: it was made without the dossier reading that count
  demands.
- **Merge the overlaps.** When two counts land on the same lines from different
  angles, keep the higher rank and name both angles in one entry.
- **Keep the singletons.** One juror is sufficient authority. Corroboration
  raises rank; its absence never removes a finding.
- **Rank.** `blocking` — the work is wrong or unsafe as it stands.
  `to fix` — real, and cheap to repair before it lands. `noted` — true,
  non-blocking, recorded for the record.

## 4. Return the verdict

One document, ranked, findings first. Each entry carries: count, `file:line`,
what breaks and under which input or state, the refutation the juror attempted
and why it failed, and the smallest change that answers it. Close with the
frozen target — head SHA or merge-base — and the counts that returned nothing
to charge, named one by one.

The trial is complete when all seven counts have returned and every surviving
finding carries either an executable command or a quoted excerpt as its
evidence. A finding whose evidence is a paraphrase is struck.

Then stop. The ruling on what to do with the verdict belongs to whoever
convened the court.

## Red flags

- a juror ranging across counts because it noticed something nearby;
- a finding dropped because only one juror raised it;
- a verdict entry whose evidence is a summary of the code rather than the code;
- trusting a test the `proof` juror never ran without the change;
- trying a pull request whose head moved during the trial;
- inventing a charge so a count has something to return.
