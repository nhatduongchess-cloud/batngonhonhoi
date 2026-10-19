// The card theme chosen for the current recipient, remembered per person.
import { $ } from '../core/dom.js';
import { cardThemes } from '../data/card-themes.js';

export let activeCardTheme = 'scrapbook';
let profileId = null;

export function cardPalette() {
  return cardThemes[activeCardTheme] || cardThemes.scrapbook;
}

function applyCardTheme() {
  const dialog = $('celebration');
  dialog.dataset.cardTheme = activeCardTheme;
  for (const [key, value] of Object.entries(cardPalette()))
    if (key !== 'name') dialog.style.setProperty('--card-' + key, value);
  document.querySelectorAll('input[name="cardTheme"]').forEach((input) => {
    input.checked = input.value === activeCardTheme;
  });
  $('cardFallback').hidden = true;
  $('cardStatus').textContent = '';
}

export function restoreCardTheme(profile) {
  profileId = profile?.id ?? null;
  let saved;
  try {
    if (profile) saved = localStorage.getItem('liber-card-theme:' + profile.id);
  } catch {}
  activeCardTheme = Object.hasOwn(cardThemes, saved)
    ? saved
    : Object.hasOwn(cardThemes, profile?.theme)
      ? profile.theme
      : 'scrapbook';
  applyCardTheme();
}

export function setCardTheme(theme) {
  activeCardTheme = theme;
  applyCardTheme();
  try {
    if (profileId) localStorage.setItem('liber-card-theme:' + profileId, activeCardTheme);
  } catch {}
}
