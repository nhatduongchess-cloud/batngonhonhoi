// Moves between the three pages (welcome card, guide, main page) with a short
// cross-fade, resizing the shared host so the layout does not jump.
import { $ } from './dom.js';
import { emit } from './bus.js';
import { state } from './state.js';
import { motion, sceneHeight, cuteEntrance } from './motion.js';

const pages = ['welcome', 'guide', 'mainPage'];
let routeBusy = false;

export function isRouteBusy() {
  return routeBusy;
}

export async function route(id, focusId) {
  if (routeBusy || id === state.activePage) return false;
  routeBusy = true;
  const host = $('sceneHost'),
    outgoing = $(state.activePage),
    incoming = $(id);
  const oldHeight = host.getBoundingClientRect().height;
  outgoing.inert = true;
  emit('route:leave');
  host.style.height = oldHeight + 'px';
  host.classList.add('is-changing');
  try {
    await motion(
      outgoing,
      [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-8px)' },
      ],
      { duration: 150 },
    );
    state.activePage = id;
    for (const section of pages) $(section).hidden = section !== id;
    incoming.inert = true;
    window.scrollTo({ top: 0, behavior: 'instant' });
    emit('route:show', { id });
    if (id !== 'welcome') cuteEntrance(incoming);
    const newHeight = sceneHeight(incoming);
    await Promise.all([
      motion(host, [{ height: oldHeight + 'px' }, { height: newHeight + 'px' }], { duration: 300 }),
      motion(
        incoming,
        [
          { opacity: 0, transform: 'translateY(14px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 320 },
      ),
    ]);
    return true;
  } finally {
    host.style.height = '';
    host.classList.remove('is-changing');
    for (const section of pages) $(section).inert = false;
    routeBusy = false;
    emit('route:settled', { id: state.activePage });
    $(
      focusId ||
        (state.activePage === 'mainPage' ? 'title' : state.activePage === 'guide' ? 'guideTitle' : 'welcomeTitle'),
    ).focus({ preventScroll: true });
  }
}
