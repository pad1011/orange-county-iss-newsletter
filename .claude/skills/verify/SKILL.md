---
name: verify
description: Check the Inside ISS newsletter page after any change to index.html, archive pages or assets. Takes desktop and phone screenshots and checks WCAG 2.1 AA accessibility, broken images and links, HTML errors, leftover placeholders and hidden photo data (GPS). Use before every commit, and whenever the user asks to see, preview or check the page.
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/check.cjs *) Bash(node .claude/skills/verify/scripts/check.cjs *) Bash(python3 ${CLAUDE_PROJECT_DIR}/.claude/hooks/check-html.py *) Bash(python3 .claude/hooks/check-html.py *) Read(//tmp/inside-iss-check/**) SendUserFile
---

# Check the newsletter page

1. Run the check from the repository root:

   `node ${CLAUDE_SKILL_DIR}/scripts/check.cjs index.html`

   Add any other page you changed, for example `archive/2026-07/index.html`. The first run in a session downloads two checker tools into a temp folder (about 10 seconds). Nothing is added to the repository. Never run `playwright install`.

2. Read the report. It has four parts:
   - **MUST FIX**: fix these before committing if your change caused them. Exception: a `[CONFIRM: ...]` marker for a fact the user doesn't have yet may be committed for review; list it for the user instead of guessing a value. If a problem was already on the page before your change, don't fix it silently. Tell the user what it is in plain words and ask whether to fix it now.
   - **SHOULD FIX**: mention these to the user; fix them only if they are quick and the user agrees.
   - **NEEDS A PERSON TO LOOK**: pass this list to the user as a short checklist.
   - **CHECKS THAT DID NOT RUN**: say so plainly. Never call the page "checked" if the accessibility scan or screenshots did not run.

3. Open `index-desktop.png` and the phone parts (`index-phone-part1.png`, `index-phone-part2.png`, ...) with the Read tool and look at them yourself. The full `index-phone.png` is too tall to read in one piece; show that one to the user. Watch for cut-off or overlapping text, hard-to-read text, broken images, the full-color county logo on a colored background (it must sit on white), sections out of order, and anything that looks different from what the user asked for.

4. Show the user the desktop and full phone screenshots. Use the SendUserFile tool if it is available. If it isn't, say so plainly and describe what the screenshots show; don't give file paths, because they're on the cloud computer and the user can't open them.

5. Report in plain words: what was checked, the result (PASS or FAIL), what you fixed, and what the user should look at. Base this on the actual output, not on assumptions.

Don't commit the screenshots; they are saved outside the repository. The quick edit-time check can also be run by hand with `python3 .claude/hooks/check-html.py index.html`.
