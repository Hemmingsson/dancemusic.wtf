/* global TweenLite */

var dots = document.querySelectorAll('.loading .dot')
var lines = document.querySelectorAll('.loading .line')

var loading = function () {
  stop()
  TweenLite.to(lines, 0, {opacity: 1})
  var animationLoop = function (index) {
    var line = lines[index]
    TweenLite.to(line, 0, {
      opacity: line.style.opacity ^= 1, // invert opacity
      delay: 0.15,
      onComplete: function () {
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

var hide = function () {
  TweenLite.killTweensOf(dots)
  TweenLite.to(dots, 0, {opacity: 0})
}

var stop = function () {
  TweenLite.killTweensOf(dots)
  TweenLite.killTweensOf(lines)
  TweenLite.to(dots, 0, {opacity: 0})
  TweenLite.to(lines, 0, {opacity: 1})
}

var blinkCurrentSample = function () {
  stop()
  let currentIndex = global.gameData.currentGame.track.currentSample
  TweenLite.killTweensOf(dots)
  TweenLite.to(dots, 0, {opacity: 0})
  for (var i = 0; i <= currentIndex; i++) {
    TweenLite.to(dots[i], 0, {opacity: 1})
  }

  var animationLoop = function () {
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
