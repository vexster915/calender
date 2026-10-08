import { expect, test } from 'claude-code/testing'
import type { On } from 'claude-code'
import type { Engine } from 'claude-code/testing'

// The engine beneath the plugin: prompts pass through, tools "run", and a
// stat answers a file of the size the test names.
const engine = (on: On, size = 1_000) => {
  const contexts: (readonly string[] | undefined)[] = []
  on('prompt.submit', ($, e) => {
    contexts.push(e.context)
    return { text: e.text, context: e.context }
  })
  on('tool.call', () => ({ result: 'ran' }))
  on('fs.stat', () => ({ value: { kind: 'file' as const, size, mtimeMs: 0, isLink: false } }))
  return contexts
}

const ask = ($: Engine, text: string) => $.prompt.submit({ text, wait: false, origin: { kind: 'composer' } })

const spawn = ($: Engine) =>
  $.tool.call({ tool: 'Agent', description: 'look', prompt: 'look around', subagent_type: 'Explore' })

test('caps subagents per request and resets on the next one', async ($, on) => {
  engine(on)
  await ask($, 'fix the date picker')
  expect((await spawn($)).deny).toBeUndefined()
  expect((await spawn($)).deny).toBeUndefined()
  expect((await spawn($)).deny).toContain('subagent limit (2)')

  await ask($, 'and the header')
  expect((await spawn($)).deny).toBeUndefined()
})

test('asking for agents raises the cap; "no agent cap" lifts it', async ($, on) => {
  engine(on)
  await ask($, 'use subagents to research this')
  for (let i = 0; i < 6; i++) expect((await spawn($)).deny).toBeUndefined()
  expect((await spawn($)).deny).toContain('limit (6)')

  await ask($, 'run the tournament, no agent cap')
  for (let i = 0; i < 20; i++) expect((await spawn($)).deny).toBeUndefined()
})

test('workflows need an explicit ask', async ($, on) => {
  engine(on)
  await ask($, 'find business ideas')
  expect((await $.tool.call({ tool: 'Workflow', name: 'x' })).deny).toContain('workflow')
  await ask($, 'run it as a workflow in parallel')
  expect((await $.tool.call({ tool: 'Workflow', name: 'x' })).deny).toBeUndefined()
})

test('caps task-list items per request', async ($, on) => {
  engine(on)
  await ask($, 'build the thing')
  const task = () => $.tool.call({ tool: 'TaskCreate', subject: 's', description: 'd' })
  for (let i = 0; i < 5; i++) expect((await task()).deny).toBeUndefined()
  expect((await task()).deny).toContain('5 tasks')
})

test('refuses whole-file reads of big text files only', async ($, on) => {
  engine(on, 446_000)
  await ask($, 'x')
  const big = await $.tool.call({ tool: 'Read', file_path: '/repo/js/azstandards.js' })
  expect(big.deny).toContain('446 KB')
  expect((await $.tool.call({ tool: 'Read', file_path: '/repo/js/azstandards.js', offset: 1, limit: 50 })).deny).toBeUndefined()
  expect((await $.tool.call({ tool: 'Read', file_path: '/repo/shot.png' })).deny).toBeUndefined()
})

test('lets small files through', async ($, on) => {
  engine(on, 5_000)
  await ask($, 'x')
  expect((await $.tool.call({ tool: 'Read', file_path: '/repo/js/util.js' })).deny).toBeUndefined()
})

test('a big context warns once, and tells Claude on the next request', async ($, on) => {
  const contexts = engine(on)
  const toasts: string[] = []
  on('session.usage', () => ({ value: { startedAt: 0, context: { tokens: 210_000, window: 1_000_000 }, rateLimits: [] } }))
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('ui.status', () => ({ value: undefined }))
  on('ui.toast', ($, e) => {
    toasts.push(String(e.text))
    return { value: undefined }
  })
  const turn = { answer: 'ok', durationMs: 1, isAborted: false, turnId: 't', reason: 'answer' } as const

  await ask($, 'first')
  await $.turn.complete(turn)
  await $.turn.complete(turn)
  expect(toasts.length).toBe(1)
  expect(toasts[0]).toContain('210K')

  await ask($, 'second')
  await ask($, 'third')
  expect(contexts[0]).toBeUndefined()
  expect(contexts[1]?.[0]).toContain('/handoff')
  expect(contexts[2]).toBeUndefined()
})

test("an agent finishing doesn't refill the budget; the person's next request does", async ($, on) => {
  engine(on)
  await ask($, 'fix it')
  await spawn($)
  await spawn($)
  await $.prompt.submit({ text: 'agent done', wait: false, origin: { kind: 'task-notification' } })
  expect((await spawn($)).deny).toContain('limit (2)')
})
