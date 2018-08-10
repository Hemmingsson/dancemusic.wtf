/* global video, gameData, TweenLite, newRound */

import _ from 'lodash'
import genreData from '.././data/data.json'
import defaults from './defaults.js'
import sound from './sounds.js'
import display from './display.js'
import pads from './pads.js'
import player from './player.js'
import mobile from './mobile.js'

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
  pads.showCorrect()
  display.toLate().then(nextRound)
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
  display.choosen(isCorrect).then(nextRound)
}

let gameIsActive = false
const start = () => {
  if (!global.gameData && !gameIsActive) display.intro().then(player.init).then(newGame, display.error)
  if (global.gameData && !gameIsActive) newGame()
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
  player.start()
  mobile.tapStart()

  playbackErrorChecker()
  waitForMusic(() => {
    global.gameData.roundIsActive = true
    pads.blinkRandomly()
    display.live()
  })
}

const playbackErrorChecker = () => {
  const startTime = global.gameData.currentGame.track.sampleTimeStamps[0]
  setTimeout(() => {
    if (startTime === video.player.getCurrentTime()) {
      display.playbackError().then(() => { if (startTime < video.player.getCurrentTime()) display.live() })
    }
  }, 8000)
}

const waitForMusic = (func) => {
  const interval = () => global.video.isMusicPlaying ? func() : setTimeout(interval, 100)
  interval()
}

const nextRound = () => {
  gameData.totalLives !== 0 ? newRound() : lostGame()
}

/* ==========================================================================
STATS
========================================================================== */

const updateStats = (isCorrect) => {
  if (!isCorrect) {
    global.gameData.totalLives -= 1
    return
  }
  let score = Number((global.gameData.currentGame.scoreMultiplyer * 105).toFixed(0))
  if (score > 3000) { score = 3000 }
  if (score < 0) { score = 0 }
  global.gameData.currentGame.score = score
  global.gameData.totalScore += score
}

/* ==========================================================================
NEW FUNCTIONS
========================================================================== */

const newGame = () => {
  global.gameData = resetGameData()
  global.gameData.gameIsActive = true
  newRound()
}

const lostGame = () => {
  video.player.pauseVideo()
  pads.killAnimation()
  pads.resetGeners()
  display.lost().then(() => { gameIsActive = false })
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
  // Trow dice
  const correctIndex = Math.floor(Math.random() * 4)
  // Draw 4 random genres
  const genres = _.sampleSize(genreData.genres, 4)
  // Draw one song from each genre
  const answers = []
  for (const genre of genres) {
    const track = _.sample(genreData.tracks[genre])
    track.genre = genre
    answers.push(track)
  }
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
})

export default {
  start,
  choosen,
  newGame,
  togglePause
}
