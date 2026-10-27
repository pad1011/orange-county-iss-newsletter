#!/usr/bin/env node
// Inside ISS page check.
// Takes desktop and phone screenshots of the newsletter page and reports problems
// in plain English: WCAG 2.1 AA accessibility (axe-core), HTML errors (html-validate),
// broken images, missing files, broken in-page links, sideways scrolling at 320px,
// animations that never stop, keyboard focus rings that are missing or too faint,
// leftover placeholder text, and oversized images.
//
// Usage:   node check.cjs [page.html ...] [--out <folder>]
// Default: checks index.html in the current folder; screenshots go to a temp folder.
// Exit:    0 = nothing that must be fixed, 1 = must-fix problems found,
//          2 = the check itself could not run.
//
// Nothing is installed into the repository. axe-core and html-validate are installed
// once per session into a temp folder (the repo stays a plain static site).

'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

const AXE_VERSION = '4.14.0';
const HTML_VALIDATE_VERSION = '11.17.0';
const MAX_IMAGE_KB = 500;
const PLACEHOLDER = /\[(?:CONFIRM|TODO|TBD|Month Year|YEAR)[^\]]*\]|\bTODO\b|\bTBD\b|lorem ipsum/i;
const VIEWPORTS = { desktop: { width: 1280, height: 900 }, phone: { width: 390, height: 844 } };

// ---------- arguments ----------
const args = process.argv.slice(2);
let outDir = path.join(os.tmpdir(), 'inside-iss-check');
const pages = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out') outDir = path.resolve(args[++i]);
  else pages.push(path.resolve(args[i]));
}
if (!pages.length) pages.push(path.resolve('index.html'));
fs.mkdirSync(outDir, { recursive: true });

const mustFix = [];
const shouldFix = [];
const humanLook = [];
const skipped = [];

// ---------- helper tools (installed outside the repo) ----------
function ensureTools() {
  const dir = process.env.INSIDE_ISS_TOOLS || path.join(os.tmpdir(), 'inside-iss-tools');
  const axePath = path.join(dir, 'node_modules', 'axe-core', 'axe.min.js');
  const hvBin = path.join(dir, 'node_modules', 'html-validate', 'bin', 'html-validate.mjs');
  if (!fs.existsSync(axePath) || !fs.existsSync(hvBin)) {
    fs.mkdirSync(dir, { recursive: true });
    const r = spawnSync('npm', ['install', '--no-save', '--no-audit', '--no-fund', '--loglevel=error',
      '--prefix', dir, `axe-core@${AXE_VERSION}`, `html-validate@${HTML_VALIDATE_VERSION}`],
      { encoding: 'utf8', timeout: 180000 });
    if (r.status !== 0) {
      skipped.push('Could not download the accessibility and HTML checkers (no internet?). ' +
        'Only the basic checks ran. Details: ' + (r.stderr || r.error || '').toString().trim().split('\n').pop());
    }
  }
  return {
    axePath: fs.existsSync(axePath) ? axePath : null,
    hvBin: fs.existsSync(hvBin) ? hvBin : null,
  };
}

function loadPlaywright() {
  try { return require('playwright'); } catch (e) { /* try the global install next */ }
  try {
    const root = execSync('npm root -g', { encoding: 'utf8' }).trim();
    return require(path.join(root, 'playwright'));
  } catch (e) { return null; }
}

// ---------- checks that only read the file ----------
function lineOf(text, index) { return text.slice(0, index).split('\n').length; }

function staticChecks(file) {
  const html = fs.readFileSync(file, 'utf8');
  const base = path.dirname(file);
  const name = path.basename(file);
  // Ignore HTML comments so notes to editors don't count as page content.
  const visible = html.replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' '));

  // Local files referenced by src / href / CSS url()
  const refs = [];
  for (const m of visible.matchAll(/\b(?:src|href)\s*=\s*"([^"]*)"/gi)) refs.push([m[1], m.index]);
  for (const m of visible.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) refs.push([m[1], m.index]);
  const seenRefs = new Set();
  for (const [raw, idx] of refs) {
    const ref = raw.trim();
    if (!ref || /^(?:https?:|mailto:|tel:|data:|#|\/\/|javascript:)/i.test(ref)) continue;
    const clean = decodeURIComponent(ref.split('#')[0].split('?')[0]);
    if (!clean || seenRefs.has(clean)) continue;
    seenRefs.add(clean);
    const target = path.join(base, clean);
    if (!fs.existsSync(target)) {
      mustFix.push(`${name} line ${lineOf(html, idx)}: the file "${clean}" does not exist, so it will show as broken.`);
    } else if (/\.(?:jpe?g|png|gif|webp|avif|svg)$/i.test(clean)) {
      const kb = Math.round(fs.statSync(target).size / 1024);
      if (kb > MAX_IMAGE_KB) shouldFix.push(`Image "${clean}" is ${kb} KB. Keep images under ${MAX_IMAGE_KB} KB so the page loads fast on phones.`);
    }
  }

  // In-page links (#section) must point at an id that exists
  const ids = new Set([...visible.matchAll(/\bid\s*=\s*"([^"]+)"/gi)].map(m => m[1]));
  for (const m of visible.matchAll(/\bhref\s*=\s*"#([^"]*)"/gi)) {
    if (m[1] && !ids.has(m[1])) mustFix.push(`${name} line ${lineOf(html, m.index)}: the link "#${m[1]}" jumps to a section that does not exist.`);
  }

  // Leftover placeholders in what readers see
  const text = visible.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, m => m.replace(/[^\n]/g, ' '));
  for (const m of text.matchAll(new RegExp(PLACEHOLDER.source, 'gi'))) {
    mustFix.push(`${name} line ${lineOf(html, m.index)}: placeholder "${m[0]}" is still on the page. Ask the user for the real wording; do not make it up.`);
  }

  // External links: the cloud computer often can't reach them, so list them for a person to click.
  const external = [...new Set([...visible.matchAll(/\bhref\s*=\s*"(https?:[^"]+)"/gi)].map(m => m[1]))];
  if (external.length) humanLook.push(`Click each outside link once to make sure it still works: ${external.join(' , ')}`);
  const mail = [...new Set([...visible.matchAll(/\bhref\s*=\s*"((?:mailto|tel):[^"]+)"/gi)].map(m => m[1]))];
  if (mail.length) humanLook.push(`Confirm these email addresses / phone numbers are current: ${mail.join(' , ')}`);
}

// ---------- HTML validity ----------
function htmlValidate(hvBin, file) {
  if (!hvBin) return;
  const cfg = path.join(__dirname, 'htmlvalidate.json');
  const r = spawnSync(process.execPath, [hvBin, '--config', cfg, '--formatter', 'json', file], { encoding: 'utf8' });
  let results;
  try { results = JSON.parse(r.stdout || '[]'); } catch (e) {
    skipped.push('The HTML checker gave an unreadable answer: ' + (r.stderr || r.stdout).trim().slice(0, 200));
    return;
  }
  for (const f of results) {
    for (const m of f.messages) {
      const msg = `${path.basename(file)} line ${m.line}: ${m.message} (rule "${m.ruleId}", see https://html-validate.org/rules/${m.ruleId}.html)`;
      (m.severity === 2 ? mustFix : shouldFix).push('[HTML] ' + msg);
    }
  }
}

// ---------- motion and keyboard focus (things axe does not test) ----------
async function motionAndFocusChecks(page) {
  const found = [];
  // WCAG 2.2.2 Pause, Stop, Hide: motion that starts by itself and lasts over 5 seconds
  // needs a pause button. (Turning it off for "reduce motion" users is good but not enough.)
  const anims = await page.evaluate(() => document.getAnimations()
    .map(a => ({ name: a.animationName || 'animation', end: a.effect.getComputedTiming().endTime }))
    .filter(a => a.end > 5000));
  for (const a of anims) {
    found.push(`the "${a.name}" animation runs ${a.end === Infinity ? 'forever' : Math.round(a.end / 1000) + ' seconds'} with no way to pause it (WCAG 2.2.2). Make it stop within 5 seconds, or add a pause button`);
  }
  // WCAG 2.4.7 + 1.4.11: every keyboard stop needs a visible focus ring with 3:1 contrast.
  const seen = new Set();
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      const nums = s => (s.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]) => { const c = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b); };
      const ratio = (x, y) => { const [hi, lo] = [lum(x), lum(y)].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };
      const cs = getComputedStyle(e);
      let bg = null;
      for (let n = e.parentElement; n; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (s.backgroundImage !== 'none') break; // gradient or photo: can't measure, check by eye
        const v = nums(s.backgroundColor);
        if (v.length === 3 || (v.length === 4 && v[3] === 1)) { bg = v.slice(0, 3); break; }
      }
      const has = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
      const name = `${e.tagName.toLowerCase()} "${(e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 45)}"`;
      return { name, has, shadow: cs.boxShadow !== 'none',
        ratio: has && cs.outlineStyle !== 'auto' && bg ? ratio(nums(cs.outlineColor).slice(0, 3), bg) : null };
    });
    if (!f || seen.has(f.name)) continue;
    seen.add(f.name);
    if (!f.has && !f.shadow) found.push(`keyboard users can't see where they are on ${f.name}: it has no focus outline (WCAG 2.4.7)`);
    else if (f.ratio !== null && f.ratio < 3) found.push(`the keyboard focus outline on ${f.name} is too faint: ${f.ratio.toFixed(2)}:1 against its background, needs 3:1 (WCAG 1.4.11). The AA-safe orange #b9560a or navy #00497A work`);
  }
  return found;
}

// ---------- browser checks + screenshots ----------
async function browserChecks(pw, axePath, file) {
  const slug = path.basename(path.dirname(file)) === path.basename(process.cwd())
    ? path.basename(file, '.html')
    : path.relative(process.cwd(), file).replace(/[\\/]/g, '-').replace(/\.html?$/i, '');
  const name = path.relative(process.cwd(), file) || path.basename(file);
  const browser = await pw.chromium.launch();
  const axeSeen = new Map();
  const problemSeen = new Set();
  const shots = [];
  try {
    for (const [view, viewport] of Object.entries(VIEWPORTS)) {
      const page = await browser.newPage({ viewport });
      const problems = [];
      page.on('pageerror', e => problems.push(`a script error happened: ${e.message}`));
      page.on('requestfailed', r => { if (r.url().startsWith('file:')) problems.push(`could not load ${decodeURIComponent(r.url().replace(/^file:\/\//, ''))}`); });
      await page.goto('file://' + file, { waitUntil: 'load' });
      await page.waitForTimeout(300);

      const facts = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src')),
        missingAlt: [...document.images].filter(i => !i.hasAttribute('alt')).map(i => i.getAttribute('src')),
        lang: document.documentElement.getAttribute('lang'),
        title: document.title,
      }));
      if (view === 'phone' && facts.overflow > 1) problems.push(`the page scrolls sideways on a phone (content is ${facts.overflow}px too wide)`);
      if (view === 'phone') {
        // WCAG 1.4.10 Reflow: no sideways scrolling at 320 CSS px (small phones, 400% zoom).
        await page.setViewportSize({ width: 320, height: 700 });
        const narrow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (narrow > 1) problems.push(`at 320px wide (small phones, or zoomed in 400%) the page scrolls sideways by ${narrow}px (WCAG 1.4.10)`);
        await page.setViewportSize(viewport);
      }
      if (view === 'desktop') {
        problems.push(...await motionAndFocusChecks(page));
      }
      for (const s of facts.brokenImages) problems.push(`image "${s}" is broken`);
      for (const s of facts.missingAlt) problems.push(`image "${s}" has no alt text (screen readers need a short description, or alt="" if it is only decoration)`);
      if (view === 'desktop' && !facts.lang) problems.push('the page does not say what language it is in (<html lang="en">)');
      if (view === 'desktop' && !facts.title) problems.push('the page has no <title>');
      for (const p of problems) {
        if (problemSeen.has(p)) continue; // same problem on desktop and phone: report once
        problemSeen.add(p);
        mustFix.push(`${name} (${view}): ${p}.`);
      }

      if (axePath) {
        await page.addScriptTag({ path: axePath });
        const res = await page.evaluate(async () => {
          // eslint-disable-next-line no-undef
          const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } });
          const pick = v => ({ id: v.id, impact: v.impact, help: v.help, url: v.helpUrl,
            nodes: v.nodes.map(n => ({ target: n.target.join(' '), why: (n.failureSummary || '').split('\n').slice(1, 2).join(' ').trim() })) });
          return { violations: r.violations.map(pick), incomplete: r.incomplete.map(pick) };
        });
        for (const v of res.violations) {
          for (const n of v.nodes) {
            const key = `${v.id}|${n.target}`;
            if (axeSeen.has(key)) continue;
            axeSeen.set(key, true);
            const msg = `[Accessibility] ${name} (${view}): ${v.help}. Where: ${n.target}. ${n.why} More: ${v.url}`;
            (v.impact === 'critical' || v.impact === 'serious' ? mustFix : shouldFix).push(msg);
          }
        }
        if (view === 'desktop') {
          const contrast = res.incomplete.find(v => v.id === 'color-contrast');
          if (contrast) humanLook.push(`The scanner could not measure text contrast in ${contrast.nodes.length} spots (text over gradients or photos). Look at the screenshots: all text must be easy to read.`);
        }
      }

      const shot = path.join(outDir, `${slug}-${view}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      shots.push(shot);
      await page.close();
    }
  } finally {
    await browser.close();
  }
  return shots;
}

// ---------- run ----------
(async () => {
  const tools = ensureTools();
  if (!tools.axePath) skipped.push('Accessibility scan (axe-core) did not run.');
  if (!tools.hvBin) skipped.push('HTML error check (html-validate) did not run.');
  const pw = loadPlaywright();
  if (!pw) skipped.push('Screenshots and browser checks did not run: Playwright is not installed on this computer.');

  const shots = [];
  for (const file of pages) {
    if (!fs.existsSync(file)) { console.error(`Can't find ${file}`); process.exit(2); }
    staticChecks(file);
    htmlValidate(tools.hvBin, file);
    if (pw) shots.push(...await browserChecks(pw, tools.axePath, file));
  }

  const list = (title, items) => {
    console.log(`\n${title} (${items.length})`);
    if (!items.length) console.log('  none');
    items.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
  };
  console.log(`Inside ISS page check: ${pages.map(p => path.relative(process.cwd(), p) || p).join(', ')}`);
  console.log(`Checked against: WCAG 2.1 AA (axe-core ${AXE_VERSION} plus motion, focus and 320px checks), html-validate ${HTML_VALIDATE_VERSION}, plus newsletter rules.`);
  if (shots.length) { console.log('\nScreenshots (look at these, and show them to the user):'); shots.forEach(s => console.log('  ' + s)); }
  list('MUST FIX before publishing', mustFix);
  list('SHOULD FIX', shouldFix);
  list('NEEDS A PERSON TO LOOK', humanLook);
  if (skipped.length) list('CHECKS THAT DID NOT RUN', skipped);
  console.log(`\nRESULT: ${mustFix.length ? 'FAIL: fix the "must fix" items first.' : 'PASS: no must-fix problems found.'}`);
  console.log('Automated checks catch only part of accessibility problems. The screenshots and the "needs a person" list still matter.');
  process.exit(mustFix.length ? 1 : 0);
})().catch(e => { console.error('The check could not run: ' + e.message); process.exit(2); });
