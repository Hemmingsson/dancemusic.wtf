/* global video, gameData, newRound */

import samples from './samples.js'
import equalizer from './equalizer.js'
import loadingIndicator from './loading-indicator.js'

/* ==========================================================================
   Video Player
   ========================================================================== */

let start = samples.playNext

global.video = {
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
  return new Promise((resolve, reject) => {
    samples.init()
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    setTimeout(() => { if (!video.isReady) reject() }, 10000)
    const readyInterval = () => { video.isReady ? resolve() : setTimeout(readyInterval, 100) }
    readyInterval()
  })
}

global.onYouTubeIframeAPIReady = () => {
  video.player = new YT.Player('videoPlayer', {
    height: '200',
    width: '260',
    playerVars: {
      playsinline: 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': newRound // Should be rebuilt to a propper error
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
  if (global.gameData.currentGame.scoreMultiplyer > 0) {
    global.gameData.currentGame.scoreMultiplyer -= 0.1
  }
}

// PREPAIR VIDEO SAMPLE POINTS
// -------------------------------------------------------

const prepare = () => new Promise((resolve, reject) => {
  // try again if video player is not yet loaded
  if (!video.isReady) {
    setTimeout(() => prepare(), 100)
    return
  }

  video.player.loadVideoById(gameData.currentGame.track.info.ytId, 40)
  video.player.setPlaybackQuality('small')
  // Wait untill duration is avalible
  const calculateTimeStamps = () => {
    if (video.player.getDuration() > 1) {
      video.player.pauseVideo()
      // Get Video Duration
      const duration = video.player.getDuration()
      // Create sampe Points
      gameData.currentGame.track.sampleTimeStamps = samples.createSamplePoints(duration, 3)
      // Set time to First Sample point
      video.player.seekTo(gameData.currentGame.track.sampleTimeStamps[0])
      resolve()
    } else {
      setTimeout(calculateTimeStamps, 150)
    }
  }
  calculateTimeStamps()
})

export default {
  init,
  prepare,
  start
}
