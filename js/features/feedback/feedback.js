// The two-question feedback survey with the cat score slider. Drafts are kept on
// the device per recipient, so answers survive reloads and can be edited after sending.
import { $ } from '../../core/dom.js';
import { emit } from '../../core/bus.js';
import { state } from '../../core/state.js';
import { changeModalScene } from '../../core/dialogs.js';
import { FEEDBACK_ENDPOINT } from '../../config.js';
import { activeCardTheme } from '../../session/card-theme.js';
import { activeRecipient } from '../../session/recipient.js';
import { catDrawing, feedbackMood } from '../../drawing/cat.js';
import { sendFeedbackToGoogle } from './feedback-api.js';

const feedbackDrafts = new Map();
let currentFeedbackId = null,
  feedbackBusy = false;

function updateFeedbackCat() {
  const score = Number($('catScore').value);
  $('feedbackCat').innerHTML = catDrawing(score);
  $('catScoreOutput').value = score + ' / 100';
  $('catMood').textContent = feedbackMood(score);
  $('catScore').setAttribute('aria-valuetext', score + ' trên 100, ' + feedbackMood(score));
  $('catScore').style.setProperty('--cat-fill', score + '%');
  $('catScore').style.setProperty(
    '--cat-thumb',
    'url("data:image/svg+xml,' + encodeURIComponent(catDrawing(score, true)) + '")',
  );
}
function feedbackKey(id) {
  return 'liber-feedback-v1:' + id;
}
function readFeedbackDraft(id) {
  if (feedbackDrafts.has(id)) return feedbackDrafts.get(id);
  try {
    const d = JSON.parse(localStorage.getItem(feedbackKey(id)) || 'null');
    if (
      d &&
      typeof d.feelings === 'string' &&
      typeof d.impression === 'string' &&
      Number.isInteger(d.score) &&
      d.score >= 0 &&
      d.score <= 100
    ) {
      feedbackDrafts.set(id, d);
      return d;
    }
  } catch {}
  return { feelings: '', impression: '', score: 50, requestId: '', sent: false };
}
function keepFeedbackDraft(id, draft) {
  feedbackDrafts.set(id, draft);
  try {
    localStorage.setItem(feedbackKey(id), JSON.stringify(draft));
  } catch {}
}
function saveFeedbackDraft() {
  if (!currentFeedbackId || feedbackBusy) return;
  const old = readFeedbackDraft(currentFeedbackId),
    next = {
      feelings: $('feedbackFeeling').value,
      impression: $('feedbackImpression').value,
      score: Number($('catScore').value),
    };
  const changed = next.feelings !== old.feelings || next.impression !== old.impression || next.score !== old.score;
  keepFeedbackDraft(currentFeedbackId, { ...old, ...next, ...(changed ? { requestId: '', sent: false } : {}) });
}
function loadFeedbackDraft() {
  currentFeedbackId = activeRecipient?.id || null;
  const d = currentFeedbackId ? readFeedbackDraft(currentFeedbackId) : { feelings: '', impression: '', score: 50 };
  $('feedbackName').textContent = state.nickname || 'Bạn';
  $('feedbackFeeling').value = d.feelings;
  $('feedbackImpression').value = d.impression;
  $('catScore').value = d.score;
  $('feedbackStatus').textContent = '';
  updateFeedbackCat();
}
function openFeedback(edit = false) {
  if (feedbackBusy) return;
  loadFeedbackDraft();
  const sent = currentFeedbackId && readFeedbackDraft(currentFeedbackId).sent;
  if (sent && !edit) {
    $('feedbackThanksName').textContent = state.nickname;
    return changeModalScene('feedbackThanks', 'feedbackThanksTitle', null, 'feedbackThanksTitle');
  }
  return changeModalScene('feedbackStage', 'feedbackTitle', null, 'feedbackTitle');
}

async function submitFeedback(event) {
  event.preventDefault();
  if (feedbackBusy) return;
  const id = currentFeedbackId;
  if (!id) {
    $('feedbackStatus').textContent = 'Bạn quay lại nhập tên để gửi cảm nhận nhé.';
    return;
  }
  for (const input of [$('feedbackFeeling'), $('feedbackImpression')]) {
    if (!input.value.trim()) {
      input.setCustomValidity('Bạn viết một chút cảm nhận tại đây nhé.');
      input.reportValidity();
      input.setCustomValidity('');
      return;
    }
  }
  saveFeedbackDraft();
  const draft = readFeedbackDraft(id);
  draft.requestId = draft.requestId || crypto.randomUUID();
  keepFeedbackDraft(id, draft);
  const payload = {
    recipientId: id,
    feelings: draft.feelings.trim(),
    impression: draft.impression.trim(),
    score: draft.score,
    theme: activeCardTheme,
    requestId: draft.requestId,
  };
  feedbackBusy = true;
  const controls = [...$('feedbackForm').querySelectorAll('input,textarea,button'), $('feedbackBack')];
  controls.forEach((el) => (el.disabled = true));
  $('sendFeedback').textContent = 'Đang gửi…';
  $('feedbackStatus').textContent = 'Đang gửi lời nhắn của bạn tới Liber…';
  try {
    await sendFeedbackToGoogle(FEEDBACK_ENDPOINT, payload);
    keepFeedbackDraft(id, { ...draft, sent: true });
    if (currentFeedbackId === id) {
      $('feedbackStatus').textContent = 'Đã lưu cảm nhận của bạn.';
      if ($('celebration').open && !$('feedbackStage').hidden) {
        $('feedbackThanksName').textContent = state.nickname;
        await changeModalScene('feedbackThanks', 'feedbackThanksTitle', null, 'feedbackThanksTitle');
      }
    }
  } catch (error) {
    if (currentFeedbackId === id) $('feedbackStatus').textContent = error.message;
  } finally {
    feedbackBusy = false;
    controls.forEach((el) => (el.disabled = false));
    $('sendFeedback').textContent = 'Gửi cảm nhận ♡';
  }
}

export function init() {
  $('openFeedback').onclick = () => openFeedback();
  $('feedbackBack').onclick = () => {
    saveFeedbackDraft();
    emit('ending:show');
  };
  $('feedbackReturnCard').onclick = () => emit('ending:show');
  $('feedbackEdit').onclick = () => openFeedback(true);
  for (const id of ['feedbackFeeling', 'feedbackImpression']) $(id).addEventListener('input', saveFeedbackDraft);
  $('catScore').addEventListener('input', () => {
    updateFeedbackCat();
    saveFeedbackDraft();
  });
  $('feedbackForm').addEventListener('submit', submitFeedback);
}
