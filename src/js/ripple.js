/* global TweenLite */

var createRipple = elm => {
  elm.addEventListener('mousedown', function (event) {
    event.preventDefault()

    const rect = this.getBoundingClientRect()

    const xPos = event.pageX - rect.left
    const yPos = event.pageY - rect.top

    const wavesRipple = document.createElement('div')

    wavesRipple.className = 'ripple-burst'
    wavesRipple.style.left = `${xPos}px`
    wavesRipple.style.top = `${yPos}px`

    this.appendChild(wavesRipple)

    TweenLite.to(wavesRipple, 0.6, {
      scale: 70,
      opacity: 0,
      force3D: true,
      ease: 'Sine.easeOut',
      onComplete (elements) { wavesRipple.remove() }
    })
  })
}

export default {
  init () {
    const elms = document.querySelectorAll('.ripple-effect')
    Array.from(elms).forEach(elm => { createRipple(elm) })
  }
}
