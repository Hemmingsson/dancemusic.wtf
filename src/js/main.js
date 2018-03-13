require('./libs/TweenMax.min.js')
var Typed = require('./libs/Typed.min.js')
var _ = require('./libs/underscore.min.js')

var genreData = require('./genreData.json')

var sound = {
  tap: new Audio('./sounds/tap.mp3'),
  correct: new Audio('./sounds/correct.mp3'),
  wrong: new Audio('./sounds/wrong.mp3')
}

var sampleLenght = 15
var scoreMultiplyer = 0

var message = {
  start: 'Click Start to begin quiz',
  ready: 'Controller Ready!',
  loading: 'Prepare for next round',
  what: 'What genere is playing?',
  buffering: 'Buffering Music...',
  userChoosed: 'You Picked ',
  correct: 'is correct!!!',
  incorrect: 'is incorrect :(',
  toSlow: 'You were to slow...'
}

var padColor = {
  blue: '73, 246, 239',
  pink: '247, 73, 247',
  red: '246, 73, 73',
  green: '21, 255, 44',
  lightGreen: '152, 246, 73',
  orange: '246, 156, 73'
}

var gameData = {
  'totalScore': 0,
  'totalLives': 5,
  'currentGame': null,
  'gameIsActive': false
}

var defaultGame = function () {
  return {
    'answers': [],
    'track': {
      'info': null,
      'sampleTimeStamps': [],
      'currentSample': 0
    }
  }
}

/* ==========================================================================
INIT
========================================================================== */

document.addEventListener('DOMContentLoaded', function (event) {
  initRippleEffect()
  initDisplayButtons()
  initPads()
  if (is_touch_device()) {
    document.body.style.height = window.innerHeight + 'px'
  }

  waitForVideoPlayer(function () {
    console.log('READY')
  })
})

function is_touch_device () {
  return 'ontouchstart' in window        // works on most browsers
      || navigator.maxTouchPoints       // works on IE10/11 and Surface
};

/* ==========================================================================
START GAME
========================================================================== */

// NEW GAME
// -------------------------------------------------------
var startNewGame = function () {
  resetStats()
  startNewRound(true)
}

// NEW ROUND
// -------------------------------------------------------
var startNewRound = function (addRound) {
  gameData.currentGame = defaultGame()
  resetBoard()
  renderStats()

  drawNewRound()
    .then(prepairVideo)
    .then(renderPadGenres)
    .then(function () {
      gameData.gameIsActive = true
      scoreMultiplyCounter()
      playNextSample() // start sample playback
      blinkPadsRandomly('pink') // start pads animation
    })
}

// RESET GAME BOARD
var resetBoard = function () {
  killPadsAnimation()
  muteVideo(true)
  scoreMultiplyer = 0
  // remove genre form pads
  var titles = document.getElementsByClassName('pad__title')
  for (var i = 0; i < titles.length; i++) { titles.item(i).innerHTML = '' }
}

/* ==========================================================================
   Draw Round
   ========================================================================== */

var drawNewRound = function () {
  return new Promise(function (resolve, reject) {
    var draw = function () {
      // Trow dice
      var correctIndex = Math.floor(Math.random() * 3)
      // Draw 4 random tracks
      var answers = _.sample(genreData.tracks, 4)
      // Check if draw has unique genres
      var genres = []
      for (var data of answers) { genres.push(data.genre) }
      var isUnique = _.uniq(genres).length === answers.length
      // If unique draw update gameData and resolve, else draw again
      if (isUnique) {
        for (var [index, data] of answers.entries()) {
          var isCorrectAnswer = index === correctIndex
          gameData.currentGame.answers.push({
            genre: data.genre,
            correct: isCorrectAnswer
          })
          if (isCorrectAnswer) {
            gameData.currentGame.track.info = data
          }
        }
        resolve()
      } else {
        draw()
      }
    }
    draw()
  })
}

/* ==========================================================================
USER PICKS ANSWER
========================================================================== */

var answerChoosen = function (answerIndex, elm) {
  gameData.gameIsActive = false
  var choosenGenre = gameData.currentGame.answers[answerIndex]
  var answerIsCorrect = choosenGenre.correct

  // Indicate which users choise
  blinkSpecificPad(answerIndex, 0.15)

  // Wait abit to show the correct anwser
  setTimeout(function () {
    if (answerIsCorrect) {
      killPadsAnimation()
      showCorrectPad()
      sound.correct.play()
      // Update Score
      gameData.totalScore += getScore()
    } else {
      gameData.totalLives -= 1
      sound.wrong.play()
      showCorrectPad()
    }
  }, 1700)
  // Wait even more to start new round
  setTimeout(function () {
    if (gameData.totalLives === 0) { // Game Over
      startNewGame()
    } else {
      startNewRound(true)
    }
  }, 4700)
}

var noAnswerChoosen = function () {
  killPadsAnimation()
  blinkAllPads('red', 'orange')
  videoPlayer.pauseVideo()
  gameData.gameIsActive = false
  scoreMultiplyer -= 1
  setDarkDisplayText(true, message.toSlow)

  setTimeout(function () {
    startNewRound()
  }, 3000)
}

/* ==========================================================================
STATS
========================================================================== */

var resetStats = function () {
  gameData.totalScore = 0
  gameData.totalLives = 5
  renderStats()
}

var getScore = function () {
  return Math.floor(11 * scoreMultiplyer / 2)
}

var scoreMultiplyCounter = function () {
  scoreMultiplyer = sampleLenght * 3
  var counter = function () {
    if (videoIsPlaying && !videoIsMuted && scoreMultiplyer > 1 && gameData.gameIsActive) {
      scoreMultiplyer -= 1
    }

    setTimeout(counter, 1000)
  }
  counter()
}

/* ==========================================================================
DISPLAY
========================================================================== */

// DISPLAY BUTTONS
// -------------------------------------------------------
var initDisplayButtons = function () {
  var buttons = document.getElementsByClassName('button')

  // Start button
  buttons[0].addEventListener('click', function (event) {
    if (!videoPlayerIsReady) return
    startNewGame()
    // blinkDisplayText(true)
  })

  // About Button
  buttons[1].addEventListener('click', function (event) {
  })
}

// STATS
// -------------------------------------------------------
var renderStats = function () {
  document.getElementsByClassName('total-score')[0].innerHTML = gameData.totalScore
  // document.getElementsByClassName('total-lives')[0].innerHTML = gameData.totalLives
  // document.getElementsByClassName('total-rounds')[0].innerHTML = gameData.totalRounds
  renderLives()
}

var renderLives = function () {
  var string = ''
  for (var i = 0; i < 5; i++) {
    if (i < gameData.totalLives) {
      string = '_' + string
    } else {
      string = '^' + string
    }
  }
  document.getElementsByClassName('interface__lives')[0].innerHTML = string
}

// EQUALIZER
// -------------------------------------------------------

var isEqualizerAnimating = false

var animateEqualizer = function (play) {
  if (play === isEqualizerAnimating) return
  isEqualizerAnimating = play
  play ? startEqualizer() : stopEqualizer()
}

var startEqualizer = function () {
  console.log('Playing EQ')
  var bars = document.getElementsByClassName('bar')
  var animateBar = function (bar) {
    var animation = function (grow) {
      var duration = (Math.random() * 0.4) + 0.2
      var baseHeight = 0.16
      if (grow) {
        baseHeight = (Math.random() * 0.75) + 0.25
      }
      TweenLite.to(bar, duration, {
        scaleY: baseHeight,
        force3D: true,
        ease: 'Circ.easeInOut',
        onComplete: function () {
          animation(!grow)
        }
      })
    }
    animation(true)
  }

  for (var i = 0; i < bars.length; i++) {
    animateBar(bars.item(i))
  }
}

var stopEqualizer = function () {
  console.log('STOP EQ')
  var elms = document.getElementsByClassName('bar')
  TweenLite.killTweensOf(elms)
  TweenLite.to(elms, 0.1, {
    scaleY: 0.16,
    force3D: true
  })
}

/* ==========================================================================
PADS
========================================================================== */

// PAD CLICK SOUND
// -------------------------------------------------------
var initPads = function () {
  var pads = document.getElementsByClassName('pad')
  Array.from(pads).forEach(function (pad, index) {
    pad.addEventListener('mousedown', function (event) {
      sound.tap.play()
      if (gameData && gameData.gameIsActive) {
        answerChoosen(index, pad)
      }
    })
  })
}

// BLINK PADS RANDOMLY
// -------------------------------------------------------
var blinkPadsRandomly = function (color) {
  var pads = document.getElementsByClassName('pad__color')
  var currentPad
  var animate = function () {
    var getNewPad = function () {
      var padToAnimate = pads[Math.floor(Math.random() * pads.length)]
      padToAnimate === currentPad ? getNewPad() : makePink(padToAnimate)
    }
    getNewPad()

    function makePink (pad) {
      currentPad = pad
      TweenLite.to(pad, 0.3, {
        backgroundColor: 'rgb(' + padColor[color] + ')',
        onComplete: function () {
          TweenLite.to(pad, 0.1, {
            backgroundColor: 'rgb(' + padColor.blue + ')',
            onComplete: animate()
          })
        }
      })
    }
  }
  animate()
}

// BLINK ALL PADS ONCE
// -------------------------------------------------------
var blinkAllPadsOnce = function (color) {
  var pads = document.getElementsByClassName('pad__color')
  TweenLite.to(pads, 0.3, {
    backgroundColor: 'rgb(' + padColor[color] + ')',
    onComplete: function () {
      TweenLite.to(pads, 0.1, {
        backgroundColor: 'rgb(' + padColor.blue + ')',
        delay: 0.1
      })
    }
  })
}

// BLINK ALL PADS
// -------------------------------------------------------
var blinkAllPads = function (toColor, fromColor) {
  var pads = document.getElementsByClassName('pad__color')
  var blinkPads = function () {
    TweenLite.to(pads, 0.3, {
      backgroundColor: 'rgb(' + padColor[toColor] + ')',
      onComplete: function () {
        TweenLite.to(pads, 0.1, {
          backgroundColor: 'rgb(' + padColor[fromColor] + ')',
          delay: 0.1,
          onComplete: function () {
            blinkPads()
          }
        })
      }
    })
  }
  blinkPads()
}

// BLINK SPECIFIC PAD
// -------------------------------------------------------
var blinkSpecificPad = function (padIndex, speed) {
  killPadsAnimation() // Stop current animation
  var choosenPad = document.getElementsByClassName('pad__color')[padIndex]
  var blinkPad = function () {
    TweenLite.to(choosenPad, speed, {
      backgroundColor: 'rgb(' + padColor['pink'] + ')',
      onComplete: function () {
        TweenLite.to(choosenPad, speed, {
          backgroundColor: 'rgb(' + padColor['blue'] + ')',
          onComplete: function () {
            blinkPad()
          }
        })
      }
    })
  }
  blinkPad()
}

// SET GENRE FOR PAD
// -------------------------------------------------------
var renderPadGenres = function () {
  return new Promise(function (resolve, reject) {
    var pads = document.getElementsByClassName('pad')
    var setGenre = function (currentPad) {
      var pad = pads[currentPad].getElementsByClassName('pad__color')[0]
      var padText = pads[currentPad].getElementsByClassName('pad__title')[0]

      TweenLite.to(pad, 0.3, {
        backgroundColor: 'rgb(' + padColor.green + ')',
        onComplete: function () {
          padText.innerHTML = gameData.currentGame.answers[currentPad].genre
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

// SHOW CORRECT PAD
// -------------------------------------------------------
var showCorrectPad = function () {
  killPadsAnimation()
  var pads = document.getElementsByClassName('pad__color')
  var answers = gameData.currentGame.answers
  console.log(answers)
  var correctPad
  var wrongPads = []

  for (var i = 0; i < answers.length; i++) {
    if (answers[i].correct) {
      correctPad = pads[i]
    } else {
      wrongPads.push(pads[i])
    }
  }

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

// KILL ALL PAD ANIMATIONS
// -------------------------------------------------------
var killPadsAnimation = function (pads) {
  var pads = document.getElementsByClassName('pad__color')
  TweenLite.killTweensOf(pads)
  TweenLite.to(pads, 0.2, {
    backgroundColor: 'rgb(' + padColor.blue + ')'
  })
}

/* ==========================================================================
RIPPLE EFFECT
========================================================================== */
var initRippleEffect = function () {
  var elms = document.getElementsByClassName('ripple-effect')
  for (var i = 0; i < elms.length; i++) {
    createRippleEffect(elms.item(i))
  }
}

var createRippleEffect = function (elm) {
  elm.addEventListener('mousedown', function (event) {
    event.preventDefault()

    var rect = this.getBoundingClientRect()

    var xPos = event.pageX - rect.left
    var yPos = event.pageY - rect.top

    var elWavesRipple = document.createElement('div')

    elWavesRipple.className = 'ripple-burst'
    elWavesRipple.style.left = xPos + 'px'
    elWavesRipple.style.top = yPos + 'px'

    this.appendChild(elWavesRipple)

    TweenLite.to(elWavesRipple, 0.5, {
      scale: 70,
      opacity: 0,
      force3D: true,
      ease: 'Sine.easeOut',
      onComplete: function (elements) { elWavesRipple.remove() }
    })
  })
}

/* ==========================================================================
   Video Player
   ========================================================================== */

var videoPlayer
var videoPlayerIsReady = false
var videoIsPlaying = false
var videoIsMuted = false

// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script')
tag.src = 'https://www.youtube.com/iframe_api'
var firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

global.onYouTubeIframeAPIReady = function () {
  videoPlayer = new YT.Player('videoPlayer', {
    height: '200',
    width: '300',
    playerVars: {
      playsinline: 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onPlayerError
    }
  })
}

var onPlayerReady = function () {
  videoPlayerIsReady = true
  videoPlayer.setVolume(100)
  muteVideo(true)
  whenMusicIsPlaying()
}

var onPlayerStateChange = function (e) {
  if (e.data === 1) {
    videoIsPlaying = true
  } else {
    videoIsPlaying = false
  }

  if (e.data === -1) {
  } else if (e.data === 0) {
    // ended
  } else if (e.data === 1) {
    var updater = function () {
      if (videoPlayer.getPlayerState() === 1) {
        sampleHandeling()
        setTimeout(updater, 100)
      }
    }
    updater()

    // playing
  } else if (e.data === 2) {

    // paused
  } else if (e.data === 3) {
    console.log('BUFFER')
  } else if (e.data === 5) {
    // video cued
  }
}

var muteVideo = function (mute) {
  if (mute) {
    videoIsMuted = true
    videoPlayer.mute()
  } else {
    videoIsMuted = false
    videoPlayer.unMute()
  }
}

// NEW ROUND ON ERROR
// -------------------------------------------------------
var onPlayerError = function (e) {
  startNewRound(false)
}

// WAIT UNTILL VIDEO PLAYER IS READY
// -------------------------------------------------------
var waitForVideoPlayer = function (callback) {
  var musicPlayerReady = setInterval(function () {
    if (videoPlayer !== undefined && videoPlayerIsReady) {
      clearInterval(musicPlayerReady)
      callback()
    }
  }, 10)
}

// DO STUFF ONLY WHEN MUSIC IS ACTUALY PLAYING
// -------------------------------------------------------
var whenMusicIsPlaying = function () {
  var updater = function () {
    if (videoIsPlaying && !videoIsMuted) {
      animateEqualizer(true)
    } else {
      animateEqualizer(false)
    }
    setTimeout(updater, 300)
  }
  updater()
}

// PREPAIR VIDEO SAMPLE POINTS
// -------------------------------------------------------
var prepairVideo = function () {
  return new Promise(function (resolve, reject) {
    videoPlayer.loadVideoById(gameData.currentGame.track.info.ytId, 40)
    videoPlayer.setPlaybackQuality('small')
    // Wait untill duration is avalible
    var calculateTimeStamps = function () {
      if (videoPlayer.getDuration() > 1) {
        videoPlayer.pauseVideo()
        // Get Video Duration
        var duration = videoPlayer.getDuration()
        // Create sampe Points
        gameData.currentGame.track.sampleTimeStamps = createSamplePoints(duration, 3)
        // Set time to First Sample point
        videoPlayer.seekTo(gameData.currentGame.track.sampleTimeStamps[0])
        loadingDone = true
        resolve()
      } else {
        setTimeout(calculateTimeStamps, 150)
      }
    }
    calculateTimeStamps()
  })
}

/* ==========================================================================
   Sample Creation and Handeling
   ========================================================================== */

var createSamplePoints = function (duration, sampleSize) {
  sampleSize++
  var points = []
  for (var i = 0; i < sampleSize; i++) {
    var lol = duration / sampleSize
    points.push(lol * (i + 1))
  }
  points.splice(-1, 1)
  return points
}

var playNextSample = function () {
  var sampleTimeStamps = gameData.currentGame.track.sampleTimeStamps
  var currentSample = gameData.currentGame.track.currentSample
  videoPlayer.seekTo(sampleTimeStamps[currentSample])
  muteVideo(false)
  videoPlayer.playVideo()
}

var sampleHandeling = function () {
  var currentTime = videoPlayer.getCurrentTime()
  var currentSample = gameData.currentGame.track.currentSample
  var startPoint = gameData.currentGame.track.sampleTimeStamps[currentSample]

  if (videoPlayerIsReady) {
    if (currentTime > startPoint + sampleLenght) {
      gameData.currentGame.track.currentSample++
      // Play next sample if avalible
      if (currentSample !== 2) {
        // Play next sample if game is still active
        if (gameData.gameIsActive) {
          playNextSample()
        }
      } else {
        noAnswerChoosen()
      }
    }
  }
}
