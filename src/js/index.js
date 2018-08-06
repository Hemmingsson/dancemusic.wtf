// Parcel
import '../scss/main.scss'

import { TweenLite } from 'gsap'
import interactions from './interactions.js'
import mobile from './mobile.js'

document.addEventListener('DOMContentLoaded', () => {
  interactions.init()
  if (!cssPropertySupported(['-ms-flexbox', '-webkit-box', 'flex'])) document.body.className = 'no-flex'
})

function cssPropertySupported (pNames) {
  const element = document.createElement('a')

  let index = pNames.length

  try {
    while (index--) {
      const name = pNames[index]

      element.style.display = name
      if (element.style.display === name) {
        return true
      }
    }
  } catch (pError) {}

  return false
}

