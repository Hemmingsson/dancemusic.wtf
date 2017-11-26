
var padColors = {
  blue: '73, 246, 239',
  pink: '247, 73, 247',
  red: '246, 73, 73',
  green: '21, 255, 44',
  orange: '246, 156, 73'
}

var sound = {
  tap: new Audio('./sounds/tap.mp3'),
  correct: new Audio('./sounds/correct.mp3'),
  wrong: new Audio('./sounds/wrong.mp3')
}

var gameData = {
  'totalScore': 0,
  'totalCorrect': 0,
  'totalRounds': 0,
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
  waitForVideoPlayer(initGame)
})

var initGame = function () {
  blinkAllPadsOnce('pink')
  setDisplayText('Click Start to begin game', true)
}

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
  blinkAllPadsOnce('green')
  setDisplayText('Loading track...', false)
  renderStats()
  gameData.totalRounds += addRound ? 1 : 0
  drawNewRound()
    .then(prepairVideo)
    .then(renderPadGenres)
    .then(function () {
      blinkDisplayText(false)
      setDisplayText('What genere is playing?', true, function () {
        // callback to wait untill typed animateion is done
        gameData.gameIsActive = true
        playNextSample() // start sample playback
        blinkPadsRandomly('pink') // start pads animation
      })
    })
}

// RESET GAME BOARD
var resetBoard = function () {
  setDarkDisplayText(false)
  killPadsAnimation()
  resetSamplesBackground()
  // remove genre form pads
  var titles = document.getElementsByClassName('pad__title')
  for (var i = 0; i < titles.length; i++) {
    titles.item(i).innerHTML = ''
  }
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
  setDisplayText('You Picked ' + choosenGenre.genre, false)

  // Wait abit to show the correct anwser
  setTimeout(function () {
    if (answerIsCorrect) {
      sound.correct.play()
      setDarkDisplayText(true, choosenGenre.genre + '<br> is correct!!!')
      // Update Score
      gameData.totalScore += 100 * (3 - gameData.currentGame.track.currentSample)
      gameData.totalCorrect += 1
    } else {
      sound.wrong.play()
      setDarkDisplayText(true, choosenGenre.genre + '<br> is incorrect :(')
    }
  }, 1700)
  // Wait even more to start new round
  setTimeout(function () {
    startNewRound(true)
  }, 3700)
}

var noAnswerChoosen = function () {
  killPadsAnimation()
  blinkAllPads('red', 'orange')
  videoPlayer.pauseVideo()
  gameData.gameIsActive = false

  setDarkDisplayText(true, 'You were to slow...')

  setTimeout(function () {
    startNewRound()
  }, 3000)
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
    blinkDisplayText(true)
  })

  // Mute Button
  buttons[1].addEventListener('click', function (event) {
  })

  // About Button
  buttons[2].addEventListener('click', function (event) {
  })
}

// NORMAL DISPLAY TEXT
// -------------------------------------------------------
var setDisplayText = function (string, animated, callback) {
  if (!animated) {
    document.getElementsByClassName('interface__info')[0].innerHTML = string
    return
  }

  string = string.replace('&', '&amp;')
  document.getElementsByClassName('interface__info')[0].innerHTML = ''
  var typed = new Typed('.interface__info', {
    strings: [string],
    typeSpeed: 20,
    onComplete: function () {
      if (!callback) return
      callback()
    }
  })
}

var blinkDisplayText = function (play) {
  var textElm = document.getElementsByClassName('interface__info')[0]

  if (!play) {
    TweenLite.killTweensOf(textElm)
    TweenLite.to(textElm, 0.2, {
      opacity: 1
    })
    return
  }

  var animate = function (grow) {
    TweenLite.to(textElm, 0.2, {
      opacity: 1,
      onComplete: function () {
        TweenLite.to(textElm, 0.2, {
          opacity: 0,
          delay: 0.2,
          onComplete: function () {
            animate()
          }
        })
      }
    })
  }
  animate()
}

// DARK DISPLAY TEXT
// -------------------------------------------------------

var setDarkDisplayText = function (show, string = '') {
  var darkScreen = document.getElementsByClassName('interface--dark')[0]
  darkScreen.style.opacity = show ? 1 : 0

  var textElm = darkScreen.getElementsByTagName('p')[0]
  textElm.innerHTML = string
}

// SAMPLE INDICATOR
// -------------------------------------------------------
var updateCurrentSample = function () {
  var currentSample = gameData.currentGame.track.currentSample
  var elms = document.getElementsByClassName('interface__samples')[0].children

  Array.from(elms).forEach(function (elm, index) {
    var textElm = elm.children[0]

    elm.style.backgroundColor = '#d5dac9'
    textElm.style.color = '#262b2a'
    textElm.style.opacity = 1

    if (index === currentSample) {
      elm.style.backgroundColor = '#262b2a'
      textElm.style.color = '#d5dac9'
    }
  })
}

var resetSamplesBackground = function () {
  var sampleBackgrounds = document.getElementsByClassName('interface__samples')[0].children

  var reset = function (elm) {
    var textElm = elm.children[0]
    elm.style.backgroundColor = '#d5dac9'
    textElm.style.color = '#262b2a'
    textElm.style.opacity = 1
  }

  for (var i = 0; i < sampleBackgrounds.length; i++) {
    reset(sampleBackgrounds.item(i))
  }
}

// STATS
// -------------------------------------------------------
var renderStats = function () {
  document.getElementsByClassName('total-score')[0].innerHTML = gameData.totalScore
  document.getElementsByClassName('total-correct')[0].innerHTML = gameData.totalCorrect
  document.getElementsByClassName('total-rounds')[0].innerHTML = gameData.totalRounds
}

var resetStats = function () {
  gameData.totalScore = 0
  gameData.totalCorrect = 0
  gameData.totalRounds = 0
  renderStats()
}

// EQUALIZER
// -------------------------------------------------------

var animateEqualizer = function (play) {
  play ? startEqualizer() : stopEqualizer()
}

var startEqualizer = function () {
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
        backgroundColor: 'rgb(' + padColors[color] + ')',
        onComplete: function () {
          TweenLite.to(pad, 0.1, {
            backgroundColor: 'rgb(' + padColors.blue + ')',
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
    backgroundColor: 'rgb(' + padColors[color] + ')',
    onComplete: function () {
      TweenLite.to(pads, 0.1, {
        backgroundColor: 'rgb(' + padColors.blue + ')',
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
      backgroundColor: 'rgb(' + padColors[toColor] + ')',
      onComplete: function () {
        TweenLite.to(pads, 0.1, {
          backgroundColor: 'rgb(' + padColors[fromColor] + ')',
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
      backgroundColor: 'rgb(' + padColors['pink'] + ')',
      onComplete: function () {
        TweenLite.to(choosenPad, speed, {
          backgroundColor: 'rgb(' + padColors['blue'] + ')',
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
      var padColor = pads[currentPad].getElementsByClassName('pad__color')[0]
      var padText = pads[currentPad].getElementsByClassName('pad__title')[0]

      TweenLite.to(padColor, 0.3, {
        backgroundColor: 'rgb(' + padColors.green + ')',
        onComplete: function () {
          padText.innerHTML = gameData.currentGame.answers[currentPad].genre
          TweenLite.to(padColor, 0.1, {
            backgroundColor: 'rgb(' + padColors.blue + ')',
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

var killPadsAnimation = function (pads) {
  var pads = document.getElementsByClassName('pad__color')
  TweenLite.killTweensOf(pads)
  TweenLite.to(pads, 0.2, {
    backgroundColor: 'rgb(' + padColors.blue + ')'
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

// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script')
tag.src = 'https://www.youtube.com/iframe_api'
var firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

var onYouTubeIframeAPIReady = function () {
  videoPlayer = new YT.Player('videoPlayer', {
    height: '200',
    width: '300',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onPlayerError
    }
  })
}

var onPlayerReady = function () {
  videoPlayerIsReady = true
  // Unmute youtube player
  // if (videoPlayer.isMuted()) { videoPlayer.unMute() }
  videoPlayer.mute()
}

var onPlayerStateChange = function (e) {
  if (e.data === -1) {
  } else if (e.data === 0) {
    // ended
  } else if (e.data === 1) {
    animateEqualizer(true)

    var updater = function () {
      if (videoPlayer.getPlayerState() === 1) {
        sampleHandeling()
        setTimeout(updater, 100)
      }
    }
    updater()

    // playing
  } else if (e.data === 2) {
    animateEqualizer(false)
    // paused
  } else if (e.data === 3) {
    animateEqualizer(false)
    // buffering
  } else if (e.data === 5) {
    // video cued
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

// PREPAIR VIDEO SAMPLE POINTS
// -------------------------------------------------------
var prepairVideo = function () {
  return new Promise(function (resolve, reject) {
    videoPlayer.loadVideoById(gameData.currentGame.track.info.ytId, 40, 'small')

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
  updateCurrentSample()
  var sampleTimeStamps = gameData.currentGame.track.sampleTimeStamps
  var currentSample = gameData.currentGame.track.currentSample
  videoPlayer.seekTo(sampleTimeStamps[currentSample])
  videoPlayer.playVideo()
  videoPlayer.unMute()
}

var sampleHandeling = function () {
  var currentTime = videoPlayer.getCurrentTime()
  var currentSample = gameData.currentGame.track.currentSample
  var startPoint = gameData.currentGame.track.sampleTimeStamps[currentSample]

  if (videoPlayerIsReady) {
    if (currentTime > startPoint + 10) {
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
