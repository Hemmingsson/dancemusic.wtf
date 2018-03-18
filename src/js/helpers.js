var setVerticalHeightMobile = function () {
  if ('ontouchstart' in window || navigator.maxTouchPoints) {
    document.body.style.height = window.innerHeight + 'px'
  }
}

module.exports = {
  setVerticalHeightMobile
}
