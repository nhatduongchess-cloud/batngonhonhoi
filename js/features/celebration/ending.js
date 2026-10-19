// The ending card inside the celebration dialog: the recipient's photo (or a
// bouquet), their wish, scrapbook doodles and the card theme picker.
import { $ } from '../../core/dom.js';
import { on } from '../../core/bus.js';
import { state } from '../../core/state.js';
import { changeModalScene } from '../../core/dialogs.js';
import { cardPalette, setCardTheme } from '../../session/card-theme.js';
import { recipientWish, renderRecipientPortrait } from '../../session/recipient.js';
import {
  drawBouquet,
  drawBunny,
  drawKitten,
  drawLoopy,
  happyStar,
  roseBouquet,
  stickerStar,
  tinyHeart,
  washiTape,
} from '../../drawing/doodles.js';

function drawEndingDecor() {
  const c = $('endingDecor'),
    art = $('endingArt'),
    w = art.clientWidth,
    h = art.clientHeight;
  if (!w || !h) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext('2d');
  g.scale(dpr, dpr);
  const small = w < 400;
  washiTape(g, small ? w * 0.37 : 176, small ? 34 : 39, small ? 64 : 90, -0.24, cardPalette().tape);
  roseBouquet(g, w - (small ? 42 : 66), small ? 79 : 93, small ? 0.61 : 0.94, 0.33);
  drawLoopy(g, w - (small ? 48 : 84), h - (small ? 80 : 115), small ? 0.77 : 1.04, 0.13);
  drawKitten(g, small ? 32 : 60, h - (small ? 27 : 45), small ? 0.45 : 0.58, false);
  stickerStar(g, small ? 13 : 33, small ? 114 : 150, small ? 9 : 13, -0.28);
  stickerStar(g, w - (small ? 19 : 30), h - (small ? 17 : 48), small ? 7 : 10, 0.2);
  tinyHeart(g, w - (small ? 27 : 58), small ? 154 : 196, small ? 0.32 : 0.48, '#edb2c9');
  tinyHeart(g, small ? 95 : 149, h - 20, 0.28, '#cdb7e4');
  drawBunny(g, w * 0.53, h - 28, small ? 0.3 : 0.43, -0.12);
  happyStar(g, small ? 14 : 31, small ? 213 : 238, small ? 8 : 12, 0.2);
}

function showEnding() {
  return changeModalScene(
    'endingStage',
    'endingTitle',
    () => {
      $('endingName').textContent = state.nickname || 'Bạn';
      $('endingWish').textContent = recipientWish();
      renderRecipientPortrait();
      drawEndingDecor();
      $('cardStatus').textContent = '';
      $('cardFallback').hidden = true;
      const bouquet = $('bouquet'),
        g = bouquet.getContext('2d');
      g.clearRect(0, 0, bouquet.width, bouquet.height);
      drawBouquet(g, 360, 290, 1.7);
    },
    'saveCard',
  );
}

export function init() {
  on('ending:show', showEnding);
  new ResizeObserver(drawEndingDecor).observe($('endingArt'));
  document.querySelectorAll('input[name="cardTheme"]').forEach((input) =>
    input.addEventListener('change', () => {
      if (!input.checked) return;
      setCardTheme(input.value);
      drawEndingDecor();
    }),
  );
}
