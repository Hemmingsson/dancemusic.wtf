import { test } from 'node:test'
import assert from 'node:assert/strict'
import { waitFor } from '../src/js/wait-for.mjs'

test('waits for a later ready state', async t => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'] })
  let ready = false
  const result = waitFor(() => ready)
  ready = 42
  t.mock.timers.tick(100)
  assert.equal(await result, 42)
})

test('an unavailable video reaches a timeout instead of hanging', async t => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'] })
  const result = waitFor(() => false, { timeout: 300 })
  for (let i = 0; i < 3; i++) t.mock.timers.tick(100)
  await assert.rejects(result, /did not become ready/)
})

test('a player error rejects immediately', async () => {
  await assert.rejects(waitFor(() => { throw new Error('embed blocked') }), /embed blocked/)
})
