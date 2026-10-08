# lean

A Claude Code mod that keeps sessions cheap and on task. Every tool call re-sends
the whole conversation, so cost ≈ model calls × context size. This mod:

- caps subagents at 2 per request (6 if you mention agents or parallel work; say "no agent cap" to lift it)
- blocks workflows (mass agent fan-out) unless you ask for agents or parallel work
- caps task lists at 5 items per request and "Suggested task" cards at 1, and mutes the engine's "use the task tools" reminder
- refuses whole-file reads of text files over 60 KB (Claude greps, then reads the part it needs)
- shows `ctx 182K · $3.40` in the status line, and warns you and Claude at 150K and 300K tokens

The soft rules (do only what was asked, grep before reading, batch tool calls, short replies) are in the repo's CLAUDE.md under "Working rules", because CLAUDE.md always loads and this mod only loads in a trusted workspace.

Limits are constants at the top of `hooks/register.ts`. Tests: `claude plugin test .claude/skills/lean`.

Is it on? Ask Claude to Read js/views.js in full. A refusal starting with `lean:` means it's loaded.

## Use it in another repo

- Cloud sessions: copy `.claude/skills/lean/`, `.claude/skills/handoff/`, `.claude/settings.json` and the "Working rules" section of CLAUDE.md into that repo and commit them.
- Local terminal, for every repo on your machine: `/plugin install lean --marketplace vexster915/calender`, answer `y`, and pick the user scope. The desktop app's local Code tab loads it from then on. Paste the "Working rules" section into `~/.claude/CLAUDE.md` so the rules apply everywhere too.
