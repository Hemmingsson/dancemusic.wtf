var isEqualizerAnimating = false

var animate = function (play) {
  if (play === isEqualizerAnimating) return
  isEqualizerAnimating = play
  play ? startEqualizer() : stopEqualizer()
}

var startEqualizer = function () {
  var bars = document.getElementsByClassName('bar')
  var animateBar = function (bar) {
    var animation = function (grow) {
      var duration = (Math.random() * 0.4) + 0.2
      var baseHeight = 0.2
      if (grow) {
        baseHeight = (Math.random() * 0.65) + 0.25
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
    scaleY: 0.1,
    force3D: true
  })
}

module.exports = {animate}
