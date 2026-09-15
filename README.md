# skills

Agent skills that work the same in Claude Code, Codex and Cursor.

```bash
git clone git@github.com:reizam/skills.git && cd skills
./install.sh
```

One copy on disk, three agents reading it. `git pull` updates all of them.

## What is here

| Skill | What it does |
|---|---|
| [`/aim`](skills/aim) | Turns a loose intention into a brief an autonomous run can be trusted with — a terminal state that is a command, a verification loop, a journal, and all three stopping conditions. Refuses the work that does not belong in a loop. |
| [`/brainstorm`](skills/brainstorm) | Runs superpowers' design dialogue to its written spec, then tries that spec with `/evaluate` before a line of code exists. |
| [`/evaluate`](skills/evaluate) | Tries a pull request, a branch or a spec before you trust it. Nine jurors, one count each, instructed in parallel and sealed from one another; returns one ranked verdict and writes nothing. |
| [`/innovate`](skills/innovate) | Takes a half-formed idea, opens three genuinely distinct directions, weighs each honestly, and rules on the one that ships — ending on a single decision. |

`/brainstorm` requires `superpowers:brainstorming`; everything else stands alone.

## Naming

Two registers, and the name tells you which one you are looking at.

**A rite is a verb.** You type what you want done: `/evaluate`, `/innovate`. It
reads as a command because it is one, and it says what comes back.

**A reference is a noun.** Material you consult rather than run —
`postgres-patterns`, `form-system`. Dressing a schema reference up as a verb
only makes it unfindable.

Most of the ecosystem names by gerund — `reviewing-pull-requests`,
`scouting-bugs`. Accurate, and forgettable. A verb in the imperative is shorter,
reads as an instruction, and survives being typed a hundred times.

## Layout

```
skills/<name>/SKILL.md      the skill itself
skills/<name>/*.md          material the skill points at, loaded only when reached
```

`SKILL.md` carries YAML frontmatter with `name` and `description`. Every agent
reads that same file; nothing here is specific to one of them.

The `description` is the whole invocation surface — it is what an agent sees
before deciding to load anything. Write it as the condition for reaching the
skill, not as a summary of its contents.

## Where install.sh puts things

```
~/.agents/skills/<name>  ->  <repo>/skills/<name>      canonical — Codex, Cursor
~/.claude/skills/<name>  ->  ../../.agents/skills/<name>
~/.codex/skills/<name>   ->  ../../.agents/skills/<name>
```

Anything already sitting at one of those paths is moved aside to
`<name>.backup.<timestamp>` rather than overwritten.

```bash
./install.sh                 # everything
./install.sh evaluate        # named skills only
./install.sh --list          # what this repository ships
./install.sh --uninstall     # remove the links, leave the repo
```

## Adding one

Create `skills/<verb>/SKILL.md` with `name` and `description`, then
`./install.sh <verb>`. Keep the branches a skill handles inside `SKILL.md` and
push material that only some runs reach into a sibling file the skill points
at — an agent should load the second file only when it needs it.
