/* global defaults */
/* global gameData */
/* global video */

var genreData = require('./genreData.json')
var _ = require('./libs/underscore.min.js')
var pads = require('./pads.js')
var player = require('./player.js')
var samples = require('./samples.js')

global.defaults = {
  startLives: 10,
  sampleLenght: 5
}

global.gameData = {
  'totalScore': 0,
  'totalLives': 0,
  'currentGame': null,
  'scoreMultiplyer': 0,
  'roundIsActive': false
}

var defaultGame = function () {
  return {
    'answers': [],
    'track': {
      'info': null,
      'sampleTimeStamps': [],
      'currentSample': 0
    }
  }
}

/* ==========================================================================
RESETS
========================================================================== */

var resetStats = function () {
  gameData.totalScore = 0
  gameData.totalLives = defaults.startLives
  // renderStats()
}

// RESET GAME BOARD
var resetBoard = function () {
  pads.resetColors()
  video.mute(true)
  gameData.scoreMultiplyer = 0
  pads.resetGeners()
}

/* ==========================================================================
GAME & ROUND START
========================================================================== */

var newGame = function () {
  resetStats()
  newRound()
}

var newRound = function () {
  gameData.currentGame = defaultGame()
  resetBoard()
  renderStats()
  drawNewRound()
    .then(player.prepare)
    .then(pads.renderGenres)
    .then(startRound)
}

var startRound = function () {
  gameData.roundIsActive = true
  scoreMultiplyCounter()
  samples.playNextSample() // start sample playback
  pads.blinkRandomly('pink') // start pads animation
}

/* ==========================================================================
   Draw Round
   ========================================================================== */

var drawNewRound = function () {
  return new Promise(function (resolve, reject) {
    var draw = function () {
      // Trow dice
      var correctIndex = Math.floor(Math.random() * 3)
      // Draw 4 random tracks
      var answers = _.sample(genreData.tracks, 4)
      // Check if draw has unique genres
      var genres = []
      for (var data of answers) { genres.push(data.genre) }
      var isUnique = _.uniq(genres).length === answers.length
      // If unique draw update gameData and resolve, else draw again
      if (isUnique) {
        for (var [index, data] of answers.entries()) {
          var isCorrectAnswer = index === correctIndex
          gameData.currentGame.answers.push({
            genre: data.genre,
            correct: isCorrectAnswer
          })
          if (isCorrectAnswer) {
            gameData.currentGame.track.info = data
          }
        }
        resolve()
      } else {
        draw()
      }
    }
    draw()
  })
}

/* ==========================================================================
STATS
========================================================================== */

var getScore = function () {
  return Math.floor(11 * gameData.scoreMultiplyer)
}

var scoreMultiplyCounter = function () {
  gameData.scoreMultiplyer = defaults.sampleLenght * 3
  var counter = function () {
    if (video.isPlaying && !video.isMuted && gameData.scoreMultiplyer > 1 && gameData.roundIsActive) {
      gameData.scoreMultiplyer -= 1
    }
    setTimeout(counter, 1000)
  }
  counter()
}

var renderStats = function () {
  document.getElementsByClassName('status__score')[0].innerHTML = ('000000' + gameData.totalScore).slice(-6)
  renderLives()
}

var renderLives = function () {
  var string = ''
  var fullHeart = '_'
  var emptyHeart = '^'

  for (var i = 0; i < 10; i++) {
    string = i < gameData.totalLives ? fullHeart + string : emptyHeart + string
  }
  document.getElementsByClassName('status__lives')[0].innerHTML = string
}

var waitForVideoPlayer = player.waitForVideoPlayer

/* ==========================================================================
   EXPORTS
   ========================================================================== */

module.exports = {
  newRound,
  newGame,
  getScore,
  waitForVideoPlayer
}

