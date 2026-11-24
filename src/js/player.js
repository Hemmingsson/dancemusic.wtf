import { waitFor } from './wait-for.mjs'
/* global video, gameData, newRound */

import samples from './samples.js'
import equalizer from './equalizer.js'
import loadingIndicator from './loading-indicator.js'

/* ==========================================================================
   Video Player
   ========================================================================== */

let start = samples.playNext
let playerError = null
let initPromise

globalThis.video = {
  player: null,
  isReady: false,
  isPlaying: false,
  isMusicPlaying: false,
  isMuted: false,
  mute (mute) {
    if (mute) {
      this.isMuted = true
      this.player.mute()
    } else {
      this.isMuted = false
      this.player.unMute()
    }
  }
}

const init = () => {
  if (video.isReady) return Promise.resolve()
  if (initPromise) return initPromise
  playerError = null
  if (globalThis.YT?.Player) globalThis.onYouTubeIframeAPIReady()
  else if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.onerror = () => { tag.remove(); playerError = new Error('Could not load YouTube') }
    document.head.appendChild(tag)
  }
  initPromise = waitFor(() => {
    if (playerError) throw playerError
    return video.isReady
  }).catch(error => {
    if (!globalThis.YT?.Player) document.querySelector('script[src="https://www.youtube.com/iframe_api"]')?.remove()
    throw error
  }).finally(() => { initPromise = null })
  return initPromise
}

globalThis.onYouTubeIframeAPIReady = () => {
  video.player?.destroy?.()
  video.player = new YT.Player('videoPlayer', {
    height: '200',
    width: '260',
    playerVars: {
      playsinline: 1,
      origin: window.location.origin
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': e => { playerError = new Error('YouTube playback error: ' + e.data) }
    }
  })
}

const onPlayerReady = () => {
  video.isReady = true
  video.player.setVolume(100)
  video.mute(true)
  whenMusicIsPlaying()
}

const onPlayerStateChange = e => {
  if (e.data === 1) {
    video.isPlaying = true
    samples.checker()
    loadingIndicator.blinkCurrentSample()
  } else {
    video.isPlaying = false
  }
}

// DO STUFF ONLY WHEN MUSIC IS ACTUALY PLAYING
// -------------------------------------------------------
const whenMusicIsPlaying = () => {
  const interval = () => {
    if (video.isPlaying && !video.isMuted) {
      equalizer.animate(true)
      updateScoreMultiplyer()
      video.isMusicPlaying = true
    } else {
      video.isMusicPlaying = false
      equalizer.animate(false)
    }
    setTimeout(interval, 100)
  }
  interval()
}

const updateScoreMultiplyer = () => {
  if (globalThis.gameData?.currentGame.scoreMultiplyer > 0) {
    globalThis.gameData.currentGame.scoreMultiplyer -= 0.1
  }
}

// PREPAIR VIDEO SAMPLE POINTS
// -------------------------------------------------------

const prepare = async () => {
  await init()
  playerError = null
  const id = gameData.currentGame.track.info.ytId
  video.player.cueVideoById(id)
  const duration = await waitFor(() => {
    if (playerError) throw playerError
    // The previous round may still have a duration until the new video loads.
    return video.player.getVideoData().video_id === id && video.player.getDuration() > 1 && video.player.getDuration()
  })
  gameData.currentGame.track.sampleTimeStamps = samples.createSamplePoints(duration, 3)
  video.player.seekTo(gameData.currentGame.track.sampleTimeStamps[0])
}

export default {
  init,
  prepare,
  start
}
