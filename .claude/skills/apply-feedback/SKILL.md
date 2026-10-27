---
name: apply-feedback
description: Apply a reviewer's notes or edits to the Inside ISS newsletter as a checklist, and report exactly what changed where.
argument-hint: "[paste the reviewer's notes, or leave empty]"
disable-model-invocation: true
allowed-tools: Skill(verify) Bash(node .claude/skills/verify/scripts/check.cjs *) Bash(python3 .claude/hooks/check-html.py *) Read(//tmp/inside-iss-check/**) SendUserFile Bash(git status *) Bash(git diff *)
---

# Apply reviewer feedback

Reviewer notes (may be empty): $ARGUMENTS

1. If no notes are above, ask the user to paste the reviewer's email or notes, or to share a Claude Doc link.
2. Split the notes into a numbered checklist, one change per item. Show it to the user.
3. If any item is unclear (for example, where it goes or what the exact wording should be), ask about those items with AskUserQuestion before changing anything. Never guess.
4. Make only the changes the notes ask for. When the reviewer gives exact wording, use it word for word. Don't rewrite anything else, and never change numbers, names, phone numbers, emails or links unless a note says to.
5. Work on the branch of this edition's open pull request, never on `master`. If this session is on a different branch (for example, a new session started from the bookmark), find the edition's open pull request, then run `git fetch origin <its branch>` and `git checkout <its branch>` before changing anything, so the same pull request gets the fixes. If you can't tell which pull request it is, ask.
6. Run the `verify` skill and show the user the screenshots.
7. Reply with this table:

   | # | Reviewer note | What I changed | Where on the page | Status |
   |---|---|---|---|---|

   Status is "Done" or "Needs you" (with the reason).
8. Add a line under the current edition in `EDITIONS.md`, for example "Applied reviewer notes from (name), (date)". Don't leave feedback comments inside `index.html`.
9. Commit and push that branch. Tell the user the existing pull request now shows the changes, and give its link.
