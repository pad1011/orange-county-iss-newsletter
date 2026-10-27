# Inside ISS newsletter

"Inside ISS" is the monthly employee newsletter of Orange County, Florida, Information Systems & Services (ISS), published as one static web page.

## Who you're working with
- The editor is not a programmer. Use plain words, explain any technical term in a few words, and give numbered click-by-click steps for anything they must do themselves.
- Ask one short question when something is unclear. Don't guess.
- Before publishing, deleting, or making big layout changes, say what you'll do and wait for a yes.

## How the site works
- Everything is in `index.html`: inline `<style>` blocks plus a small script for the mobile menu. Images and logos are in `assets/`. Past editions go in `archive/YYYY-MM/`.
- No build step, no npm packages, no frameworks, no web fonts, no CDNs. Keep it that way unless the user asks.
- GitHub Pages publishes the `master` branch. Whatever reaches `master` goes live for employees.
- `_config.yml` keeps CLAUDE.md, README.md and EDITIONS.md off the live site. Add any new notes file to its `exclude` list.

## Publishing safely
- This repository and the live page are PUBLIC. Every file, HTML comment, commit message, branch name and pull request can be read by anyone and stays in the history permanently.
- Always work on a branch (`claude/...` or `edition/YYYY-MM`) and push it. Never commit or push to `master`, and never merge pull requests; the user merges on GitHub after review.
- Run the `verify` skill before every commit and show the user the screenshots.
- Every pull request description must contain `.github/pull_request_template.md`. Fill in "What changed" and "Facts a person must confirm", and leave every checkbox unticked (only a person ticks them). If the user made the pull request with the **Create PR** button, read its description and add the template if it's missing.
- The user, not Claude, approves what goes live. Remind them to get their reviewer's OK.
- Don't delete branches, pull requests or Claude sessions; they're part of the county record of how each edition was made.

## Content rules
- Never invent names, titles, dates, numbers, quotes, phone numbers, emails or links. Use only what the user provides. If something is missing, ask, or mark it `[CONFIRM: ...]`. A `[CONFIRM]` may be pushed on a branch so the reviewer can see the draft: list each one under "Facts a person must confirm" in the pull request, and tell the user it must be gone before they click Merge. Nothing on GitHub stops the merge; the hook and the `verify` check only report it.
- Reviewer-approved wording is used word for word.
- The impact numbers (about 7,954 hours and about $200,000) appear only in the "AI at Work" section, in its text and its two stat boxes. Don't add them anywhere else (they were removed from the hero on purpose) unless told otherwise.
- Never write into this repository: personal data, passwords or keys, internal hostnames, URLs or IP addresses, VPN, firewall or other security configuration or product versions, or details of security incidents or how ISS responds to them (confidential under Florida law, s. 119.0725). If the user pastes something like this, stop, don't repeat it, and tell them to remove it and check with ISS Information Security.
- Security topics (Cybersecurity Corner, VPN, remote access) stay general, and ISS Information Security should approve them before publishing.
- Remove HTML comments that contain reviewer notes, feedback or drafts before publishing; anyone can see them with View Source.
- Plain language for all county employees: active voice, short sentences, acronyms spelled out the first time.

## Orange County brand rules (Brand Guidelines, Jan 2026)
- Colors: orange #EA7603, green #008540, blue #00629D, navy #00497A, deep navy #0b2c4d (hero background only), plus white and the light tints already in the stylesheet. Don't add new colors.
- Orange #EA7603 is the brand's most protected color: it's mainly for the logo, with only small accents elsewhere. It's only 2.96:1 on white, so never use it for text, focus outlines, or behind white text. For colored text or outlines on white use the AA-safe tints: blue #005285, green #0f7a37, orange #b9560a.
- Fonts: Arial/Helvetica for headings and Verdana/Geneva for body text (the brand's approved web fallbacks). No other fonts.
- The full-color county logo always sits on white. On a colored or dark background or a photo, put it in a white box. Never recolor, stretch or rearrange it.
- County style: plain, calm civic English; no emoji; phone numbers with hyphens (407-836-2929); dates like "April 14, 2026"; animation kept restrained. Brand questions go to OCBrand@ocfl.net.

## Accessibility (WCAG 2.1 AA, which the ADA Title II rule requires for local government websites)
- Text contrast at least 4.5:1, or 3:1 for large text. Every meaningful image has alt text; decorative images use `alt=""`.
- Headings stay in order: one H1, then H2, then H3. Link text makes sense on its own.
- Keep these working: the "Skip to content" link, the phone menu button (it updates `aria-expanded` and closes with Escape), and `prefers-reduced-motion`, which turns off the Contact Us animation.
- No sideways scrolling on a phone (390px wide). Images stay under 500 KB.

## Current design (don't undo these by accident)
- Sticky white top bar with the wide logo, four section links (`#inside-iss`, `#iss-news`, `#ai-at-work`, `#cyber-corner`), and the edition label. On phones the links move into the menu button.
- Dark navy hero with "Inside ISS" (the only H1) and the "In this edition" card.
- Sections in order: Inside ISS (welcome + data-center photo + "In this issue" list), ISS News, AI at Work (+ Quick Tip about Sophos), Cybersecurity Corner, Contact Us, footer with the vertical logo.
- Some comments inside index.html are out of date: they call the top bar navy and say styles live in `assets/styles.css` (deleted in June 2026). The top bar is white and all styles are inline. Don't change the page to match those comments.
- `EDITIONS.md` lists the known problems already on the page. A `verify` FAIL that lists only those is expected until they're fixed.

## Tools in this repository
- `/new-edition Month Year`: start next month's edition (archives the old one, updates every month-specific spot, checks, logs).
- `/apply-feedback`: turn a reviewer's notes into a checklist and apply them.
- `verify` skill: screenshots plus accessibility and HTML checks. Run it before every commit.
- A hook runs `.claude/hooks/check-html.py` after every edit to an .html file. Fix what it reports.
- `newsletter-reviewer` subagent: a fresh-eyes review before a pull request.
- `EDITIONS.md`: the log of every edition. Read it before starting or revising an edition, and add to it when you finish.

## Remembering things
Each session starts on a fresh cloud computer, so nothing outside this repository is kept. When the user says "remember this" or corrects a repeated mistake, add one short line under "Lessons learned" below and commit it. Tell the user it reaches new sessions only after this branch's pull request is merged.

## Lessons learned
- (none yet)
