
// Init interactions

const setHeight = () => {
  document.body.style.height = window.innerHeight + 'px'
}

if ('ontouchstart' in window || navigator.maxTouchPoints) {
  document.body.style.height = window.innerHeight + 'px'
  window.addEventListener('resize', setHeight)
}
