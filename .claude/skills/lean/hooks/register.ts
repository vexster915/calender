import type { Register } from 'claude-code'

// Lean: keeps Claude Code cheap and on task.
//
// Every tool call re-sends the whole conversation, so a session's cost is
// roughly (number of model calls) × (context size). This mod attacks both:
//   1. caps subagents, workflows, task-list items and "Suggested task" cards per request
//   2. refuses whole-file reads of big text files (grep, then Read with offset/limit)
//   3. mutes the engine's recurring "use the task tools" reminder
//   4. shows context size and cost, and warns (you and Claude) when it gets expensive
// The soft rules (scope, batching, short replies) live in CLAUDE.md, which always loads.

const AGENTS_DEFAULT = 2 // subagents per request when the user didn't ask for any
const AGENTS_ASKED = 6 // when the request mentions agents or parallel work
const TASKS_MAX = 5 // TaskCreate calls per request
const SIDE_TASKS_MAX = 1 // "Suggested task" cards per request
const BIG_READ_BYTES = 60_000 // about 15K tokens
const WARN_AT = [150_000, 300_000] // context sizes worth flagging

const ASKS_FOR_AGENTS = /\b(sub-?agents?|agents?|parallel|fan[- ]?out|workflows?|swarm)\b/i
const NO_CAP = /\bno (agent )?cap\b|\bunlimited agents\b/i
const TEXT_FILE = /\.(c|cc|cpp|cs|css|csv|go|h|html?|java|js|json|jsonl|jsx|kt|log|md|mjs|cjs|php|py|rb|rs|scss|sh|sql|svg|swift|toml|ts|tsx|txt|vue|xml|ya?ml)$/i
// Prompts Claude raises for itself; a budget lasts until the person's next request.
const NOT_A_REQUEST = new Set(['task-notification', 'auto-continuation', 'scheduled-trigger'])

const kTokens = (n: number) => `${Math.round(n / 1000)}K`
const baseName = (path: string) => path.slice(Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')) + 1)

export const register: Register = on => {
  let agentCap = AGENTS_DEFAULT
  let agents = 0
  let tasks = 0
  let sideTasks = 0
  let contextTokens = 0
  let warned = 0 // WARN_AT levels already toasted to the person
  let nudged = 0 // WARN_AT levels already told to Claude

  on('prompt.submit', ($, e, next) => {
    if (NOT_A_REQUEST.has(e.origin?.kind ?? '')) return next(e)

    agents = 0
    tasks = 0
    sideTasks = 0
    agentCap = NO_CAP.test(e.text) ? Infinity : ASKS_FOR_AGENTS.test(e.text) ? AGENTS_ASKED : AGENTS_DEFAULT

    const level = WARN_AT.filter(w => contextTokens >= w).length
    if (level <= nudged) return next(e)
    nudged = level
    const note =
      `lean: this conversation is about ${kTokens(contextTokens)} tokens and every tool call re-sends all of it. ` +
      'Keep this request tight. If it is unrelated to the earlier work, tell the user in one line to run /handoff and start a fresh session.'
    return next({ ...e, context: [...(e.context ?? []), note] })
  })

  on('tool.call', { tool: 'Agent' }, ($, e, next) => {
    if (agents >= agentCap) {
      return {
        deny:
          `lean: this request's subagent limit (${agentCap}) is used up. Do the rest yourself with Grep/Read, or ask the user. ` +
          'They can lift it by saying "no agent cap".',
      }
    }
    agents += 1
    return next(e)
  })

  on('tool.call', { tool: 'Workflow' }, ($, e, next) =>
    agentCap > AGENTS_DEFAULT
      ? next(e)
      : { deny: 'lean: a workflow spawns many agents. Only start one when the user asks for agents or parallel work.' },
  )

  on('tool.call', { tool: 'TaskCreate' }, ($, e, next) => {
    if (tasks >= TASKS_MAX) {
      return { deny: `lean: ${TASKS_MAX} tasks is the limit per request. Work through the list you have.` }
    }
    tasks += 1
    return next(e)
  })

  on('tool.call', { tool: 'mcp__ccd_session__spawn_task' }, ($, e, next) => {
    if (sideTasks >= SIDE_TASKS_MAX) {
      return { deny: 'lean: one suggested side task per request. Mention anything else in one line in your reply.' }
    }
    sideTasks += 1
    return next(e)
  })

  on('tool.call', { tool: 'Read' }, async ($, e, next) => {
    if (e.offset !== undefined || e.limit !== undefined || !TEXT_FILE.test(e.file_path)) return next(e)
    const stat = await $.fs.stat(e.file_path).catch(() => undefined)
    if (stat === undefined || stat.kind !== 'file' || stat.size <= BIG_READ_BYTES) return next(e)
    return {
      deny:
        `lean: ${baseName(e.file_path)} is ${Math.round(stat.size / 1000)} KB (about ${kTokens(stat.size / 4)} tokens). ` +
        'Find the part you need with grep -n, then Read with offset/limit. If you really need all of it, pass limit explicitly.',
    }
  })

  // The engine's periodic nudge to use the task tools; it breeds task lists nobody asked for.
  on('prompt.attachment', { type: 'todo_reminder' }, () => ({ text: null }))

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    const usage = await $.session.usage().catch(() => undefined)
    if (usage?.context.tokens === undefined) return done

    contextTokens = usage.context.tokens
    const level = WARN_AT.filter(w => contextTokens >= w).length
    if (level < warned) {
      // A /clear or compaction shrank the context: arm the warnings again.
      warned = level
      nudged = Math.min(nudged, level)
    }
    const cost = usage.cost ? ` · $${usage.cost.usd.toFixed(2)}` : ''
    $.ui.status(`ctx ${kTokens(contextTokens)}${cost}${level > 0 ? ' · time for /handoff' : ''}`)
    if (level > warned) {
      warned = level
      $.ui.toast(
        `Context is ${kTokens(contextTokens)} tokens: every message re-sends all of it. ` +
          'Finish this task, then run /handoff and start a fresh session.',
      )
    }
    return done
  })
}
