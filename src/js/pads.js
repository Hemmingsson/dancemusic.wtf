
/* global gameData */
/* global TweenLite */

var padColor = {
  blue: '73, 246, 239',
  pink: '247, 73, 247',
  red: '246, 73, 73',
  green: '21, 255, 44',
  lightGreen: '152, 246, 73',
  orange: '246, 156, 73'
}

var pads = document.querySelectorAll('.pad__color')

/* ==========================================================================
BLINK ALL PADS RANDOMLY
========================================================================== */

var blinkRandomly = function (toColor) {
  var currentPad
  var animationLoop = function () {
    var getNewPad = function () {
      var padToAnimate = pads[Math.floor(Math.random() * pads.length)]
      padToAnimate === currentPad ? getNewPad() : colorPad(padToAnimate)
    }
    getNewPad()
    function colorPad (pad) {
      currentPad = pad
      TweenLite.to(pad, 0.3, {
        backgroundColor: 'rgb(' + padColor[toColor] + ')',
        onComplete: function () {
          TweenLite.to(pad, 0.1, {
            backgroundColor: 'rgb(' + padColor.blue + ')',
            onComplete: animationLoop()
          })
        }
      })
    }
  }
  animationLoop()
}

/* ==========================================================================
BLINK ALL ONCE
========================================================================== */
var blinkAllOnce = function (toColor) {
  TweenLite.to(pads, 0.3, {
    backgroundColor: 'rgb(' + padColor[toColor] + ')',
    onComplete: function () {
      TweenLite.to(pads, 0.1, {
        backgroundColor: 'rgb(' + padColor.blue + ')',
        delay: 0.1
      })
    }
  })
}

/* ==========================================================================
BLINK ALL 4EVA
========================================================================== */
var blinkAll = function (toColor, fromColor) {
  var animationLoop = function () {
    TweenLite.to(pads, 0.3, {
      backgroundColor: 'rgb(' + padColor[toColor] + ')',
      onComplete: function () {
        TweenLite.to(pads, 0.1, {
          backgroundColor: 'rgb(' + padColor[fromColor] + ')',
          delay: 0.1,
          onComplete: function () {
            animationLoop()
          }
        })
      }
    })
  }
  animationLoop()
}

/* ==========================================================================
BLINK SPECIFIC PAD
========================================================================== */

var blinkSpecific = function (toColor, padIndex) {
  resetColors()
  var choosenPad = pads[padIndex]
  var animationLoop = function () {
    TweenLite.to(choosenPad, 0.15, {
      backgroundColor: 'rgb(' + padColor[toColor] + ')',
      onComplete: function () {
        TweenLite.to(choosenPad, 0.15, {
          backgroundColor: 'rgb(' + padColor['blue'] + ')',
          onComplete: function () {
            animationLoop()
          }
        })
      }
    })
  }
  animationLoop()
}

/* ==========================================================================
RESET ALL PADS
========================================================================== */
var resetColors = function () {
  TweenLite.killTweensOf(pads)
  TweenLite.to(pads, 0.2, {
    backgroundColor: 'rgb(' + padColor.blue + ')'
  })
}

/* ==========================================================================
RESET ALL PADS
========================================================================== */

var renderGenres = function () {
  return new Promise(function (resolve, reject) {
    var pads = document.querySelectorAll('.pad')
    var setGenre = function (currentPad) {
      var pad = pads[currentPad].querySelectorAll('.pad__color')[0]
      var padText = pads[currentPad].querySelectorAll('.pad__title')[0]

      TweenLite.to(pad, 0.3, {
        backgroundColor: 'rgb(' + padColor.green + ')',
        onComplete: function () {
          padText.innerHTML = gameData.currentGame.answers[currentPad].correct
          TweenLite.to(pad, 0.1, {
            backgroundColor: 'rgb(' + padColor.blue + ')',
            onComplete: function () {
              currentPad++
              if (currentPad !== pads.length) {
                setGenre(currentPad++)
              } else {
                resolve()
              }
            }
          })
        }
      })
    }
    setGenre(0)
  })
}

var resetGeners = function () {
  var titles = document.querySelectorAll('.pad__title')
  for (var i = 0; i < titles.length; i++) { titles.item(i).innerHTML = '' }
}
/* ==========================================================================
SHOW CORRECT
========================================================================== */
var showCorrect = function () {
  console.log('CORRWCT')
  resetColors()
  var answers = gameData.currentGame.answers
  var correctPad
  var wrongPads = []

  for (var i = 0; i < answers.length; i++) {
    if (answers[i].correct) {
      correctPad = pads[i]
    } else {
      wrongPads.push(pads[i])
    }
  }
  console.log(wrongPads)

  TweenLite.to(wrongPads, 0.2, {
    backgroundColor: 'rgb(' + padColor.red + ')'
  })

  var blinkPads = function () {
    TweenLite.to(correctPad, 0.3, {
      backgroundColor: 'rgb(' + padColor.green + ')',
      onComplete: function () {
        TweenLite.to(correctPad, 0.2, {
          backgroundColor: 'rgb(' + padColor.blue + ')',
          onComplete: function () {
            blinkPads()
          }
        })
      }
    })
  }
  blinkPads()
}

/* ==========================================================================
EXPORTS
========================================================================== */

module.exports = {
  blinkRandomly,
  blinkAllOnce,
  blinkAll,
  blinkSpecific,
  resetColors,
  renderGenres,
  resetGeners,
  showCorrect
}
