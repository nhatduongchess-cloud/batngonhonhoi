// The downloadable keepsake card: a 3:4 card or a 9:16 story, drawn on a canvas
// in the chosen theme and saved as PNG.
import { $ } from '../core/dom.js';
import { state } from '../core/state.js';
import { activeCardTheme, cardPalette } from '../session/card-theme.js';
import { activeRecipientImage, photoReady, recipientWish } from '../session/recipient.js';
import {
  blossom,
  drawBouquet,
  drawBunny,
  drawKitten,
  drawLoopy,
  floralSprig,
  happyStar,
  leaf,
  roseBouquet,
  stickerStar,
  tinyHeart,
  washiTape,
} from '../drawing/doodles.js';

function wrapCardText(g, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of text.normalize('NFC').split(/\s+/)) {
    if (g.measureText(word).width > maxWidth) {
      if (line) {
        lines.push(line);
        line = '';
      }
      for (const char of Array.from(word)) {
        if (g.measureText(line + char).width > maxWidth) {
          lines.push(line);
          line = char;
        } else line += char;
      }
    } else {
      const next = line ? line + ' ' + word : word;
      if (g.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function storySprinkles(g) {
  const dots = [
    [67, 290, 4],
    [1005, 552, 4],
    [40, 790, 3],
    [995, 1120, 5],
    [72, 1250, 4],
    [1010, 1490, 3],
    [570, 1785, 4],
    [470, 1815, 3],
    [1000, 1730, 4],
    [310, 185, 3],
  ];
  for (const [x, y, r] of dots) {
    g.fillStyle = '#cfacd0';
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  tinyHeart(g, 68, 576, 0.46, '#d79dbb');
  tinyHeart(g, 994, 749, 0.5, '#d1b1e0');
  tinyHeart(g, 1007, 1370, 0.42, '#efb9d0');
  happyStar(g, 68, 390, 21, -0.15);
  happyStar(g, 1009, 1194, 18, 0.2);
  stickerStar(g, 534, 1801, 12, 0.3);
}

function drawCardHeading(g, width) {
  g.save();
  g.scale(width / 1080, width / 1080);
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.fillStyle = cardPalette().ink;
  g.font = '700 72px "Nunito", "Segoe UI", sans-serif';
  g.fillText('L I B E R', 85, 99);
  g.fillStyle = cardPalette().accent;
  g.font = '600 37px "Dancing Script", "Nunito", cursive';
  g.fillText('Gửi riêng bạn, với yêu thương', 90, 166);
  // A tiny flying love letter bridges the free space between the title and date.
  g.save();
  g.translate(658, 118);
  g.rotate(-0.13);
  g.fillStyle = '#eacddd';
  g.strokeStyle = '#fff0f3';
  g.lineWidth = 3;
  g.beginPath();
  g.roundRect(-57, -36, 114, 76, 7);
  g.fill();
  g.stroke();
  g.strokeStyle = '#c18cab';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-54, -32);
  g.lineTo(0, 6);
  g.lineTo(54, -32);
  g.moveTo(-54, 36);
  g.lineTo(-17, 3);
  g.moveTo(54, 36);
  g.lineTo(17, 3);
  g.stroke();
  tinyHeart(g, 0, 7, 0.75, '#bf6a94');
  g.restore();
  g.strokeStyle = '#d5afd08c';
  g.lineWidth = 2;
  g.setLineDash([3, 7]);
  g.beginPath();
  g.moveTo(545, 98);
  g.bezierCurveTo(553, 43, 642, 41, 710, 59);
  g.stroke();
  g.setLineDash([]);
  stickerStar(g, 743, 88, 15, 0.18);
  tinyHeart(g, 571, 143, 0.37, '#e0a3c4');
  g.save();
  g.translate(917, 132);
  g.rotate(0.1);
  g.fillStyle = '#f2d4df';
  g.shadowColor = '#0003';
  g.shadowBlur = 10;
  g.shadowOffsetY = 5;
  g.fillRect(-111, -62, 222, 124);
  g.shadowBlur = 0;
  g.shadowOffsetY = 0;
  g.strokeStyle = '#be87a444';
  g.lineWidth = 1.5;
  g.strokeRect(-102, -53, 204, 106);
  g.textAlign = 'center';
  g.fillStyle = '#8d4c70';
  g.font = '700 46px "Nunito", "Segoe UI", sans-serif';
  g.fillText('20/10', 0, -12);
  g.font = '600 25px "Dancing Script", "Nunito", cursive';
  g.fillText('Dành cho bạn ♡', 0, 34);
  g.restore();
  blossom(g, 1020, 66, 17, '#cbb3df', 0.3);
  leaf(g, 1038, 85, 0.7, 10);
  g.restore();
}

function drawWishNote(g, x, y, width, height, tilt) {
  g.save();
  g.translate(x, y);
  g.rotate(tilt);
  g.fillStyle = cardPalette().note;
  g.shadowColor = '#0003';
  g.shadowBlur = 12;
  g.fillRect(0, 0, width, height);
  g.shadowBlur = 0;
  if (activeCardTheme === 'rose') {
    g.strokeStyle = cardPalette().back;
    g.lineWidth = 2;
    g.strokeRect(8, 8, width - 16, height - 16);
  }
  const padX = 44,
    padY = 30,
    available = height - padY * 2;
  let fontSize = 34,
    lines;
  do {
    g.font = `${fontSize}px "Nunito", "Segoe UI", sans-serif`;
    lines = wrapCardText(g, recipientWish(), width - padX * 2);
    if (lines.length * fontSize * 1.45 <= available) break;
    fontSize--;
  } while (fontSize > 20);
  const lineHeight = Math.min(available / lines.length, fontSize * 1.7),
    top = (height - lines.length * lineHeight) / 2 + lineHeight / 2;
  g.fillStyle = cardPalette().noteInk;
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  lines.forEach((line, i) => g.fillText(line, padX, top + i * lineHeight));
  washiTape(g, width - 145, 0, 126, -0.16, cardPalette().tape);
  g.restore();
}

function drawLiberSignature(g, right, baseline, size) {
  g.save();
  g.fillStyle = cardPalette().accent;
  g.strokeStyle = cardPalette().accent;
  g.lineWidth = 1.8;
  g.lineCap = 'round';
  g.font = `600 ${size}px "Dancing Script", "Nunito", cursive`;
  g.textAlign = 'right';
  g.textBaseline = 'alphabetic';
  g.fillText('Liber', right, baseline);
  const width = g.measureText('Liber').width;
  g.beginPath();
  g.moveTo(right - width - 8, baseline + 9);
  g.quadraticCurveTo(right - width * 0.45, baseline - 1, right + 5, baseline + 6);
  g.moveTo(right - width * 0.65, baseline + 15);
  g.quadraticCurveTo(right - width * 0.3, baseline + 7, right - 7, baseline + 12);
  g.stroke();
  g.restore();
}

function makeStoryCard() {
  const card = document.createElement('canvas');
  card.width = 1080;
  card.height = 1920;
  const g = card.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 1080, 1920);
  bg.addColorStop(0, cardPalette().bg1);
  bg.addColorStop(1, cardPalette().bg2);
  g.fillStyle = bg;
  g.fillRect(0, 0, 1080, 1920);
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  storySprinkles(g);
  drawCardHeading(g, 1080);
  g.save();
  g.translate(495, 662);
  g.rotate(0.025);
  g.fillStyle = cardPalette().back;
  g.fillRect(-365, -422, 730, 850);
  g.restore();
  g.save();
  g.translate(484, 654);
  g.rotate(-0.065);
  g.fillStyle = cardPalette().frame;
  g.shadowColor = '#0005';
  g.shadowBlur = 24;
  g.shadowOffsetY = 12;
  g.fillRect(-365, -422, 730, 850);
  g.shadowBlur = 0;
  g.shadowOffsetY = 0;
  if (activeRecipientImage) {
    const img = activeRecipientImage,
      ratio = Math.min(690 / img.naturalWidth, 770 / img.naturalHeight),
      iw = img.naturalWidth * ratio,
      ih = img.naturalHeight * ratio;
    g.fillStyle = cardPalette().photo;
    g.fillRect(-345, -402, 690, 770);
    g.drawImage(img, -iw / 2, -402 + (770 - ih) / 2, iw, ih);
  } else {
    g.save();
    g.translate(-484, -654);
    drawBouquet(g, 484, 654, 2.7);
    g.restore();
  }
  g.restore();
  washiTape(g, 440, 233, 180, -0.13, cardPalette().tape);
  roseBouquet(g, 945, 340, 1.15, 0.32);
  drawLoopy(g, 947, 979, 1.45, 0.16);
  drawKitten(g, 78, 1066, 0.91);
  tinyHeart(g, 258, 1108, 0.4, '#e7b4ce');
  g.save();
  g.translate(98, 1176);
  g.rotate(-0.02);
  let size = 66,
    lines;
  do {
    g.font = `600 ${size}px "Dancing Script", "Nunito", cursive`;
    lines = wrapCardText(g, (state.nickname || 'Bạn') + ' ơi,', 875);
    if (lines.length <= 2) break;
    size -= 2;
  } while (size > 34);
  g.fillStyle = cardPalette().accent;
  lines.forEach((line, i) => g.fillText(line, 0, i * 70));
  g.font = '35px "Nunito", "Segoe UI", sans-serif';
  g.fillStyle = cardPalette().ink;
  g.fillText('Hãy luôn rạng rỡ nhé!', 0, lines.length * 70 + 2);
  g.restore();
  const noteY = lines.length > 1 ? 1395 : 1335;
  drawWishNote(g, 101, noteY, 875, 330, 0.025);
  drawBunny(g, 184, 1836, 0.85, -0.12);
  happyStar(g, 340, 1785, 27, 0.13);
  tinyHeart(g, 296, 1880, 0.35, '#e7aac5');
  floralSprig(g, 1000, 1794, 0.58, -1);
  g.textAlign = 'right';
  g.fillStyle = cardPalette().accent;
  g.font = '26px "Nunito", "Segoe UI", sans-serif';
  g.fillText('Thân thương, từ các bạn trai Liber', 963, 1829);
  drawLiberSignature(g, 951, 1894, 64);
  return card;
}

function makeClassicCard() {
  const card = document.createElement('canvas');
  card.width = 1200;
  card.height = 1600;
  const g = card.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 1200, 1600);
  bg.addColorStop(0, cardPalette().bg1);
  bg.addColorStop(1, cardPalette().bg2);
  g.fillStyle = bg;
  g.fillRect(0, 0, 1200, 1600);
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  drawCardHeading(g, 1200);
  g.save();
  g.translate(475, 507);
  g.rotate(0.065);
  g.fillStyle = cardPalette().back;
  g.fillRect(-240, -280, 480, 570);
  g.restore();
  if (activeRecipientImage) {
    const img = activeRecipientImage;
    g.save();
    g.translate(442, 509);
    g.rotate(-0.12);
    g.fillStyle = cardPalette().frame;
    g.shadowColor = '#0005';
    g.shadowBlur = 22;
    g.shadowOffsetY = 10;
    g.fillRect(-240, -280, 480, 574);
    g.shadowBlur = 0;
    g.shadowOffsetY = 0;
    const ratio = Math.min(440 / img.naturalWidth, 490 / img.naturalHeight),
      iw = img.naturalWidth * ratio,
      ih = img.naturalHeight * ratio;
    g.fillStyle = cardPalette().photo;
    g.fillRect(-220, -260, 440, 490);
    g.drawImage(img, -iw / 2, -260 + (490 - ih) / 2, iw, ih);
    g.restore();
  } else drawBouquet(g, 440, 530, 1.9);
  washiTape(g, 418, 232, 175, -0.21, cardPalette().tape);
  roseBouquet(g, 971, 371, 2.1, 0.35);
  drawLoopy(g, 938, 736, 2.6, 0.14);
  drawKitten(g, 136, 803, 1.25);
  stickerStar(g, 110, 345, 24, -0.24);
  stickerStar(g, 1105, 934, 19, 0.2);
  tinyHeart(g, 1063, 595, 0.9, '#e49ab9');
  tinyHeart(g, 742, 879, 0.6, '#bca3d6');
  g.save();
  g.translate(110, 939);
  g.rotate(-0.025);
  g.fillStyle = cardPalette().accent;
  let size = 66,
    lines;
  do {
    g.font = `600 ${size}px "Dancing Script", "Nunito", cursive`;
    lines = wrapCardText(g, (state.nickname || 'Bạn') + ' ơi,', 960);
    if (lines.length <= 2) break;
    size -= 2;
  } while (size > 32);
  lines.forEach((line, i) => g.fillText(line, 0, i * 65));
  g.fillStyle = cardPalette().ink;
  g.font = '38px "Nunito", "Segoe UI", Arial, sans-serif';
  g.fillText('Hãy luôn rạng rỡ nhé!', 0, lines.length * 65 + 2);
  g.restore();
  const noteY = lines.length > 1 ? 1135 : 1085;
  drawWishNote(g, 131, noteY, 940, 310, 0.035);
  g.textAlign = 'right';
  g.fillStyle = cardPalette().accent;
  g.font = '28px "Nunito", "Segoe UI", Arial, sans-serif';
  g.fillText('Thân thương, từ các bạn trai Liber', 1080, 1510);
  drawLiberSignature(g, 1068, 1574, 60);
  floralSprig(g, 104, 1481, 0.9, -1);
  stickerStar(g, 289, 1442, 12, 0.4);
  drawBunny(g, 360, 1511, 0.7, -0.14);
  happyStar(g, 475, 1492, 21, 0.2);
  return card;
}

async function saveCard() {
  const button = $('saveCard'),
    choices = [...document.querySelectorAll('input[name="cardFormat"],input[name="cardTheme"]')],
    format = choices.find((input) => input.name === 'cardFormat' && input.checked)?.value || 'classic';
  button.disabled = true;
  choices.forEach((input) => (input.disabled = true));
  $('cardFallback').hidden = true;
  $('cardStatus').textContent = 'Đang chuẩn bị thiệp của bạn…';
  try {
    await photoReady;
    await document.fonts.ready;
    await document.fonts.load('600 66px "Dancing Script"');
    await document.fonts.load('400 34px "Nunito"');
    await document.fonts.load('700 72px "Nunito"');
    const data = (format === 'story' ? makeStoryCard() : makeClassicCard()).toDataURL('image/png');
    const name =
      (state.nickname || 'ban')
        .normalize('NFC')
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-|-$/g, '') || 'ban';
    const a = document.createElement('a');
    a.href = data;
    a.download = 'Liber-20-10-' + name + '-' + activeCardTheme + (format === 'story' ? '-Story-9x16' : '') + '.png';
    document.body.append(a);
    a.click();
    a.remove();
    $('cardFallback').href = data;
    $('cardFallback').download = a.download;
    $('cardFallback').hidden = false;
    $('cardStatus').textContent =
      (format === 'story' ? 'Thiệp story đã sẵn sàng.' : 'Thiệp đã sẵn sàng.') +
      ' Nếu chưa thấy ảnh tải xuống, mở ảnh bên dưới để lưu nhé.';
  } catch (e) {
    $('cardStatus').textContent = 'Chưa tạo được thiệp. Bạn thử nhấn lại nhé.';
  } finally {
    button.disabled = false;
    choices.forEach((input) => (input.disabled = false));
  }
}

export function init() {
  document.querySelectorAll('input[name="cardFormat"]').forEach((input) =>
    input.addEventListener('change', () => {
      $('cardFallback').hidden = true;
      $('cardStatus').textContent = '';
    }),
  );
  $('saveCard').onclick = saveCard;
}
