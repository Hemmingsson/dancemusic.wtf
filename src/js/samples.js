/* global video, gameData, toLate */

import defaults from './defaults.js'

/* ==========================================================================
   Sample Creation and Handeling
   ========================================================================== */

const init = (newRoundFn) => {
}

const createSamplePoints = (duration, sampleSize) => {
  sampleSize++
  const points = []
  for (let i = 0; i < sampleSize; i++) {
    const lol = duration / sampleSize
    points.push(lol * (i + 1))
  }
  points.splice(-1, 1)
  return points
}

const playNext = () => {
  const sampleTimeStamps = gameData.currentGame.track.sampleTimeStamps
  const currentSample = gameData.currentGame.track.currentSample
  video.player.seekTo(sampleTimeStamps[currentSample])
  video.mute(false)
  video.player.playVideo()
}

const update = () => {
  const currentTime = video.player.getCurrentTime()
  const currentSample = gameData.currentGame.track.currentSample
  const startPoint = gameData.currentGame.track.sampleTimeStamps[currentSample]

  if (video.isReady) {
    if (currentTime > startPoint + defaults.misc.sampleLenght) {
      gameData.currentGame.track.currentSample++
      // Play next sample if avalible
      if (currentSample !== 2) {
        // Play next sample if game is still active
        if (gameData.roundIsActive) {
          playNext()
        }
      } else {
        if (gameData.roundIsActive) {
          toLate()
        }
      }
    }
  }
}

const checker = () => {
  const interval = () => {
    if (video.isPlaying) {
      update()
      setTimeout(interval, 200)
    }
  }
  interval()
}

/* ==========================================================================
   EXPORTS
   ========================================================================== */

export default {
  createSamplePoints,
  playNext,
  checker,
  init
}
