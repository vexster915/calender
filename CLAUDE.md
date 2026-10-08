# Orbit

Static PWA study planner: vanilla ES modules, no build step, no npm dependencies, no test suite. GitHub Pages deploys `main` (.github/workflows/pages.yml).

## Working rules (the owner set these to cut token use; follow them)
Every tool call re-sends this whole conversation, so cost = model calls × context size.
- Do exactly what was asked. No unrequested features, refactors, renames, docs or cleanup. If you spot something else worth doing, mention it in one line at the end; don't do it.
- If the request is ambiguous in a way that changes the work, ask one short question before building a guess.
- Read narrowly: grep -n to find the spot, then Read with offset/limit. Don't re-read a file already in context, and don't re-read after an edit to check it.
- Batch independent reads, searches and commands into one message. Chain shell steps with &&.
- Use subagents and workflows only when the user asks for them. Do searches yourself.
- Use a task list only for work with 5+ real steps: at most 5 items, updated only when a status changes.
- Web: start with 1-3 standard searches, read the best source, and stop once the question is answered.
- Verify with the cheapest check that proves the change, not a full sweep.
- After two failed attempts at the same fix, stop and say what you tried and what you need.
- Don't narrate between tool calls. Final reply: at most ~8 lines covering what changed, how it was checked, and anything left.

## Find your way cheaply
- Every `js/*.js` file opens with a comment saying what it owns. `grep -m1 -H "^//" js/*.js | cut -c1-150` is the whole map (about 1K tokens). Don't use `head` or `cat` on js/ files; some lines are 100K+ characters.
- Big files (views.js, study.js, ap.js, css/style.css are each ~80 KB, about 20K tokens): grep -n for the function or selector, then Read with offset/limit.
- Data files: never read them whole. Search them with `grep -c` or `grep -o '.\{0,80\}PATTERN.\{0,80\}'`:
  - js/azstandards.js is 446 KB, nearly all on one line, so a plain grep prints all of it.
  - js/dvoutcomes.js (129 KB, 3 lines), js/dvcatalog.js (155 KB), js/aptopics.js (59 KB, 5 lines), js/terms-cte.js, js/cur-*.js.
- vendor/pdfjs is third-party minified code. Don't open it.

## Rules that bite
- Adding or removing a js file means updating the ASSETS list in sw.js. Any shipped change means bumping `CACHE` (`orbit-vNN`) in sw.js, or phones keep the old version.
- The CSP in index.html blocks inline scripts and styles and any remote URL. Keep everything local.
- User text goes through textContent, never innerHTML (see util.js).
- README.md is the user-facing feature list. When a feature ships, add or edit one short section. Don't rewrite the file.

## Check a change
- Syntax: `node --check js/<file>.js`
- Run: `python3 -m http.server 8000`, then open http://localhost:8000. Only drive a browser (Playwright and Chromium are preinstalled in cloud sessions) when the change is UI.

## Compact instructions
When compacting, keep: the user's current goal, files changed with what changed, the branch, and the check command. Drop file contents and tool output.
