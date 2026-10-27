---
name: new-edition
description: Start the next monthly edition of the Inside ISS newsletter from the copy the user provides, then check it and prepare it for review.
argument-hint: "[Month Year, e.g. November 2026]"
disable-model-invocation: true
allowed-tools: Skill(verify) Bash(node .claude/skills/verify/scripts/check.cjs *) Bash(python3 .claude/hooks/check-html.py *) Read(//tmp/inside-iss-check/**) SendUserFile Bash(git log *) Bash(git status *) Bash(git diff *)
---

# Start the $ARGUMENTS edition of Inside ISS

Work through these steps in order. Keep the user informed in plain words, one short update per step.

1. **Get your bearings.** Read `EDITIONS.md` (the edition log) and run `git log --oneline -5`. If no month was given above, ask which month this edition is for. If the "How editions reach employees" section of CLAUDE.md still says NOT CONFIRMED, ask that first (AskUserQuestion: a link to the GitHub page, the newsletter pasted into an Outlook email, a SharePoint or intranet post, a PDF, or "I'm not sure"), then record the answer there.

2. **Collect the content. Never invent it.** Ask the user to paste or attach the new stories, the reviewer's notes, and any new photos or links. If they have a Claude Doc link, read it. For each photo (attached, or inside a Word or PDF file), use the `add-photo` skill; never copy a photo straight into `assets/`. Use AskUserQuestion to ask which sections change this month, whether the numbers in "AI at Work" stay the same, and what the edition label should say (if `EDITIONS.md` has no numbering rule yet, ask, and write the answer there). If something is missing, ask. Don't fill the gap yourself.

3. **Work on a branch.** If you're on `master`, create a branch named `edition/YYYY-MM` (for example `edition/2026-11`). Cloud sessions usually start on a `claude/...` branch already, and that's fine. Never commit to `master`.

4. **Archive the outgoing edition** (skip this only if the user says not to):
   - Copy `index.html` to `archive/YYYY-MM/index.html`, using the month of the edition being replaced.
   - In the copy, change `assets/` paths to `../../assets/`, and add a short line at the top of the body: "Archived edition: Month Year. [See the current edition](../../index.html)".
   - Add the edition to `archive/index.html` (create a simple list page titled "Inside ISS archive" in the same style if it doesn't exist yet).
   - Run the `verify` skill on the archived copy too, only to confirm its images and links work from the new folder. Fix only broken images or links there; the archive keeps the page exactly as it was published, including the known problems listed in `EDITIONS.md`.
   - Nothing on the live page links to the archive yet. The first time you archive, ask the user whether to add a "Past editions" link in the footer pointing to `archive/`; without it, employees can't find past editions.
   - After that, archived editions are frozen: don't edit them again unless the user asks. The ADA rule's "archived content" exception (28 CFR 35.104) covers only content created before Orange County's compliance date (April 26, 2027), kept only for reference, not changed after archiving, and stored in an area clearly labeled as an archive. Editing an archived page later ends the exception for that page, and editions made after April 26, 2027 never qualify, so never tell the user an archived edition is exempt from accessibility rules.
   - Never delete or overwrite an image in `assets/` that an archived edition uses. Give new images month-prefixed names, for example `assets/2026-11-team-photo.jpg`.

5. **Update `index.html` for the new month.** Change every month-specific spot:
   - the edition label in the top bar (`<span class="iss-edition">`)
   - the "In this edition" card, and the "In this issue" list
   - the Welcome paragraph in "Inside ISS" (it still says "We're introducing a new monthly newsletter", written for the first edition)
   - the section stories
   - the footer copyright year, and `<title>` / meta description if they mention the month

   Keep the existing sections, class names, layout and the mobile menu script unless the user asks for a change. Use reviewer-approved wording word for word. Remove old review notes such as `<!-- JUNE FEEDBACK ... -->` comments; record where the copy came from in `EDITIONS.md` instead.

6. **Plain-language pass (suggestions only).** For the new copy only, list suggested improvements: active voice, sentences under about 25 words, acronyms spelled out the first time, product names spelled consistently (ServiceNow, Sophos, OrangeNET). Let the user accept or reject each one. Never change approved wording, numbers, names, phone numbers, emails or links on your own.

7. **Check the page.** Run the `verify` skill and show the user both screenshots.

8. **Fresh-eyes review.** Ask the `newsletter-reviewer` subagent to review the changes, then fix or report what it finds.

9. **Log it.** Add a new entry at the top of `EDITIONS.md`: month, edition label, the sections that changed, where the copy came from, open questions, and "Approved by: (to fill in)".

10. **Hand over.** Commit with a clear message, for example "November 2026 edition: new AI at Work story", and push the branch. Then give the user these steps:
    1. Click **Create PR** on the **Changes** card in this session, then type "PR created" so I can check that its checklist is there. (Or open the branch on GitHub and click **Compare & pull request**.)
    2. Download the desktop and phone screenshots from the file cards in this chat and send them to your reviewer. The pull-request link shows code, not the finished page.
    3. When notes come back, come back to this same session (it's in your session list) and type `/apply-feedback`, then paste the notes.
    4. When the reviewer approves and every checklist box is ticked, open the pull request on GitHub and click **Merge pull request**, then **Confirm merge**. Don't click **Delete branch** afterward; the branch is part of the county's record of this edition.
    5. Wait about 2 to 10 minutes, then open the live page and check it.
