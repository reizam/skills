# Working in this repository

This repository holds agent skills and nothing else. Read `README.md` for the
naming registers and the install layout before adding or renaming anything.

## Rules

- A skill is a directory under `skills/` holding `SKILL.md` with YAML
  frontmatter carrying `name` and `description`. The `name` matches the
  directory exactly.
- A rite is named with a verb in the imperative; a reference is named with a
  noun. The directory name is what people type.
- The `description` states the condition for reaching the skill, not a summary
  of it. It is the only thing an agent sees before deciding to load the rest.
- Material that only some runs need lives in a sibling file that `SKILL.md`
  points at, so it costs nothing on the runs that never reach it.
- Prompt the behaviour you want. A prohibition puts the forbidden thing in
  context and makes it more available, so state the target instead and keep
  bans for hard guardrails.
- Every skill is read by Claude Code, Codex and Cursor alike. Keep harness
  specifics out of `SKILL.md`; the install paths are `install.sh`'s job.

## After changing a skill

Run `./install.sh --list` to confirm the frontmatter still parses, and
`shellcheck install.sh` when you touch the installer.

Renaming a skill leaves a stale symlink in `~/.agents/skills`, `~/.claude/skills`
and `~/.codex/skills`. Run `./install.sh --uninstall <old-name>` before the
rename, and `./install.sh` after.
