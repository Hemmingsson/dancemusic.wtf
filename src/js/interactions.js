import sound from './sounds.js'
import ripple from './ripple.js'
import buttons from './buttons.js'

import game from './game.js'

/* ==========================================================================
DISPALY BUTTONS
========================================================================== */

var buttonsEvent = function () {
  var displayButtons = document.querySelectorAll('.button')
  var backButton = document.querySelector('.backButton')
  var body = document.body
  // Start button
  displayButtons[0].addEventListener('click', () => {
    buttons.blink(false)
    game.start()
  })
  // About button
  displayButtons[1].addEventListener('click', () => {
    body.classList.add('--offscreen')
    if (global.video.isPlaying) { game.togglePause() }
  })
  // About Back button
  backButton.addEventListener('click', () => {
    body.classList.remove('--offscreen')
    if (!global.video.isPlaying) { game.togglePause() }
  })
}

/* ==========================================================================
PADS
========================================================================== */

const padsEvents = () => {
  const pads = document.querySelectorAll('.pad')
  Array.from(pads).forEach((pad, index) => {
    pad.addEventListener('mousedown', event => {
      sound.tap.play()
      if (global.gameData && global.gameData.roundIsActive) { game.choosen(index, pad) }
    })
  })
}

/* ==========================================================================
INIT
========================================================================== */

export default {
  init () {
    buttons.blink(true)
    padsEvents()
    buttonsEvent()
    ripple.init()
  }
}
