/* global video */
/* global gameData */
/* global game */

var equalizer = require('./equalizer.js')
var samples = require('./samples.js')

/* ==========================================================================
   Video Player
   ========================================================================== */

global.video = {
  player: null,
  isReady: false,
  isPlaying: false,
  isMuted: false,
  mute: function (mute) {
    if (mute) {
      this.isMuted = true
      this.player.mute()
    } else {
      this.isMuted = false
      this.player.unMute()
    }
  }
}

// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script')
tag.src = 'https://www.youtube.com/iframe_api'
var firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

global.onYouTubeIframeAPIReady = function () {
  video.player = new YT.Player('videoPlayer', {
    height: '200',
    width: '300',
    playerVars: {
      playsinline: 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onPlayerError
    }
  })
}

var onPlayerReady = function () {
  video.isReady = true
  video.player.setVolume(100)
  video.mute(true)
  whenMusicIsPlaying()
}

var onPlayerStateChange = function (e) {
  if (e.data === 1) {
    video.isPlaying = true
  } else {
    video.isPlaying = false
  }

  if (e.data === -1) {

  } else if (e.data === 1) {
    // playing
    var updater = function () {
      if (video.player.getPlayerState() === 1) {
        samples.sampleHandeling()
        setTimeout(updater, 100)
      }
    }
    updater()
  }
}

// NEW ROUND ON ERROR
// -------------------------------------------------------
var onPlayerError = function (e) {
  game.newRound()
}

// WAIT UNTILL VIDEO PLAYER IS READY
// -------------------------------------------------------
var waitForVideoPlayer = function (callback) {
  var musicPlayerReady = setInterval(function () {
    if (video.player !== undefined && video.isReady) {
      clearInterval(musicPlayerReady)
      callback()
    }
  }, 100)
}

// DO STUFF ONLY WHEN MUSIC IS ACTUALY PLAYING
// -------------------------------------------------------
var whenMusicIsPlaying = function () {
  var updater = function () {
    if (video.isPlaying && !video.isMuted) {
      equalizer.animate(true)
    } else {
      equalizer.animate(false)
    }
    setTimeout(updater, 300)
  }
  updater()
}

// PREPAIR VIDEO SAMPLE POINTS
// -------------------------------------------------------
var prepare = function () {
  return new Promise(function (resolve, reject) {
    video.player.loadVideoById(gameData.currentGame.track.info.ytId, 40)
    video.player.setPlaybackQuality('small')
    // Wait untill duration is avalible
    var calculateTimeStamps = function () {
      if (video.player.getDuration() > 1) {
        video.player.pauseVideo()
        // Get Video Duration
        var duration = video.player.getDuration()
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
}

module.exports = {
  prepare,
  waitForVideoPlayer
}
