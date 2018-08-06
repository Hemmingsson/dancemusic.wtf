// Parcel
import '../scss/main.scss'

import { TweenLite } from 'gsap'
import interactions from './interactions.js'
import mobile from './mobile.js'

document.addEventListener('DOMContentLoaded', () => {
  interactions.init()

  // Detect if flexbox is supported
  const d = document
  let c = ' '
  const prefixFlex = 'flex -webkit-flex -ms-flexbox -moz-box -webkit-box'.split(' ')
  const elem = d.createElement('b')
  let mStyle = elem.style
  try {
    for (var i = 0, len = prefixFlex.length; i < len; i++) {
      c += ((mStyle.display = prefixFlex[i]) && mStyle.display !== prefixFlex[i]) ? 'no-flex' : 'flex', (i = len)
    }
  } catch (e) {
    c += 'no-flex'
  }
  d.body.className = c + 'box'
})
