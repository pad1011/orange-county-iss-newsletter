---
name: new-edition
description: Start the next monthly edition of the Inside ISS newsletter from the copy the user provides, then check it and prepare it for review.
argument-hint: "[Month Year, e.g. November 2026]"
disable-model-invocation: true
allowed-tools: Skill(verify) Bash(node .claude/skills/verify/scripts/check.cjs *) Bash(python3 .claude/hooks/check-html.py *) Read(//tmp/inside-iss-check/**) SendUserFile Bash(git log *) Bash(git status *) Bash(git diff *)
---

# Start the $ARGUMENTS edition of Inside ISS

Work through these steps in order. Keep the user informed in plain words, one short update per step.

1. **Get your bearings.** Read `EDITIONS.md` (the edition log) and run `git log --oneline -5`. If no month was given above, ask which month this edition is for.

2. **Collect the content. Never invent it.** Ask the user to paste or attach the new stories, the reviewer's notes, and any new photos or links. If they have a Claude Doc link, read it. Use AskUserQuestion to ask which sections change this month and whether the numbers in "AI at Work" stay the same. If something is missing, ask. Don't fill the gap yourself.

3. **Work on a branch.** If you're on `master`, create a branch named `edition/YYYY-MM` (for example `edition/2026-11`). Cloud sessions usually start on a `claude/...` branch already, and that's fine. Never commit to `master`.

4. **Archive the outgoing edition** (skip this only if the user says not to):
   - Copy `index.html` to `archive/YYYY-MM/index.html`, using the month of the edition being replaced.
   - In the copy, change `assets/` paths to `../../assets/`, and add a short line at the top of the body: "Archived edition: Month Year. [See the current edition](../../index.html)".
   - Add the edition to `archive/index.html` (create a simple list page titled "Inside ISS archive" in the same style if it doesn't exist yet).
   - Run the `verify` skill on the archived copy too, so its images and links work from the new folder.
   - After that, archived editions are frozen: don't edit them again unless the user asks (for example, to fix a broken image). The ADA rule's "archived content" exception covers only content kept unchanged in an area clearly labeled as an archive.
   - Never delete or overwrite an image in `assets/` that an archived edition uses. Give new images month-prefixed names, for example `assets/2026-11-team-photo.jpg`.

5. **Update `index.html` for the new month.** Change every month-specific spot:
   - the edition label in the top bar (`<span class="iss-edition">`)
   - the "In this edition" card, and the "In this issue" list
   - the section stories
   - the footer copyright year, and `<title>` / meta description if they mention the month

   Keep the existing sections, class names, layout and the mobile menu script unless the user asks for a change. Use reviewer-approved wording word for word. Remove old review notes such as `<!-- JUNE FEEDBACK ... -->` comments; record where the copy came from in `EDITIONS.md` instead.

6. **Plain-language pass (suggestions only).** For the new copy only, list suggested improvements: active voice, sentences under about 25 words, acronyms spelled out the first time, product names spelled consistently (ServiceNow, Sophos, OrangeNET). Let the user accept or reject each one. Never change approved wording, numbers, names, phone numbers, emails or links on your own.

7. **Check the page.** Run the `verify` skill and show the user both screenshots.

8. **Fresh-eyes review.** Ask the `newsletter-reviewer` subagent to review the changes, then fix or report what it finds.

9. **Log it.** Add a new entry at the top of `EDITIONS.md`: month, edition label, the sections that changed, where the copy came from, open questions, and "Approved by: (to fill in)".

10. **Hand over.** Commit with a clear message, for example "November 2026 edition: new AI at Work story", and push the branch. Then give the user these steps:
    1. Click **Create PR** in this session (or open the branch on GitHub and click **Compare & pull request**).
    2. Get approval from the reviewer, using the screenshots and the PR link.
    3. On GitHub, open the pull request and click **Merge pull request**, then **Confirm merge**.
    4. Wait about 2 to 10 minutes, then open the live page and check it.
