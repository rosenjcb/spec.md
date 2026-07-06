#!/usr/bin/env bash
# spec.md installer — drop the spec-md skill and/or agent rule files into a project.
#
#   curl -fsSL https://raw.githubusercontent.com/rosenjcb/spec.md/main/install.sh | bash
#   ./install.sh --all
#   ./install.sh --claude --cursor
#
# With no agent flags it installs the Claude Code skill globally
# (~/.claude/skills/spec-md) and writes AGENTS.md into the current project.
set -euo pipefail

REPO="rosenjcb/spec.md"
BRANCH="${SPEC_MD_REF:-main}"
BASE_URL="https://raw.githubusercontent.com/${REPO}/${BRANCH}"

# If run from a checkout, copy locally; otherwise download.
SRC_DIR=""
if [ -f "${BASH_SOURCE[0]:-}" ]; then
  maybe="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  [ -f "$maybe/SKILL.md" ] && SRC_DIR="$maybe"
fi

C_RESET='\033[0m'; C_BOLD='\033[1m'; C_GREEN='\033[32m'; C_BLUE='\033[34m'; C_YELLOW='\033[33m'
say()  { printf "${C_BLUE}›${C_RESET} %s\n" "$1"; }
ok()   { printf "${C_GREEN}✓${C_RESET} %s\n" "$1"; }
warn() { printf "${C_YELLOW}▲${C_RESET} %s\n" "$1"; }

# fetch <repo-relative-path> <dest>
fetch() {
  local rel="$1" dest="$2"
  mkdir -p "$(dirname "$dest")"
  if [ -n "$SRC_DIR" ] && [ -f "$SRC_DIR/$rel" ]; then
    cp "$SRC_DIR/$rel" "$dest"
  elif command -v curl >/dev/null 2>&1; then
    curl -fsSL "$BASE_URL/$rel" -o "$dest"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "$dest" "$BASE_URL/$rel"
  else
    echo "error: need curl or wget to download $rel" >&2
    exit 1
  fi
}

DO_CLAUDE=0 DO_CURSOR=0 DO_WINDSURF=0 DO_CLINE=0 DO_COPILOT=0 DO_AGENTS=0
GLOBAL=1 PROJECT_DIR="$PWD" ANY=0

while [ $# -gt 0 ]; do
  case "$1" in
    --claude)   DO_CLAUDE=1; ANY=1 ;;
    --cursor)   DO_CURSOR=1; ANY=1 ;;
    --windsurf) DO_WINDSURF=1; ANY=1 ;;
    --cline)    DO_CLINE=1; ANY=1 ;;
    --copilot)  DO_COPILOT=1; ANY=1 ;;
    --agents)   DO_AGENTS=1; ANY=1 ;;
    --all)      DO_CLAUDE=1; DO_CURSOR=1; DO_WINDSURF=1; DO_CLINE=1; DO_COPILOT=1; DO_AGENTS=1; ANY=1 ;;
    --local)    GLOBAL=0 ;;
    --global)   GLOBAL=1 ;;
    --dir)      PROJECT_DIR="$2"; shift ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//' | sed '1d'
      exit 0 ;;
    *) warn "unknown option: $1" ;;
  esac
  shift
done

# Default: Claude skill (global) + AGENTS.md.
if [ "$ANY" -eq 0 ]; then
  DO_CLAUDE=1
  DO_AGENTS=1
fi

printf "${C_BOLD}spec.md installer${C_RESET}  (%s@%s)\n\n" "$REPO" "$BRANCH"
[ -n "$SRC_DIR" ] && say "using local checkout" || say "downloading from GitHub"

if [ "$DO_CLAUDE" -eq 1 ]; then
  if [ "$GLOBAL" -eq 1 ]; then
    SKILL_DIR="$HOME/.claude/skills/spec-md"
  else
    SKILL_DIR="$PROJECT_DIR/.claude/skills/spec-md"
  fi
  fetch "SKILL.md" "$SKILL_DIR/SKILL.md"
  fetch "TESTING.md" "$SKILL_DIR/TESTING.md"
  ok "Claude Code skill → $SKILL_DIR"
fi

if [ "$DO_CURSOR" -eq 1 ]; then
  fetch ".cursor/rules/spec-md.mdc" "$PROJECT_DIR/.cursor/rules/spec-md.mdc"
  ok "Cursor rule → $PROJECT_DIR/.cursor/rules/spec-md.mdc"
fi
if [ "$DO_WINDSURF" -eq 1 ]; then
  fetch ".windsurf/rules/spec-md.md" "$PROJECT_DIR/.windsurf/rules/spec-md.md"
  ok "Windsurf rule → $PROJECT_DIR/.windsurf/rules/spec-md.md"
fi
if [ "$DO_CLINE" -eq 1 ]; then
  fetch ".clinerules/spec-md.md" "$PROJECT_DIR/.clinerules/spec-md.md"
  ok "Cline rule → $PROJECT_DIR/.clinerules/spec-md.md"
fi
if [ "$DO_COPILOT" -eq 1 ]; then
  fetch ".github/copilot-instructions.md" "$PROJECT_DIR/.github/copilot-instructions.md"
  ok "Copilot instructions → $PROJECT_DIR/.github/copilot-instructions.md"
fi
if [ "$DO_AGENTS" -eq 1 ]; then
  fetch "AGENTS.md" "$PROJECT_DIR/AGENTS.md"
  ok "AGENTS.md → $PROJECT_DIR/AGENTS.md"
fi

printf "\n${C_GREEN}${C_BOLD}Done.${C_RESET}\n"
printf "${C_BLUE}›${C_RESET} Next: install the CLI with ${C_BOLD}npm i -D spec-md${C_RESET} then ${C_BOLD}npx spec-md check${C_RESET}\n"
