/* global TweenLite */

const dots = document.querySelectorAll('.loading .dot')
const lines = document.querySelectorAll('.loading .line')

const loading = () => {
  stop()
  TweenLite.to(lines, 0, {opacity: 1})
  const animationLoop = (index) => {
    const line = lines[index]
    TweenLite.to(line, 0, {
      opacity: line.style.opacity ^= 1, // invert opacity
      delay: 0.15,
      onComplete: () => {
        index++
        if (index !== lines.length) {
          animationLoop(index)
        } else {
          animationLoop(0)
        }
      }
    })
  }
  animationLoop(0)
}

const hide = () => {
  TweenLite.killTweensOf(dots)
  TweenLite.to(dots, 0, {opacity: 0})
}

const stop = () => {
  TweenLite.killTweensOf(dots)
  TweenLite.killTweensOf(lines)
  TweenLite.to(dots, 0, {opacity: 0})
  TweenLite.to(lines, 0, {opacity: 1})
}

const blinkCurrentSample = () => {
  stop()
  let currentIndex = global.gameData.currentGame.track.currentSample
  TweenLite.killTweensOf(dots)
  TweenLite.to(dots, 0, {opacity: 0})
  for (let i = 0; i <= currentIndex; i++) {
    TweenLite.to(dots[i], 0, {opacity: 1})
  }

  const animationLoop = () => {
    TweenLite.to(dots[currentIndex], 0.4, {
      opacity: dots[currentIndex].style.opacity ^= 1, // invert opacity
      onComplete: animationLoop
    })
  }
  animationLoop()
}

/* ==========================================================================
EXPORTS
========================================================================== */

module.exports = {
  loading,
  stop,
  hide,
  blinkCurrentSample
}
