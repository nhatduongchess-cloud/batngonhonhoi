import { on } from '../core/bus.js';
import { activeRecipient } from '../session/recipient.js';
import { isBirthdayRecipient } from '../session/birthday.js';
let birthdayWished = false;
function renderBirthday() {
  document.querySelectorAll('.birthday-surprise').forEach((panel) => {
    panel.hidden = !isBirthdayRecipient(activeRecipient);
    panel.classList.toggle('is-wished', birthdayWished);
    const button = panel.querySelector('.birthday-wish-button');
    button.disabled = birthdayWished;
    button.textContent = birthdayWished ? 'Đã gửi điều ước ♡' : 'Ước một điều rồi thổi nến ♡';
    panel.querySelector('.birthday-status').textContent = birthdayWished
      ? 'Mong điều ước của Thảo sớm thành hiện thực!'
      : '';
    panel
      .querySelector('.birthday-cake')
      .setAttribute(
        'aria-label',
        birthdayWished ? 'Bánh kem sinh nhật màu hồng, nến đã tắt' : 'Bánh kem sinh nhật màu hồng với ba ngọn nến',
      );
  });
}
export function init() {
  document.querySelectorAll('.birthday-wish-button').forEach((button) =>
    button.addEventListener('click', () => {
      if (!isBirthdayRecipient(activeRecipient) || birthdayWished) return;
      birthdayWished = true;
      renderBirthday();
    }),
  );

  const reset = () => {
    birthdayWished = false;
    renderBirthday();
  };
  on('session:start', reset);
  on('session:reset', reset);
  reset();
}
