/* global video */
/* global defaults */
/* global gameData */
/* global states */

/* ==========================================================================
   Sample Creation and Handeling
   ========================================================================== */

var createSamplePoints = function (duration, sampleSize) {
  sampleSize++
  var points = []
  for (var i = 0; i < sampleSize; i++) {
    var lol = duration / sampleSize
    points.push(lol * (i + 1))
  }
  points.splice(-1, 1)
  return points
}

var playNextSample = function () {
  var sampleTimeStamps = gameData.currentGame.track.sampleTimeStamps
  var currentSample = gameData.currentGame.track.currentSample
  video.player.seekTo(sampleTimeStamps[currentSample])
  video.mute(false)
  video.player.playVideo()
}

var sampleHandeling = function () {
  var currentTime = video.player.getCurrentTime()
  var currentSample = gameData.currentGame.track.currentSample
  var startPoint = gameData.currentGame.track.sampleTimeStamps[currentSample]

  if (video.isReady) {
    if (currentTime > startPoint + defaults.sampleLenght) {
      gameData.currentGame.track.currentSample++
      // Play next sample if avalible
      if (currentSample !== 2) {
        // Play next sample if game is still active
        if (gameData.roundIsActive) {
          playNextSample()
        }
      } else {
        if (gameData.roundIsActive) {
          states.noAnswer()
        }
      }
    }
  }
}

/* ==========================================================================
   EXPORTS
   ========================================================================== */

module.exports = {
  createSamplePoints,
  playNextSample,
  sampleHandeling
}
