
// Init interactions
const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints
const setHeight = () => {
  document.body.style.height = window.innerHeight + 'px'
}

if (isMobile) {
  document.body.style.height = window.innerHeight + 'px'
  window.addEventListener('resize', setHeight)
}

const tapStart = () => {
    // Fix for iOS Safari, as they prevent me from autoplaying in background
  if (isMobile) {
    document.querySelector('.big').innerHTML = 'Tap [HERE] to Play'
    document.querySelector('.interface').addEventListener('click', () => {
      global.video.player.playVideo()
    })
  }
}

export default {
  tapStart
}
