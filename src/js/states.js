/* global gameData */
/* global video */
/* global game */

var pads = require('./pads.js')
var sound = require('./sounds.js')

/* ==========================================================================
START QUIZ
========================================================================== */

var startQuiz = function (answerIndex, elm) {

}

/* ==========================================================================
USER PICKS ANSWER
========================================================================== */

var answerChoosen = function (answerIndex, elm) {
  gameData.roundIsActive = false
  var choosenGenre = gameData.currentGame.answers[answerIndex]
  var answerIsCorrect = choosenGenre.correct

  // Indicate which users choise
  pads.blinkSpecific('pink', answerIndex)
  // Wait abit to show the correct anwser
  setTimeout(function () {
    if (answerIsCorrect) {
      pads.resetColors()
      sound.correct.play()
      pads.showCorrect()
      // Update Score
      gameData.totalScore += game.getScore()
    } else {
      gameData.totalLives -= 1
      sound.wrong.play()
      pads.showCorrect()
    }
  }, 1700)
  // Wait even more to start new round
  setTimeout(function () {
    if (gameData.totalLives === 0) { // Game Over
      game.newGame()
    } else {
      game.newRound(true)
      // pixelFade.fade(false)
    }
  }, 4700)
}

/* ==========================================================================
TIME IS OUT - NOW ANSWER CHOOSEN
========================================================================== */

var noAnswer = function () {
  gameData.totalLives -= 1
  pads.resetColors()
  pads.blinkAll('red', 'orange')
  video.player.pauseVideo()
  gameData.roundIsActive = false
  setTimeout(function () {
    game.newRound()
  }, 3000)
}

module.exports = {
  answerChoosen,
  noAnswer
}
