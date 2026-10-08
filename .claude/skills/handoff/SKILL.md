---
name: handoff
description: Wrap the current work into a short, paste-ready brief so it can continue in a fresh session with a small context. Use when the user says handoff, wrap up, "new session", or the context has grown large, or before switching to an unrelated task.
---

Write a handoff brief, then stop. Do no other work.

1. If there are uncommitted changes the user wanted, commit and push them, and note the branch. Use only git for this; don't re-read files to write the brief. Work from what you already know.
2. Reply with one fenced block of at most 15 lines, written for a fresh Claude session that knows nothing:

```
Goal: <one line>
Branch: <name>. First run: git fetch origin <name> && git checkout <name>
Done: <bullets, with file:line where it saves a search>
Next: <the next 1-3 concrete steps>
Gotchas: <only things that cost time to discover; omit if none>
Check with: <one command that proves it works>
```

3. Under the block, add one line: "Start a new session (or /clear), then paste this as your first message."
