/* global TimelineMax, Power2 */

/* ==========================================================================
BLINK START BUTTON
========================================================================== */
let blinkTl

const blink = blink => {
  const button = document.querySelector('.button')
  if (!blink) {
    blinkTl.pause(0)
    return
  }
  blinkTl = new TimelineMax({
    repeat: -1,
    yoyo: true,
    ease: Power2.easeOut
  }).to(button, 0.8, {
    color: '#8CCE92',
    boxShadow: 'inset 0 0 0 3px #8CCE92'
  }).play()
}

export default {
  blink
}
