// Animated dialog closing, and the scene switcher inside the celebration dialog
// (intro → video lead → video → ending card → feedback).
import { $ } from './dom.js';
import { motion, sceneHeight, cuteEntrance, clearCuteEffects } from './motion.js';

const scenes = ['celebrationIntro', 'videoLead', 'videoStage', 'endingStage', 'feedbackStage', 'feedbackThanks'];
const modalMotions = new Set(),
  closingDialogs = new WeakSet();
let modalEpoch = 0;

export function isClosing(dialog) {
  return closingDialogs.has(dialog);
}

export function cancelModalMotion() {
  clearCuteEffects($('celebration'));
  modalEpoch++;
  for (const animation of modalMotions) animation.cancel();
  modalMotions.clear();
  const host = $('celebrationSceneHost');
  host.style.height = '';
  host.classList.remove('is-changing');
  for (const id of scenes) $(id).inert = false;
}

export async function changeModalScene(id, title, onShown, focusId) {
  const celebration = $('celebration');
  if (!celebration.open || closingDialogs.has(celebration)) return false;
  cancelModalMotion();
  const epoch = modalEpoch,
    host = $('celebrationSceneHost'),
    outgoing = scenes.map((scene) => $(scene)).find((el) => !el.hidden),
    incoming = $(id);
  if (outgoing === incoming) {
    if (onShown) onShown();
    return true;
  }
  const oldHeight = host.getBoundingClientRect().height;
  host.style.height = oldHeight + 'px';
  host.classList.add('is-changing');
  if (outgoing) {
    outgoing.inert = true;
    await motion(
      outgoing,
      [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-6px)' },
      ],
      { duration: 140 },
      modalMotions,
    );
  }
  if (epoch !== modalEpoch || !celebration.open) return false;
  for (const stage of scenes) $(stage).hidden = stage !== id;
  incoming.inert = true;
  celebration.setAttribute('aria-labelledby', title);
  celebration.scrollTop = 0;
  if (onShown) onShown();
  if (id === 'endingStage') cuteEntrance(incoming, 'ending');
  else if (id === 'videoLead') cuteEntrance(incoming);
  const newHeight = sceneHeight(incoming);
  await Promise.all([
    motion(host, [{ height: oldHeight + 'px' }, { height: newHeight + 'px' }], { duration: 280 }, modalMotions),
    motion(
      incoming,
      [
        { opacity: 0, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 300 },
      modalMotions,
    ),
  ]);
  if (epoch !== modalEpoch || !celebration.open) return false;
  host.style.height = '';
  host.classList.remove('is-changing');
  for (const stage of scenes) $(stage).inert = false;
  if (focusId) $(focusId).focus({ preventScroll: true });
  return true;
}

// Fires "liber:closing" on the dialog first so its owner can stop its own media
// and timers before the closing animation.
export async function requestDialogClose(dialog) {
  if (!dialog.open || closingDialogs.has(dialog)) return;
  closingDialogs.add(dialog);
  dialog.classList.add('is-closing');
  dialog.dispatchEvent(new Event('liber:closing'));
  try {
    await motion(
      dialog,
      [
        { opacity: 1, transform: 'translateY(0) scale(1)' },
        { opacity: 0, transform: 'translateY(8px) scale(.99)' },
      ],
      { duration: 160 },
    );
    if (dialog.open) dialog.close();
  } finally {
    dialog.classList.remove('is-closing');
    closingDialogs.delete(dialog);
  }
}
