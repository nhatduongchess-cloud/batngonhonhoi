// The letter dialog, revealed word by word.
import { $, reducedMotion } from '../core/dom.js';
import { isClosing, requestDialogClose } from '../core/dialogs.js';

let letter,
  letterAnimations = [];

function finishLetterReveal() {
  const pending = letterAnimations;
  letterAnimations = [];
  for (const a of pending) a.cancel();
}

function revealLetter() {
  finishLetterReveal();
  if (reducedMotion.matches || document.hidden) return;
  const animations = [];
  const run = (el, frames, options) => {
    if (el?.animate)
      animations.push(el.animate(frames, { fill: 'both', easing: 'cubic-bezier(.22,.65,.3,1)', ...options }));
  };
  run(
    letter.querySelector('.letter-date'),
    [
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    { duration: 650 },
  );
  run(
    letter.querySelector('.letter-flower'),
    [
      { opacity: 0, scale: '.65', rotate: '-8deg' },
      { opacity: 1, scale: '1', rotate: '0deg' },
    ],
    { duration: 1100, delay: 120 },
  );
  run(
    $('letterTitle'),
    [
      { opacity: 0, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    { duration: 950, delay: 180 },
  );
  let count = 0;
  for (const paragraph of letter.querySelectorAll('p:not(.signature):not(.small)')) {
    if (!paragraph.querySelector('.letter-word')) {
      const words = paragraph.textContent.split(/(\s+)/);
      paragraph.replaceChildren(
        ...words.map((word) => {
          if (/^\s+$/.test(word)) return document.createTextNode(word);
          const span = document.createElement('span');
          span.className = 'letter-word';
          span.textContent = word;
          return span;
        }),
      );
    }
    for (const word of paragraph.querySelectorAll('.letter-word')) {
      run(
        word,
        [
          { opacity: 0, transform: 'translateY(9px) rotate(-1deg)' },
          { opacity: 1, transform: 'translateY(0) rotate(0deg)' },
        ],
        { duration: 620, delay: 600 + count * 16 },
      );
      count++;
    }
  }
  for (const [i, el] of [
    letter.querySelector('.signature'),
    letter.querySelector('.small'),
    letter.querySelector('.liber-autograph'),
    letter.querySelector('.letter-petals'),
  ].entries())
    run(
      el,
      [
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 850, delay: 600 + count * 16 + i * 140 },
    );
  letterAnimations = animations;
  Promise.allSettled(animations.map((a) => a.finished)).then(() => {
    if (letterAnimations === animations) finishLetterReveal();
  });
}

export function init() {
  letter = $('letter');
  $('openLetter').onclick = () => {
    if (letter.open || isClosing(letter)) return;
    letter.showModal();
    letter.scrollTop = 0;
    revealLetter();
  };
  letter.addEventListener('close', finishLetterReveal);
  letter.addEventListener('liber:closing', finishLetterReveal);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) finishLetterReveal();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) finishLetterReveal();
  });
  $('closeLetter').onclick = () => requestDialogClose(letter);
  letter.addEventListener('cancel', (e) => {
    e.preventDefault();
    requestDialogClose(letter);
  });
  letter.addEventListener('click', (e) => {
    if (e.target === letter) {
      const r = letter.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
        requestDialogClose(letter);
    }
  });
}
