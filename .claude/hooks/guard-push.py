#!/usr/bin/env python3
"""Runs before every shell command Claude wants to run (PreToolUse hook).

If the command is a `git push` that could update master (the branch GitHub Pages
publishes as the live newsletter), it makes Claude Code ask the user first. This
covers pushes the permission rules can't see, such as a plain `git push` or
`git push origin HEAD` while on master. Every other command passes through.
"""
import json
import re
import subprocess
import sys

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

cmd = (data.get("tool_input") or {}).get("command") or ""
if not re.search(r"\bgit\b[^;&|\n]*\bpush\b", cmd):
    sys.exit(0)

try:
    branch = subprocess.run(["git", "-C", data.get("cwd") or ".", "rev-parse", "--abbrev-ref", "HEAD"],
                            capture_output=True, text=True, timeout=10).stdout.strip()
except Exception:
    branch = ""

if "master" in cmd or branch in ("master", "HEAD", ""):
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "ask",
        "permissionDecisionReason": "This push could update master, which publishes the live newsletter. "
                                    "Approve only if you really mean to publish without a pull request.",
    }}))
sys.exit(0)
