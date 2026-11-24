/* eslint semi: ["error", "always"] */

import tap from 'url:../static/sounds/tap.mp3';
import correct from 'url:../static/sounds/correct.mp3';
import wrong from 'url:../static/sounds/wrong.mp3';

export default {
  tap: new Audio(tap),
  correct: new Audio(correct),
  wrong: new Audio(wrong)
};
