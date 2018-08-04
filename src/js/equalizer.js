
/* global TweenLite */
let isEqualizerAnimating = false

const animate = play => {
  if (play === isEqualizerAnimating) return
  isEqualizerAnimating = play
  play ? startEqualizer() : stopEqualizer()
}

var startEqualizer = () => {
  const bars = document.getElementsByClassName('bar')

  const timeRand = () => (Math.random() * 0.4) + 0.25
  const heightRand = () => (Math.random() * 0.65) + 0.3

  const animateBar = (bar, i) => {
    new TimelineMax({
      repeat: -1,
      yoyo: true,
      ease: 'Circ.easeInOut',
      delay: i * 0.01
    }).to(bar, timeRand(), { scaleY: heightRand() })
      .to(bar, timeRand(), { scaleY: 0.2 })
      .to(bar, timeRand(), { scaleY: heightRand() })
      .to(bar, timeRand(), { scaleY: 0.3 })
      .to(bar, timeRand(), { scaleY: heightRand() })
      .to(bar, timeRand(), { scaleY: 0.2 })
    .play()
  }
  for (let i = 0; i < bars.length; i++) {
    animateBar(bars[i], i)
  }
}

var stopEqualizer = () => {
  const elms = document.getElementsByClassName('bar')
  TweenLite.killTweensOf(elms)
  TweenLite.to(elms, 0.1, {
    scaleY: 0.1,
    force3D: true
  })
}

export default {animate}
