# Inside ISS newsletter

The monthly employee newsletter of Orange County, Florida, Information Systems & Services (ISS), published as one web page with GitHub Pages.

Live page: https://pad1011.github.io/orange-county-iss-newsletter/

## Your monthly routine with Claude

1. **Open Claude Code.** Use this bookmark: [Start next month's edition](https://claude.ai/code?repositories=pad1011%2Forange-county-iss-newsletter&prompt=%2Fnew-edition%20). It opens Claude Code on the web (or the Code tab in the Claude app) with this repository already picked. Type the month after `/new-edition` (for example `/new-edition November 2026`) and press Enter.
2. **Give Claude the content.** Paste the new stories, the reviewer's notes and any links, or attach photos. Claude asks about anything that's missing and never makes up facts.
3. **Look at the screenshots.** Claude shows you how the page looks on a computer and on a phone. Ask for changes in plain words, for example "make the Quick Tip shorter".
4. **Send it for review.** Click **Create PR** on the **Changes** card in the Claude session, then type "PR created" so Claude can check the checklist is there. Download the desktop and phone screenshots from the file cards Claude sent in the chat and email them to your reviewer (the pull-request link shows code, not the finished page). When notes come back, reopen the same Claude session (it's in your session list), type `/apply-feedback` and paste them.
5. **Publish.** When your reviewer approves, open the pull request on GitHub, tick every box in its checklist, then click **Merge pull request** and **Confirm merge**. Don't click **Delete branch** afterward; the branch is part of the county's record of this edition. The live page updates in about 2 to 10 minutes.

## Handy things to type

| Type this | What happens |
|---|---|
| `/new-edition November 2026` | Starts a new month's edition, step by step |
| `/apply-feedback` (then paste the notes) | Applies a reviewer's notes and shows a table of what changed where |
| `/verify` | Checks the page (accessibility, broken images, phone layout) and shows screenshots |
| "Interview me with questions, then show me a plan" | Good start for anything bigger than a copy change |
| "Remember that ..." | Claude writes it into CLAUDE.md. New sessions know it once that pull request is merged |
| `/context` | Shows what Claude loaded at the start (use it to confirm the setup) |

Tips:
- The mode menu under the message box controls how often Claude stops to ask you. **Auto** (if your organization offers it) means fewer pop-ups for routine copy changes; pushes to the live branch still always ask. For layout or design changes, pick **Plan** first, so Claude shows a plan before changing anything.
- To undo something in the current session, hover over an earlier message and choose **Rewind to here**.
- If Claude goes off track twice, start a new session and describe the task again with what you learned.

## What's in this folder

| File or folder | What it is |
|---|---|
| `index.html` | The newsletter page itself |
| `assets/` | Logos and images |
| `archive/` | Past editions (created the first time `/new-edition` runs) |
| `EDITIONS.md` | Log of every edition: what changed, where the copy came from, who approved |
| `CLAUDE.md` | Instructions Claude reads at the start of every session (brand rules, safety rules, how to work with you) |
| `.claude/` | Claude's setup: settings, the `/new-edition`, `/apply-feedback` and `/verify` shortcuts, the automatic page check, and the plain-English answer style |
| `_config.yml` | Keeps the notes files off the live site |

## One-time setup: protect the live page

Do this once, so nothing (not Claude, not a mistaken click) can change the live page without a pull request.

1. On GitHub, open this repository and click **Settings**.
2. In the left menu, under **Code, planning, and automation**, click **Rules**, then **Rulesets**.
3. Click **New ruleset**, then **New branch ruleset**.
4. For **Ruleset Name**, type `Protect live newsletter`. **Enforcement status** starts as **Disabled**: change it to **Active**. Leave **Bypass list** empty.
5. Under **Target branches**, click **Add target**, then **Include default branch**.
6. Under **Branch rules**, keep **Restrict deletions** and **Block force pushes** ticked, and tick **Require a pull request before merging**. Set **Required approvals** to 0 (GitHub doesn't let you approve your own pull request).
7. Click **Create**.

## If something goes wrong

- **The live page looks wrong after a merge:** on GitHub, open the merged pull request and click **Revert**, then merge the revert pull request. The page goes back to how it was.
- **Claude can't push or says GitHub isn't connected:** reconnect GitHub in claude.ai settings, then start a new session.
