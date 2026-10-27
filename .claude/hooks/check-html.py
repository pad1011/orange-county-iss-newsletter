#!/usr/bin/env python3
"""Quick check that runs automatically every time Claude edits or writes a file.

Claude Code calls this as a PostToolUse hook (see .claude/settings.json) and passes
the edit details as JSON on stdin. If the edited file is not an .html page, it does
nothing. Otherwise it looks for common mistakes (unclosed tags, images without alt
text, duplicate ids, missing files, fonts outside the Orange County web fonts, and
leftover placeholders). Problems are printed to stderr with exit code 2, which
Claude Code shows to Claude so it can fix them right away.

Run it by hand:  python3 .claude/hooks/check-html.py index.html
Standard library only, so nothing needs installing.
"""
import json
import os
import re
import sys
from html.parser import HTMLParser

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "param", "source", "track", "wbr"}
# Tags whose end tag HTML lets you leave out; skip them in the nesting check.
OPTIONAL_END = {"p", "li", "dt", "dd", "tr", "td", "th", "thead", "tbody",
                "tfoot", "option", "colgroup", "caption", "rt", "rp", "optgroup"}
ALLOWED_FONTS = {"arial", "helvetica", "verdana", "geneva", "sans-serif",
                 "inherit", "initial", "unset", "system-ui"}
PLACEHOLDER = re.compile(
    r"\[(?:CONFIRM|TODO|TBD|Month Year|YEAR)[^\]]*\]|\bTODO\b|\bTBD\b|lorem ipsum", re.I)


class Checker(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.problems = []
        self.ids = {}
        self.refs = []

    def where(self):
        return f"line {self.getpos()[0]}"

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "img" and "alt" not in a:
            self.problems.append(f"{self.where()}: <img> has no alt text (add alt=\"...\", or alt=\"\" if it is only decoration)")
        if a.get("id"):
            if a["id"] in self.ids:
                self.problems.append(f"{self.where()}: duplicate id=\"{a['id']}\" (first used on line {self.ids[a['id']]})")
            else:
                self.ids[a["id"]] = self.getpos()[0]
        for key in ("src", "href"):
            v = (a.get(key) or "").strip()
            if v and not re.match(r"^(https?:|mailto:|tel:|#|data:|//|javascript:)", v, re.I):
                self.refs.append((self.getpos()[0], v.split("#")[0].split("?")[0]))
        if tag == "a" and "href" in a and (a["href"] or "").strip() in ("", "#"):
            self.problems.append(f"{self.where()}: link has an empty href")
        if tag not in VOID:
            self.stack.append((tag, self.getpos()[0]))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack and self.stack[-1][0] == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                for open_tag, line in self.stack[i + 1:]:
                    if open_tag not in OPTIONAL_END:
                        self.problems.append(f"line {line}: <{open_tag}> is never closed before </{tag}> on {self.where()}")
                del self.stack[i:]
                return
        self.problems.append(f"{self.where()}: stray </{tag}> with no matching opening tag")


def line_of(text, index):
    return text.count("\n", 0, index) + 1


def main():
    manual = len(sys.argv) > 1  # run by hand: python3 check-html.py index.html
    if manual:
        path = os.path.abspath(sys.argv[1])
    else:
        try:
            data = json.load(sys.stdin)
        except Exception:
            return 0
        path = (data.get("tool_input") or {}).get("file_path") or ""
        # Only check pages inside this project, not scratch files elsewhere.
        project = os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or ""
        if project and not os.path.abspath(path).startswith(os.path.abspath(project) + os.sep):
            return 0
    if not path.lower().endswith((".html", ".htm")) or not os.path.isfile(path):
        return 0
    with open(path, encoding="utf-8", errors="replace") as f:
        text = f.read()

    c = Checker()
    c.feed(text)
    c.close()
    for tag, line in c.stack:
        if tag not in OPTIONAL_END and tag not in ("html", "body", "head"):
            c.problems.append(f"line {line}: <{tag}> is never closed")

    base = os.path.dirname(path)
    for line, ref in c.refs:
        if ref and not os.path.exists(os.path.join(base, ref)):
            c.problems.append(f"line {line}: file not found: {ref}")

    for m in re.finditer(r"font-family\s*:\s*([^;}<>\n]+)", text, re.I):
        # Names may be quoted ("Open Sans"); in a style="" attribute, stop at the closing quote.
        value = m.group(1)
        if value.count('"') % 2 == 1:
            value = value.rsplit('"', 1)[0]
        fonts = [x.strip().strip("'\"").lower() for x in value.split(",")]
        bad = [x for x in fonts if x and x not in ALLOWED_FONTS and not x.startswith("var(")]
        if bad:
            c.problems.append(f"line {line_of(text, m.start())}: font not in the Orange County web fonts (Arial/Verdana): {', '.join(bad)}")

    # Placeholders in what readers see (HTML comments are notes to editors, so skip them).
    visible = re.sub(r"<!--.*?-->", lambda m: re.sub(r"[^\n]", " ", m.group(0)), text, flags=re.S)
    for m in PLACEHOLDER.finditer(visible):
        c.problems.append(f"line {line_of(text, m.start())}: placeholder \"{m.group(0)}\" is still on the page. "
                          "Ask the user for the real wording; never make it up")

    if not c.problems and manual:
        print(f"OK: no problems found in {os.path.basename(path)}")
    if c.problems:
        name = os.path.basename(path)
        print(f"HTML check found {len(c.problems)} problem(s) in {name}. Fix the ones your edit caused, "
              "then tell the user in plain words what you fixed (mention any you could not fix):", file=sys.stderr)
        for p in c.problems[:25]:
            print(f"- {p}", file=sys.stderr)
        return 1 if manual else 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
