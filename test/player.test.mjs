import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { waitFor } from '../src/js/wait-for.mjs'

function player() {
  let id = 'previous', duration = 90
  const ctx = vm.createContext({waitFor, setTimeout, window: {}, samples: { playNext() {}, createSamplePoints: () => [10,20,30] }})
  const source = readFileSync('src/js/player.js','utf8').replace(/^import .*\n/gm,'').replace('export default {','globalThis.api = {')
  vm.runInContext(source,ctx)
  ctx.video.isReady=true
  ctx.video.player={cueVideoById(){},getVideoData:()=>({video_id:id}),getDuration:()=>duration,seekTo(){}}
  ctx.gameData={currentGame:{track:{info:{ytId:'new'},sampleTimeStamps:[]}}}
  return {ctx,load:()=>{id='new'},unavailable:()=>{id='new';duration=0}}
}

test('new round does not reuse the previous video duration', async t=>{
  t.mock.timers.enable({apis:['setTimeout','Date']})
  const p=player();let settled=false
  const result=p.ctx.api.prepare().then(()=>{settled=true})
  await Promise.resolve()
  t.mock.timers.tick(100)
  await Promise.resolve()
  assert.equal(settled,false)
  p.load();t.mock.timers.tick(100)
  await result
  assert.deepEqual(Array.from(p.ctx.gameData.currentGame.track.sampleTimeStamps),[10,20,30])
})

test('unavailable video preparation rejects after a bounded wait', async t=>{
  t.mock.timers.enable({apis:['setTimeout','Date']})
  const p=player();p.unavailable()
  const result=p.ctx.api.prepare()
  await Promise.resolve()
  for(let i=0;i<150;i++)t.mock.timers.tick(100)
  await assert.rejects(result,/did not become ready/)
})
