---
name: evaluate
description: Use when a pull request, an unpushed branch, or a written spec must be tried before it is trusted — sealed jurors, one per count the target calls for, instructed in parallel, one ranked verdict, nothing written to the code.
---

# Evaluate

The work is the accused. Each juror instructs one count, in isolation, and
the court returns a single ranked verdict. Nothing is committed, no issue is
filed, no line is fixed: the tribunal judges and reports.

Across four review tools and 617 findings, 93.4% were raised by exactly one
reviewer: coverage comes from cloistering the counts, not from more eyes on the
same one. So a juror reports its own count alone, and a finding raised by one
juror stands on its own evidence.

When only one subagent can be spent on the trial — a loop iteration, a small
target — convene the single-juror form in [`SOLO.md`](SOLO.md) beside this file instead of §2;
the dossier and the deliberation are the same.

## 1. Instruct the dossier

Read the project's **review adapter** first: `docs/agents/review.md`, or the
file the convener names. It may give the commands that read a pull request,
its diff and its checks on this forge; the screen paths; the rule files; a
mutation report for the diff. What it leaves out falls back to: the forge's own
CLI (`gh` on GitHub, `glab` on GitLab), `AGENTS.md` and `CLAUDE.md` as rule
files, the screen definition in §2, and no mutation report.

Freeze one target and build the dossier every juror will read. The three
targets differ only in how the dossier is assembled:

- **A pull request** — its description and bot comments, its diff, and the
  head SHA. Record the head SHA: a new head voids the trial.
- **The current branch** — the merge-base against the default branch, `git diff`
  against it, and the commit list.
- **A spec or plan** — the document, plus the code it claims to change, read at
  the default branch.

Add the originating issue when there is one, and the project's rule files with
whatever they point at for the surface being touched.

Then **map the change** once, so no juror pays for it again:

- each changed file with its callers, found by searching its exported names;
- the test files that import a changed file or that the diff touches — files
  named one by one, never a directory or a whole package;
- the head's CI checks, when they ran.

Write the dossier and its map to one file in the scratchpad and pass its path
to every juror, so every juror tries the same frozen thing. A juror starts from
the map and widens only where its own count leads.

## 2. Convene the jury

The jury is read off the target: a count sits when its row below says so, and
every juror that sits is dispatched in a **single message**, one subagent
each, so they run concurrently and none can see another's reasoning. A count
that sits with no material returns *nothing to charge*, which is cheap and is a
real answer. A count that does not sit is named in the verdict as *not
convened*, with the row that kept it out.

A target **has a screen** when it changes code that renders what a person
sees: a component, a hook or store a component reads, a page, a style, a
locale. Where the adapter lists screen paths, read them there. A target is **screen-only** when every
file it changes, tests aside, is screen code. On a spec, read both off the
code it claims to change.

| Count | What it prosecutes | Sits on |
|---|---|---|
| `coherence` | the diff against the patterns already in the code and the project's stated rules | every target |
| `omission` | what the work should have touched and did not | every target |
| `proof` | whether the test fails without the change | its trigger |
| `experience` | what a person meets on the screen: states, keyboard, focus, copy, theme | a target with a screen |
| `concurrency` | two things happening at once: the race, the stale read, the double write | its trigger |
| `performance` | the cost per request, per record, per render: the unbounded query, the re-render, the extra round trip, the heavy import | its trigger |
| `state-of-the-art` | the deprecated API, the idiom the upstream docs retired | every target but a screen-only one |
| `blast-radius` | tenancy, permissions, visibility, migrations, rollback | every target; a screen-only one when it gates on a permission or a visibility |
| `surface` | secrets, injection, the authorization the change exposes | its trigger |
| `dry` | what this rebuilds that the codebase already has | every target |
| `elegance` | the abstraction nobody needed, the flexibility no caller uses | every target |

A trigger is something the target **does**, read from its files:

- `concurrency` — an optimistic update or a mutation hook; a realtime channel,
  stream or subscription that writes into state the user also edits; a job,
  retry, queue, lease or lock; a read followed by a write on the same row; a
  cache shared across requests; requests fired in parallel whose answers are
  merged; a submit a person can fire twice.
- `proof` — a change to behaviour: code that decides, computes, stores,
  fetches or renders conditionally; a test added, edited or deleted. Styles,
  copy, docs, comments and config values alone do not trip it.
- `performance` — a query, repository, migration or index; a job, sweep, loop
  or batch; code on a request path; a component, hook, store or context;
  streaming, polling, subscriptions or realtime; a cache; a new dependency or a
  heavy import.
- `surface` — external input (a route or operation handler, a webhook, an
  integration client, a parser of a third-party payload, an upload, a URL
  fetched server-side); authentication, sessions, tokens, secrets, keys or
  crypto; a permission or grant check; a query, shell command, template or
  file path built from a value; a log line or error carrying user data; a
  sandbox, browser or code-execution tool.

The rows rest on 261 trials where all nine original counts sat: `surface`
sent work to a fixer on 3% of them and `performance` on 5%, `surface` on none
of the 56 screen-only ones, `state-of-the-art` on none at all; on screen-only
targets the findings about focus, keyboard, translations and states were
scattered across `omission` and `coherence`, which is the reading
`experience` now owns.

Each juror's prompt carries the dossier path, its own count name, and this
instruction: read your section of the `CHARGES.md` beside this skill and return
only that section's verdict shape. The president reads none of them.

Give `dry` and `elegance` the largest model available. They are the two counts
that pay for judgment rather than for looking, and a fast tier spends the call
without buying it.

## 3. Deliberate

The president receives the returns and does four things:

- **Strike what left its lane, and what is paraphrased.** A finding outside
  the juror's own count was made without the dossier reading that count
  demands. A finding whose evidence is a summary of the code rather than the
  code has no evidence.
- **Merge the overlaps.** When two counts land on the same lines from different
  angles, keep the higher rank and name both angles in one entry.
- **Keep the singletons.** One juror is sufficient authority. Corroboration
  raises rank; its absence never removes a finding.
- **Rank** each entry on the ladder in `CHARGES.md` (*The rank ladder*). A
  juror's line on why a lower rung tempted it is the only ground for lowering.

## 4. Return the verdict

One document, ranked, findings first, each entry in the shape `CHARGES.md`
prescribes. Close with the frozen target — head SHA or merge-base — the
counts that returned nothing to charge, and the counts not convened with the
row that kept each out, named one by one.

The trial is complete when every count that sat has returned and every surviving
finding carries an executable command or a quoted excerpt as its evidence. The
ruling on what to do with the verdict belongs to whoever convened the court.
