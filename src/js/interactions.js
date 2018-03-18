
/* global gameData */
/* global game */
/* global states */

var sound = require('./sounds.js')
var ripple = require('./ripple.js')

game.waitForVideoPlayer(function () {
  game.newGame()
})

/* ==========================================================================
DISPALY BUTTONS
========================================================================== */
var buttonsClick = function () {
  var buttons = document.querySelectorAll('.button')

  // Start button
  buttons[0].addEventListener('click', function (event) {
    console.log('START')
  })

  // About Button
  buttons[1].addEventListener('click', function (event) {
    console.log('ABOUT')
  })
}

/* ==========================================================================
PADS
========================================================================== */

var padsClick = function () {
  var pads = document.querySelectorAll('.pad')
  Array.from(pads).forEach(function (pad, index) {
    pad.addEventListener('mousedown', function (event) {
      sound.tap.play()
      if (gameData && gameData.roundIsActive) {
        states.answerChoosen(index, pad)
      }
    })
  })
}

/* ==========================================================================
INIT
========================================================================== */

var init = function () {
  buttonsClick()
  padsClick()
  ripple.init()
}

module.exports = {
  init
}
