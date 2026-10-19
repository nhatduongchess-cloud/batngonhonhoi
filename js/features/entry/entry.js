// The locked greeting card: typing a name unlocks it, then the guide page leads
// into the main page. Also handles "change name".
import { $, reducedMotion } from '../../core/dom.js';
import { emit, on } from '../../core/bus.js';
import { state } from '../../core/state.js';
import { route, isRouteBusy } from '../../core/router.js';
import { cuteEntrance } from '../../core/motion.js';
import recipients from '../../data/recipients.js';
import { prepareRecipientPhoto } from '../../session/recipient.js';
import { findRecipient, profileKey } from './recipient-search.js';

let selectedRecipientId = null,
  unlocking = false,
  unlockTimer = null;

function showRecipientChoices(profiles = []) {
  const box = $('recipientChoices');
  box.replaceChildren();
  box.hidden = !profiles.length;
  profiles.forEach((profile, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'recipient-choice';
    button.dataset.recipientId = profile.id;
    const img = document.createElement('img');
    img.src = profile.photo;
    img.alt = '';
    img.decoding = 'async';
    img.width = 52;
    img.height = 58;
    const label = document.createElement('span');
    label.textContent = profile.name;
    if (profiles.filter((p) => profileKey(p.name) === profileKey(profile.name)).length > 1) {
      const hint = document.createElement('small');
      hint.textContent = 'Chọn theo ảnh ' + (index + 1);
      label.append(hint);
    }
    button.append(img, label);
    button.addEventListener('click', () => {
      selectedRecipientId = profile.id;
      $('nickname').value = profile.name;
      showRecipientChoices();
      $('loginForm').requestSubmit();
    });
    box.append(button);
  });
}

function resetCardEntry() {
  clearTimeout(unlockTimer);
  unlockTimer = null;
  unlocking = false;
  $('lockedCard').classList.remove('is-unlocking');
  $('cardInside').setAttribute('aria-hidden', 'true');
  $('cardCover').removeAttribute('aria-hidden');
  $('cardCover').inert = false;
  $('nickname').disabled = false;
  $('unlockCard').disabled = false;
  $('unlockStatus').textContent = '';
}

function openCardEntry() {
  cuteEntrance($('welcome'), 'unlock');
  unlocking = true;
  $('unlockName').textContent = state.nickname;
  $('unlockStatus').textContent = 'Đã mở khóa tấm thiệp dành cho ' + state.nickname + ' ♡';
  $('nickname').disabled = true;
  $('unlockCard').disabled = true;
  $('unlockCard').blur();
  $('cardCover').inert = true;
  $('cardCover').setAttribute('aria-hidden', 'true');
  $('cardInside').setAttribute('aria-hidden', 'false');
  $('lockedCard').classList.add('is-unlocking');
  unlockTimer = setTimeout(
    () => {
      route('guide');
    },
    reducedMotion.matches ? 150 : 1100,
  );
}

function submitName(e) {
  e.preventDefault();
  if (unlocking) return;
  const name = $('nickname').value.trim().replace(/\s+/g, ' ');
  if (!name) {
    $('nameError').textContent = 'Bạn để lại một tên nhỏ xinh trước nha ♡';
    $('nickname').setAttribute('aria-invalid', 'true');
    $('nickname').focus();
    return;
  }
  const chosen = recipients.find((p) => p.id === selectedRecipientId && profileKey(p.name) === profileKey(name));
  selectedRecipientId = null;
  const match = chosen ? { profile: chosen, error: '', candidates: [] } : findRecipient(name, recipients);
  showRecipientChoices(match.candidates);
  if (match.error) {
    $('nameError').textContent = match.error;
    $('nickname').setAttribute('aria-invalid', 'true');
    $('nickname').focus();
    return;
  }
  prepareRecipientPhoto(match.profile);
  state.nickname = match.profile ? match.profile.name : Array.from(name).slice(0, 40).join('');
  $('nickname').value = state.nickname;
  $('nickname').removeAttribute('aria-invalid');
  $('nameError').textContent = '';
  for (const id of ['guideName', 'displayName', 'letterName', 'completeName', 'endingName'])
    $(id).textContent = state.nickname;
  emit('session:start');
  openCardEntry();
}

function changeName() {
  if (isRouteBusy()) return;
  selectedRecipientId = null;
  showRecipientChoices();
  prepareRecipientPhoto(null);
  emit('session:reset');
  route('welcome', 'nickname');
}

export function init() {
  $('loginForm').addEventListener('submit', submitName);
  $('nickname').addEventListener('input', () => {
    selectedRecipientId = null;
    showRecipientChoices();
    $('nickname').removeAttribute('aria-invalid');
    $('nameError').textContent = '';
  });
  $('enterMain').onclick = () => {
    if (isRouteBusy()) return;
    route('mainPage');
    emit('audio:autoplay');
  };
  $('backWelcome').onclick = changeName;
  $('changeName').onclick = changeName;
  on('route:show', ({ id }) => {
    if (id === 'welcome') resetCardEntry();
  });
  window.addEventListener('pagehide', () => {
    clearTimeout(unlockTimer);
  });
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && state.activePage === 'welcome') resetCardEntry();
  });
}
