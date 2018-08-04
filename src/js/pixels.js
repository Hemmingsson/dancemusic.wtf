// Canvas

var overlay = document.querySelector('.interface__overlay')

var canvas = overlay.querySelector('canvas')
var ctx = canvas.getContext('2d')

var fadeRAF

// Pixel Style
var pixelSize = 4
var startFill = 0.5
var fill = startFill

// Animation
var fpsInterval, now, then, elapsed

// Canvas size
function getCanvasWidth () {
  return canvas.width
}

function getCanvastHeight () {
  return canvas.width
}

// Canvas responsive
var vw = getCanvasWidth()
var vh = getCanvastHeight()
// window.addEventListener('resize', onResize, false)

function onResize () {
  vw = getCanvasWidth()
  vh = getCanvastHeight()
  resizeCanvas()
}

function resizeCanvas () {
  canvas.width = vw
  canvas.height = vh
}
resizeCanvas()

function draw (x, y) {
  setColor()
  ctx.fillRect(x, y, pixelSize, pixelSize)
  if (fill > 2) {
    cancelAnimationFrame(fadeRAF)
  }
}

function drawEach () {
  // clearCanvas()
  for (var x = 0; x < vw; x += pixelSize) {
    for (var y = 0; y < vh; y += pixelSize) {
      draw(x, y)
    }
  }
}

function clearCanvas () {
  ctx.clearRect(0, 0, vw, vh)
}

function setColor () {
  if (fadeIn) {
    return Math.round(Math.random() - fill) ? (ctx.fillStyle = '#4a4e4b') : (ctx.fillStyle = '#d5dac9')
  } else {
    return Math.round(Math.random() - fill) ? (ctx.fillStyle = '#d5dac9') : (ctx.fillStyle = '#4a4e4b')
  }
}

var fadeIn
function fade (show) {
  return new Promise(function (resolve, reject) {
    if (fadeRAF) cancelAnimationFrame(fadeRAF)
    fill = startFill
  // clearCanvas()
    fadeIn = show

    fpsInterval = 50
    then = Date.now()
    animate()
    setTimeout(resolve, 800)
  })
}

function animate () {
  fadeRAF = requestAnimationFrame(animate)
  now = Date.now()
  elapsed = now - then
  if (elapsed > fpsInterval) {
    then = now - elapsed % fpsInterval
    fill += 0.07
    drawEach()
  }
}

module.exports = {
  fade
}

