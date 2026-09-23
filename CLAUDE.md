# Inside ISS — project guide for Claude

Single-page web edition of the Orange County Information Systems & Services (ISS)
newsletter, hosted on GitHub Pages.

## How the project is built
- **Everything lives in `index.html`** — the HTML, the CSS (inside `<style>`), and a
  small amount of vanilla JavaScript (inside `<script>` at the bottom, for the mobile menu).
- **No framework, no build step, no dependencies.** Keep it that way.
- Images live in `assets/`.

## Page sections (in order)
Top bar (logo, nav, edition date) → hero → `#inside-iss` → `#iss-news` →
`#ai-at-work` → `#cyber-corner` → contact CTA → footer.

## Monthly update checklist
- Edition date in the top bar: search for `iss-edition`.
- Update section copy; do **not** change factual claims or stat numbers unless asked.

## Brand rules (Orange County Brand Guidelines, Jan 2026)
- Colors are CSS variables in `:root` — Orange `#EA7603` (mainly for the logo),
  Green `#008540`, Blue `#00629D`, Navy `#00497A`, top bar `#0b2c4d`.
- For colored text on white use the AA-safe tints: `--oc-blue-700`, `--oc-green-700`,
  `--oc-orange-700`.
- The full-color logo must sit inside a **white box** on dark or colored backgrounds.
  Never recolor or stretch it.
- Fonts: Arial/Helvetica (the brand's approved web-safe fallback).

## Don't regress
- Top bar stays opaque navy with white text (WCAG AA).
- Mobile hamburger menu: toggles `aria-expanded`, closes on link tap and Escape.
- "Skip to content" link and H1 → H2 → H3 heading order.
- Sections keep `scroll-margin-top` so the sticky bar doesn't cover headings.

## Previewing
Run `python3 -m http.server 8000` in the repo folder, then open
http://localhost:8000. Chromium + Playwright are available in cloud sessions for
screenshots (check both desktop and ~375px phone width).
