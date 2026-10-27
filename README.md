# Inside ISS newsletter

The monthly employee newsletter of Orange County, Florida, Information Systems & Services (ISS), published as one web page with GitHub Pages.

Live page: https://pad1011.github.io/orange-county-iss-newsletter/

## Your monthly routine with Claude

1. **Open Claude Code.** Use this bookmark: [Start next month's edition](https://claude.ai/code?repositories=pad1011%2Forange-county-iss-newsletter&prompt=%2Fnew-edition%20). It opens Claude Code on the web (or the Code tab in the Claude app) with this repository already picked. Type the month after `/new-edition` (for example `/new-edition November 2026`) and press Enter.
2. **Give Claude the content.** Paste the new stories, the reviewer's notes and any links, or attach photos. Claude asks about anything that's missing and never makes up facts.
3. **Look at the screenshots.** Claude shows you how the page looks on a computer and on a phone. Ask for changes in plain words, for example "make the Quick Tip shorter".
4. **Send it for review.** Click **Create PR** in the Claude session. Share the screenshots or the pull-request link with your reviewer. When notes come back, type `/apply-feedback` and paste them.
5. **Publish.** On GitHub, open the pull request, click **Merge pull request**, then **Confirm merge**. The live page updates in about 2 to 10 minutes.

## Handy things to type

| Type this | What happens |
|---|---|
| `/new-edition November 2026` | Starts a new month's edition, step by step |
| `/apply-feedback` (then paste the notes) | Applies a reviewer's notes and shows a table of what changed where |
| `/verify` | Checks the page (accessibility, broken images, phone layout) and shows screenshots |
| "Interview me with questions, then show me a plan" | Good start for anything bigger than a copy change |
| "Remember that ..." | Claude writes it into CLAUDE.md so future sessions know it |
| `/context` | Shows what Claude loaded at the start (use it to confirm the setup) |

Tips:
- For layout or design changes, pick **Plan** in the mode menu under the message box first. Claude shows a plan before changing anything.
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

## If something goes wrong

- **The live page looks wrong after a merge:** on GitHub, open the merged pull request and click **Revert**, then merge the revert pull request. The page goes back to how it was.
- **Claude can't push or says GitHub isn't connected:** reconnect GitHub in claude.ai settings, then start a new session.
