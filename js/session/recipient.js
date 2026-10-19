// The recipient who unlocked the card, and their photo once it has loaded.
import { $ } from '../core/dom.js';
import { state } from '../core/state.js';
import { DEFAULT_WISH } from '../config.js';
import { restoreCardTheme } from './card-theme.js';

export let activeRecipient = null,
  activeRecipientImage = null,
  photoReady = Promise.resolve();
let photoVersion = 0;

export function recipientWish() {
  return activeRecipient?.wish || DEFAULT_WISH;
}

export function renderRecipientPortrait() {
  const portrait = $('recipientPortrait'),
    hasPhoto = !!activeRecipientImage;
  portrait.hidden = !hasPhoto;
  $('bouquet').hidden = hasPhoto;
  $('endingStage').classList.toggle('has-portrait', hasPhoto);
  if (hasPhoto) {
    portrait.src = activeRecipientImage.src;
    portrait.alt = 'Ảnh của ' + (activeRecipient?.name || state.nickname);
  } else {
    portrait.removeAttribute('src');
    portrait.alt = '';
  }
  const failed = !!activeRecipient && !activeRecipientImage;
  $('photoStatus').hidden = !failed;
  $('photoStatus').textContent = failed ? 'Ảnh chưa mở được. Lời chúc của bạn vẫn ở đây nhé.' : '';
}

export function prepareRecipientPhoto(profile) {
  const version = ++photoVersion;
  activeRecipient = profile;
  restoreCardTheme(profile);
  activeRecipientImage = null;
  renderRecipientPortrait();
  if (!profile) {
    photoReady = Promise.resolve();
    return;
  }
  photoReady = new Promise((resolve) => {
    const img = new Image();
    let done = false;
    const finish = (success) => {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      if (version === photoVersion) {
        activeRecipientImage = success ? img : null;
        renderRecipientPortrait();
      }
      resolve();
    };
    const timeout = setTimeout(() => finish(false), 10000);
    img.decoding = 'async';
    img.onload = () => finish(img.naturalWidth > 0);
    img.onerror = () => finish(false);
    img.src = profile.photo;
  });
}
