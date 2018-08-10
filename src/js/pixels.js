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
const getCanvasWidth = () => {
  return canvas.width
}

const getCanvastHeight = () => {
  return canvas.width
}

// Canvas responsive
let vw = getCanvasWidth()
let vh = getCanvastHeight()
// window.addEventListener('resize', onResize, false)

const onResize = () => {
  vw = getCanvasWidth()
  vh = getCanvastHeight()
  resizeCanvas()
}

const resizeCanvas = () => {
  canvas.width = vw
  canvas.height = vh
}
resizeCanvas()

const draw = (x, y) => {
  setColor()
  ctx.fillRect(x, y, pixelSize, pixelSize)
  if (fill > 2) {
    cancelAnimationFrame(fadeRAF)
  }
}

const drawEach = () => {
  // clearCanvas()
  for (var x = 0; x < vw; x += pixelSize) {
    for (var y = 0; y < vh; y += pixelSize) {
      draw(x, y)
    }
  }
}

const clearCanvas = () => {
  ctx.clearRect(0, 0, vw, vh)
}

const setColor = () => {
  if (fadeIn) {
    return Math.round(Math.random() - fill) ? (ctx.fillStyle = '#4a4e4b') : (ctx.fillStyle = '#d5dac9')
  } else {
    return Math.round(Math.random() - fill) ? (ctx.fillStyle = '#d5dac9') : (ctx.fillStyle = '#4a4e4b')
  }
}

let fadeIn
const fade = (show) => {
  return new Promise(function (resolve, reject) {
    if (fadeRAF) cancelAnimationFrame(fadeRAF)
    fill = startFill
  // clearCanvas()
    fadeIn = show

    fpsInterval = 50
    then = Date.now()
    animate()
    setTimeout(() => {
      overlay.style.backgroundColor = show ? '#4a4e4b' : '#d5dac9'
      resolve()
    }, 800)
  })
}

const animate = () => {
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

