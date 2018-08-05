/* global gameData, TimelineMax, TweenLite */
import './splittype.min.js'
import pixels from './pixels.js'
import loadingIndicator from './loading-indicator.js'
import defaults from './defaults.js'
import buttons from './buttons.js'

var string = {
  intro: ['Each round You’ll hear 3 samples <br>  from a dance music track.', 'Your goal is to guess <br> the correct genre.'],
  loading: ['Loading First Round', 'Loading Next Round'],
  init: 'Initializing Game',
  correct: 'Well Played',
  wrong: 'Wrong Answer',
  guess: 'Guess the Music Genre',
  late: 'Too Late',
  error: 'Failed to embedd YouTube player'
}

// INTRO
// -------------------------------------------------------

const intro = () => {
  return new Promise((resolve, reject) => {
    /*
    var $interface = document.querySelector('.interface')
    $interface.classList.add('--default')
    $interface.classList.remove('--intro')
    resolve()      */

    var $interface = document.querySelector('.interface')
    pixels.fade(true)
    .then(blinkOverlayTitle)
    .then(() => {
      typeText('.overlay__text', string.intro, 600)
    .then(() => {
      $interface.classList.add('--default')
      pixels.fade(false)
    .then(() => {
      $interface.classList.remove('--intro')
      loadingIndicator.loading()
      setTimeout(() => {
        setBigText(string.init)
        resolve()
      }, 1000)
    })
    })
    })
  })
}

var blinkOverlayTitle = function () {
  return new Promise((resolve, reject) => {
    var title = document.querySelector('.overlay__title')
    new TimelineMax({onComplete: resolve})
    .to(title, 0, { opacity: 0, delay: 0.1 })
    .to(title, 0, { opacity: 1, delay: 0.4 })
    .to(title, 0, { opacity: 0, delay: 0.4 })
    .to(title, 0, { opacity: 1, delay: 0.4 })
    .to(title, 0, { opacity: 0, delay: 0.4 })
    .play()
  })
}

var blinkBigText = function () {
  return new Promise((resolve, reject) => {
    var text = document.querySelector('.big')
    const d = 0.3
    new TimelineMax({onComplete: resolve})
    .to(text, 0, { opacity: 0, delay: d })
    .to(text, 0, { opacity: 1, delay: d })
    .to(text, 0, { opacity: 0, delay: d })
    .to(text, 0, { opacity: 1, delay: d })
    .to(text, 0, { opacity: 0, delay: d })
    .to(text, 0, { opacity: 1, delay: d })
    .play()
  })
}

const choosen = (isCorrect) => {
  return new Promise((resolve, reject) => {
    loadingIndicator.stop()
    isCorrect ? correctAnswer().then(resolve) : wrongAnswer().then(resolve)
  })
}

const correctAnswer = function () {
  return new Promise((resolve, reject) => {
    setBigText(string.correct)
    blinkBigText().then(correctInfo).then(scoreAnimation).then(() => {
      displayPause(resolve)
    })
  })
}

const displayPause = function (resolve) {
  clear()
  setTimeout(resolve, 1500)
}

const scoreAnimation = function () {
  return new Promise((resolve, reject) => {
    const $text = document.querySelector('.big')
    var endScore = global.gameData.currentGame.score
    var startScore = {score: 0}
    $text.classList.add('--score')
    TweenLite.to(startScore, 2.2, {
      score: endScore,
      ease: Power4.easeOut,
      roundProps: 'score',
      onUpdate: counter,
      onComplete: () => {
        blinkBigText().then(() => {
          $text.classList.remove('--score')
          renderStats()
          resolve()
        })
      }
    })

    function counter () {
      setBigText(startScore.score)
    }
  })
}

const correctInfo = function () {
  return new Promise((resolve, reject) => {
    typeText('.big', ['You heard <br>' + gameData.currentGame.track.info.title], 2000)
    .then(resolve)
  })
}

const wrongInfo = function () {
  return new Promise((resolve, reject) => {
    typeText('.big', ['You heard <br>' + gameData.currentGame.track.info.title, 'Which is a<br>' + gameData.currentGame.track.info.genre + ' Track'], 1800)
    .then(() => {
      renderStats()
      displayPause(resolve)
    })
  })
}

const wrongAnswer = function () {
  return new Promise((resolve, reject) => {
    setBigText(string.wrong)
    blinkBigText().then(wrongInfo).then(resolve)
  })
}

// Typing Effect
// -------------------------------------------------------
const typeText = (selector, strings, delay) => {
  return new Promise((resolve, reject) => {
    const $text = document.querySelector('.big')
    $text.classList.add('--small')
    let index = 0
    const elm = document.querySelector(selector)

    const animateText = () => {
      elm.innerHTML = ''

      const innerDiv = document.createElement('div')
      innerDiv.innerHTML = strings[index]

      elm.appendChild(innerDiv)

      const instance = new SplitType(innerDiv, {split: 'chars', tagName: 'span'})

      for (let i = 0; i < instance.chars.length; i++) {
        TweenLite.to(instance.chars[i], 0, {
          opacity: 1,
          delay: 0.05 * i
        })
      }
      setTimeout(() => {
        index++
        if (strings.length === index) {
          resolve()
          $text.classList.remove('--small')
        } else {
          animateText()
        }
      }, 50 * instance.chars.length + delay)
    }
    animateText()
  })
}

const live = () => setBigText(string.guess)

const loading = () => {
  loadingIndicator.loading()
  const isFirstRound = global.gameData.totalScore === 0 && global.gameData.totalLives === 10
  setBigText(isFirstRound ? string.loading[0] : string.loading[1])
}

const clear = () => {
  setBigText('')
}

const toLate = () => {
  return new Promise((resolve, reject) => {
    setBigText(string.late)
    blinkBigText().then(wrongInfo).then(resolve)
  })
}

const lost = () => {
  return new Promise((resolve, reject) => {
    setBigText('Game Over')
    loadingIndicator.stop()
    blinkBigText().then(() => {
      typeText('.big', ['Click start to play again'], 500).then(() => {
        buttons.blink(true)
        setBigText('')
        resolve()
      })
    })
  })
}

const ready = () => {
  setBigText('get ready')
}

const error = () => {
  loadingIndicator.stop()
  setBigText(string.error)
}

const setBigText = function (string) {
  document.querySelector('.big').innerHTML = string
}

const renderStats = () => {
  renderScore()
  renderLives()
}

const renderScore = () => {
  const paddedScore = ('000000' + global.gameData.totalScore).slice(-6)
  document.querySelector('.status__score').innerHTML = paddedScore
}

const renderLives = () => {
  var string = ''
  var fullHeart = '_'
  var emptyHeart = '^'
  for (var i = 0; i < defaults.misc.lives; i++) {
    string = i < global.gameData.totalLives ? fullHeart + string : emptyHeart + string
  }
  document.querySelector('.status__lives').innerHTML = string
}

export default {
  intro,
  renderStats,
  choosen,
  live,
  ready,
  loading,
  toLate,
  clear,
  lost,
  error
}
