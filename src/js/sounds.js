/* eslint semi: ["error", "always"] */

import tap from '.././static/sounds/tap.mp3';
import correct from '.././static/sounds/correct.mp3';
import wrong from '.././static/sounds/wrong.mp3';

export default {
  tap: new Audio(tap),
  correct: new Audio(correct),
  wrong: new Audio(wrong)
};
