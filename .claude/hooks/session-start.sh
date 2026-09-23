#!/bin/bash
# Runs at the start of every Claude Code session.
# This site is plain HTML with no dependencies, so there is nothing to install;
# we only check that the page and its images are present.
set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}"

if [ ! -f index.html ]; then
  echo "Warning: index.html not found." >&2
  exit 0
fi

missing=0
for f in $(grep -oE '(src|href)="assets/[^"]+"|url\("?assets/[^")]+' index.html | grep -oE 'assets/[^")]+' | sort -u); do
  if [ ! -f "$f" ]; then
    echo "Warning: index.html references missing file $f" >&2
    missing=1
  fi
done

if [ "$missing" -eq 0 ]; then
  echo "Inside ISS newsletter ready: index.html and all referenced assets found. Preview with: python3 -m http.server 8000"
fi
