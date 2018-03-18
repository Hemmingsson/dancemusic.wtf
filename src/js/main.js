
require('./libs/TweenMax.min.js')

global.game = require('./game.js')
global.states = require('./states.js')

var interactions = require('./interactions.js')
var helpers = require('./helpers.js')

/* ==========================================================================
INIT
========================================================================== */
helpers.setVerticalHeightMobile()
document.addEventListener('DOMContentLoaded', interactions.init)

document.addEventListener('DOMContentLoaded', function () {
  var big = document.getElementsByClassName('big')[0]
  big.innerHTML = wrapChars(big.innerHTML)
})

var wrapChars = function (str, tmpl) {
  return str.replace(/\w\D\d/g, '<span>$&</span>')
}
