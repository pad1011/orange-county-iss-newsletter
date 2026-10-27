# Edition log

One entry per edition, newest first. Claude reads this before starting or revising an edition and adds to it when it finishes. Keep each entry short.

Open question for the editor: every edition so far is labeled "Edition 1" (June and July 2026). Decide how editions should be numbered (for example, July = Edition 2), and Claude will record the rule here.

## Known problems on the page (not fixed yet)
The page check (`/verify`) reports these 9 "must fix" items on the July 2026 page. They were there before the Claude setup was added, so a FAIL that lists only these is expected until they're fixed. When one is fixed, remove it here.
1. The phone menu button has no `type="button"`.
2-3. A screen-reader label (`aria-label`) is on the topics line and on the stat boxes, where screen readers ignore it.
4. The orange light around "Contact Us" moves forever with no pause button (WCAG 2.2.2). How to fix it is a design choice for the editor: play once, play when scrolled into view, or add a pause button.
5-9. The orange keyboard focus outline is too faint (2.96:1, needs 3:1) on the logo link and the four top-menu links.

## July 2026 (label: "Edition 1 · July 2026")
- Published: 2026-07-14 (commit 66b3b22, "Apply July newsletter revisions").
- Changed: hero subtitle replaced by a topics line; "In this edition" text rewritten; ISS News story "Helping Staff Find Answers Faster with Custom GPT" removed; Quick Tip rewritten (Support Center phone and email, Sophos download link); Cybersecurity Corner VPN text rewritten and the story "Before Purchasing Software, Start with ISS" removed. Removed stories can be brought back from the June version in git history.
- Source of copy: July reviewer revisions (details weren't recorded at the time).
- Approved by: (not recorded)
- Note: there have been no updates to the page since July 14, 2026.

## June 2026 (label: "Edition 1 · June 2026")
- Built 2026-06-05 to 06-06: first web edition, brand redesign, official logos, sticky section menu, phone menu (commits 3d409a7 to 81c8461).
- Updated 2026-06-12 (commit 59ef744): copy revised from June feedback (monthly framing, ServiceNow, Sophos wording) and the animated Contact Us band was added.
- Approved by: (not recorded)
- Note: the June page is no longer live. It can be restored into `archive/2026-06/` from git history if wanted.
