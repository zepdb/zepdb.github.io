#!/bin/sh
set -e

SKILL_DIR="$HOME/.claude/skills/zeppelin"
SKILL_URL="https://raw.githubusercontent.com/zepdb/zeppelin/main/SKILL.md"

mkdir -p "$SKILL_DIR"
curl -sL "$SKILL_URL" -o "$SKILL_DIR/SKILL.md"

echo "Zeppelin skill installed to $SKILL_DIR/SKILL.md"
