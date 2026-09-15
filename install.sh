#!/usr/bin/env bash
#
# Install skills from this repository so Claude Code, Codex and Cursor all see
# the same files.
#
#   ~/.agents/skills/<name>  ->  <repo>/skills/<name>   (canonical, Codex + Cursor)
#   ~/.claude/skills/<name>  ->  ../../.agents/skills/<name>
#   ~/.codex/skills/<name>   ->  ../../.agents/skills/<name>
#
# One source of truth: `git pull` updates every agent at once.
#
# Usage:
#   ./install.sh                  install every skill
#   ./install.sh evaluate         install named skills only
#   ./install.sh --list           list what this repository ships
#   ./install.sh --uninstall      remove the links this script made
#
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$REPO/skills"
CANONICAL="$HOME/.agents/skills"
MIRRORS=("$HOME/.claude/skills" "$HOME/.codex/skills")
RELATIVE="../../.agents/skills"

bold=$'\033[1m'; dim=$'\033[2m'; red=$'\033[31m'; green=$'\033[32m'; reset=$'\033[0m'

die() { printf '%s%s%s\n' "$red" "$*" "$reset" >&2; exit 1; }

available() {
  local d
  for d in "$SRC"/*/; do
    [ -f "${d}SKILL.md" ] && basename "$d"
  done
}

# Move an existing real directory or foreign symlink out of the way.
displace() {
  local path="$1" want="$2"
  [ -e "$path" ] || [ -L "$path" ] || return 0
  if [ -L "$path" ] && [ "$(readlink "$path")" = "$want" ]; then
    rm "$path"          # already ours, replace cleanly
    return 0
  fi
  local backup="${path}.backup.$(date +%Y%m%d%H%M%S)"
  mv "$path" "$backup"
  printf '  %skept existing %s at %s%s\n' "$dim" "$(basename "$path")" "$backup" "$reset"
}

install_one() {
  local name="$1"
  [ -f "$SRC/$name/SKILL.md" ] || die "no skill named '$name' in $SRC"

  mkdir -p "$CANONICAL"
  displace "$CANONICAL/$name" "$SRC/$name"
  ln -s "$SRC/$name" "$CANONICAL/$name"

  local dir
  for dir in "${MIRRORS[@]}"; do
    mkdir -p "$dir"
    displace "$dir/$name" "$RELATIVE/$name"
    ln -s "$RELATIVE/$name" "$dir/$name"
  done

  printf '  %s✓%s %s\n' "$green" "$reset" "$name"
}

uninstall_one() {
  local name="$1" dir
  for dir in "$CANONICAL" "${MIRRORS[@]}"; do
    local path="$dir/$name"
    if [ -L "$path" ] && [ "$(readlink "$path")" != "${path}" ]; then
      case "$(readlink "$path")" in
        "$SRC/$name"|"$RELATIVE/$name") rm "$path" ;;
      esac
    fi
  done
  printf '  %s✓%s %s removed\n' "$green" "$reset" "$name"
}

main() {
  local action=install names=()

  case "${1-}" in
    --list)
      printf '%sSkills in this repository%s\n' "$bold" "$reset"
      local n
      while read -r n; do
        printf '  %-16s %s\n' "$n" "$(sed -n 's/^description: //p' "$SRC/$n/SKILL.md" | cut -c1-72)"
      done < <(available)
      return 0 ;;
    --uninstall) action=uninstall; shift ;;
    -h|--help) sed -n '2,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; return 0 ;;
  esac

  if [ "$#" -gt 0 ]; then
    names=("$@")
  else
    local n
    while IFS= read -r n; do names+=("$n"); done < <(available)
  fi
  [ "${#names[@]}" -gt 0 ] || die "no skills found in $SRC"

  printf '%s%s%s\n' "$bold" "$([ "$action" = install ] && echo Installing || echo Removing)" "$reset"
  local name
  for name in "${names[@]}"; do
    "${action}_one" "$name"
  done

  if [ "$action" = install ]; then
    printf '\n%sRestart Claude Code or Codex to pick them up.%s\n' "$dim" "$reset"
  fi
}

main "$@"
