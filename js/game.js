/* global video, gameData, TweenLite, newRound */

import _ from 'lodash'
import genreData from '.././data/data.json'
import defaults from './defaults.js'
import sound from './sounds.js'
import display from './display.js'
import pads from './pads.js'
import player from './player.js'

/*
Resets
========================================================================== */

const resetGameData = () => _.cloneDeep(defaults.gameData)
const resetRoundData = () => _.cloneDeep(defaults.gameData.currentGame)

/* ==========================================================================
GLOBAL GAME FUNCTIONS - needs to be global for now, should refactor
========================================================================== */

global.newRound = () => {
  pads.killAnimation()
  pads.resetGeners()
  display.loading()
  gameData.currentGame = resetRoundData()
  display.renderStats()
  loadRound()
    .then(startRound)
}

global.toLate = () => {
  gameData.roundIsActive = false
  updateStats(false)
  display.toLate().then(() => {
    gameData.totalLives !== 0 ? newRound() : lostGame()
  })
}

/* ==========================================================================
GAME ACTIONS
========================================================================== */

const choosen = (answerIndex, elm) => {
  const isCorrect = gameData.currentGame.answers[answerIndex].correct
  isCorrect ? sound.correct.play() : sound.wrong.play()
  gameData.roundIsActive = false
  pads.showCorrect()
  updateStats(isCorrect)

  display.choosen(isCorrect).then(() => {
    gameData.totalLives !== 0 ? newRound() : lostGame()
  })
}

let gameIsActive = false
const start = () => {
  if (!global.gameData && !gameIsActive) {
    display.intro().then(player.init).then(newGame)
  }
  if (global.gameData && !gameIsActive) {
    newGame()
  }
  gameIsActive = true
}

/* ==========================================================================
Round Functions
========================================================================== */

const loadRound = () => new Promise((resolve) => {
  drawNewRound()
    .then(player.prepare)
    .then(display.ready)
    .then(pads.renderGenres)
    .then(resolve)
})

const startRound = () => {
  global.gameData.roundIsActive = true
  pads.blinkRandomly()
  player.start()
  display.live()
}

const lostGame = () => {
  video.player.pauseVideo()
  pads.killAnimation()
  pads.resetGeners()

  display.lost().then(() => {
    gameIsActive = false
  })
}

/* ==========================================================================
STATS
========================================================================== */

const updateStats = (isCorrect) => {
  if (isCorrect) {
    let score = Number((global.gameData.currentGame.scoreMultiplyer * 105).toFixed(0))
    if (score > 3000) { score = 3000 }
    if (score < 0) { score = 0 }

    global.gameData.currentGame.score = score
    global.gameData.totalScore += score
  } else {
    global.gameData.totalLives -= 1
  }
}

/* ==========================================================================
NEW FUNCTIONS
========================================================================== */

const newGame = () => {
  global.gameData = resetGameData()
  global.gameData.gameIsActive = true
  newRound()
}

const togglePause = () => {
  if (!global.gameData.roundIsActive) return
  if (video.isPlaying) {
    video.player.pauseVideo()
    pads.killAnimation()
  } else {
    video.player.playVideo()
    pads.blinkRandomly()
  }
}

/* ==========================================================================
Draw Round
========================================================================== */

const drawNewRound = () => new Promise((resolve) => {
  const draw = () => {
    // Trow dice
    const correctIndex = Math.floor(Math.random() * 3)
    // Draw 4 random tracks
    const answers = _.sampleSize(genreData.tracks, 4)
    // Check if draw has unique genres
    const genres = _.map(answers, 'genre')
    const isUnique = _.uniq(genres).length === answers.length
    // If unique draw update gameData and resolve, else draw again
    if (isUnique) {
      for (const [index, item] of answers.entries()) {
        const isCorrectAnswer = index === correctIndex
        gameData.currentGame.answers.push({
          genre: item.genre,
          correct: isCorrectAnswer
        })
        if (isCorrectAnswer) {
          gameData.currentGame.track.info = item
        }
      }
      resolve()
    } else {
      draw()
    }
  }
  draw()
})

export default {
  start,
  choosen,
  newGame,
  togglePause
}
