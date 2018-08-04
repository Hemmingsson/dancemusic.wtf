/* global gameData, TweenLite */

/**
 * TODO
 *
 * => rewrite TweenLite to TweenMax Timeline instead
 */

const padColor = {
  blue: '73, 246, 239',
  pink: '255, 142, 255',
  red: '246, 73, 73',
  green: '21, 255, 44',
  lightGreen: '152, 246, 73',
  orange: '246, 156, 73'
}

const renderGenres = () => new Promise((resolve, reject) => {
  const pads = document.querySelectorAll('.pad')
  const setGenre = currentPad => {
    const pad = pads[currentPad].querySelector('.pad__color')
    const padText = pads[currentPad].querySelector('.pad__title')
    TweenLite.to(pad, 0.25, {
      backgroundColor: `rgb(${padColor.green})`,
      onComplete () {
        padText.innerHTML = gameData.currentGame.answers[currentPad].genre // gameData.currentGame.answers[currentPad].correct + ' - ' +
        TweenLite.to(pad, 0.1, {
          backgroundColor: `rgb(${padColor.blue})`,
          onComplete () {
            currentPad++
            currentPad !== pads.length ? setGenre(currentPad++) : resolve()
          }
        })
      }
    })
  }
  setGenre(0)
})

/* ==========================================================================
RESET ALL PADS
========================================================================== */

const killAnimation = () => {
  const pads = document.querySelectorAll('.pad__color')
  TweenLite.killTweensOf(pads)
  TweenLite.to(pads, 0.2, {
    backgroundColor: `rgb(${padColor.blue})`
  })
}

/* ==========================================================================
BLINK ALL PADS RANDOMLY
========================================================================== */

const blinkRandomly = () => {
  const pads = document.querySelectorAll('.pad__color')
  let currentPad
  const animationLoop = () => {
    const getNewPad = () => {
      const index = Math.floor(Math.random() * pads.length)
      const padToAnimate = pads[index]
      padToAnimate === currentPad ? getNewPad() : colorPad(padToAnimate)
    }
    getNewPad()

    function colorPad (pad) {
      currentPad = pad
      TweenLite.to(pad, 0.3, {
        backgroundColor: `rgb(${padColor.pink})`,
        onComplete () {
          TweenLite.to(pad, 0.2, {
            backgroundColor: `rgb(${padColor.blue})`,
            onComplete: animationLoop()
          })
        }
      })
    }
  }
  animationLoop()
}

const showCorrect = () => {
  killAnimation()

  const pads = document.querySelectorAll('.pad__color')
  const answers = gameData.currentGame.answers
  let correctPad
  let wrongPads = []

  for (let i = 0; i < answers.length; i++) {
    answers[i].correct ? correctPad = pads[i] : wrongPads.push(pads[i])
  }

  TweenLite.to(wrongPads, 0.2, { backgroundColor: `rgb(${padColor.red})` })

  const blinkCorrect = () => {
    TweenLite.to(correctPad, 0.3, {
      backgroundColor: `rgb(${padColor.green})`,
      onComplete () {
        TweenLite.to(correctPad, 0.2, {
          backgroundColor: `rgb(${padColor.blue})`,
          onComplete () {
            blinkCorrect()
          }
        })
      }
    })
  }
  blinkCorrect()
}

const resetGeners = () => {
  var titles = document.querySelectorAll('.pad__title')
  for (var i = 0; i < titles.length; i++) { titles.item(i).innerHTML = '' }
}

export default {
  renderGenres,
  blinkRandomly,
  resetGeners,
  killAnimation,
  showCorrect
}
