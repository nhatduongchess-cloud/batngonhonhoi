// The celebration dialog that opens when the heart is complete: confetti intro,
// a short lead-in, then the greeting video. The ending card lives in ending.js.
import { $, reducedMotion } from '../../core/dom.js';
import { emit, on } from '../../core/bus.js';
import { cancelModalMotion, changeModalScene, isClosing, requestDialogClose } from '../../core/dialogs.js';
import { GREETING_VIDEO } from '../../config.js';

let celebration, greetingVideo;
let greetingURL = '',
  videoTimer = null,
  videoAttempt = 0;

function clearCelebrationTimer() {
  clearTimeout(videoTimer);
  videoTimer = null;
}

function makeConfetti() {
  const container = $('confetti');
  container.replaceChildren();
  if (reducedMotion.matches) return;
  for (let i = 0; i < 52; i++) {
    const piece = document.createElement('i');
    piece.style.setProperty('--left', Math.random() * 100 + '%');
    piece.style.setProperty('--delay', Math.random() * 0.65 + 's');
    piece.style.setProperty('--drift', (Math.random() - 0.5) * 140 + 'px');
    piece.style.setProperty('--spin', (Math.random() - 0.5) * 900 + 'deg');
    piece.style.background = ['#f7a6c4', '#e7c6a1', '#fff2ec', '#bc81cb'][i % 4];
    container.append(piece);
  }
}

function configureVideo() {
  const hasVideo = !!greetingVideo.getAttribute('src');
  greetingVideo.hidden = !hasVideo;
  $('videoEmpty').hidden = hasVideo;
  $('replaceGreeting').hidden = !hasVideo || !!GREETING_VIDEO;
  $('videoSetup').textContent = hasVideo ? 'Xem video' : 'Thêm video';
}

async function playGreeting() {
  if (!celebration.open || !greetingVideo.getAttribute('src')) return;
  const attempt = ++videoAttempt;
  $('videoStatus').textContent = '';
  $('startGreeting').hidden = true;
  try {
    await greetingVideo.play();
    if (attempt !== videoAttempt || !celebration.open) greetingVideo.pause();
  } catch (e) {
    if (attempt !== videoAttempt || !celebration.open) return;
    $('startGreeting').hidden = false;
    $('videoStatus').textContent =
      e.name === 'NotAllowedError'
        ? 'Nhấn “Phát video” để xem lời chúc.'
        : 'Không phát được video. Hãy thử file MP4 khác.';
  }
}

function showVideo() {
  clearCelebrationTimer();
  return changeModalScene('videoStage', 'videoTitle', () => {
    $('confetti').replaceChildren();
    configureVideo();
    if (greetingVideo.getAttribute('src')) {
      if (greetingVideo.ended) greetingVideo.currentTime = 0;
      playGreeting();
    }
  });
}

function openVideoDialog() {
  if (celebration.open) return;
  cancelModalMotion();
  emit('celebration:opening');
  $('videoStatus').textContent = '';
  $('startGreeting').hidden = true;
  celebration.showModal();
}

function showCelebration() {
  if (celebration.open) return;
  cancelModalMotion();
  clearCelebrationTimer();
  $('celebrationIntro').hidden = false;
  $('feedbackStage').hidden = true;
  $('feedbackThanks').hidden = true;
  $('videoLead').hidden = true;
  $('endingStage').hidden = true;
  $('videoStage').hidden = true;
  celebration.setAttribute('aria-labelledby', 'celebrationTitle');
  openVideoDialog();
  makeConfetti();
  if (greetingVideo.getAttribute('src')) greetingVideo.currentTime = 0;
  videoTimer = setTimeout(showVideoLead, 2400);
}

async function showVideoLead() {
  clearCelebrationTimer();
  const shown = await changeModalScene('videoLead', 'videoLeadTitle', () => {
    $('confetti').replaceChildren();
  });
  if (shown && celebration.open && !$('videoLead').hidden && !isClosing(celebration))
    videoTimer = setTimeout(showVideo, 6000);
}

function chooseGreetingFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!(file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name))) {
    if (!celebration.open) {
      openVideoDialog();
      showVideo();
    }
    $('videoStatus').textContent = 'Hãy chọn một file video MP4, WebM hoặc MOV.';
    e.target.value = '';
    return;
  }
  videoAttempt++;
  greetingVideo.pause();
  greetingVideo.removeAttribute('src');
  greetingVideo.load();
  if (greetingURL) URL.revokeObjectURL(greetingURL);
  greetingURL = URL.createObjectURL(file);
  greetingVideo.src = greetingURL;
  greetingVideo.load();
  configureVideo();
  $('videoStatus').textContent = '';
  if (celebration.open && !$('videoStage').hidden) playGreeting();
  e.target.value = '';
}

export function init() {
  celebration = $('celebration');
  greetingVideo = $('greetingVideo');
  on('heart:complete', showCelebration);
  on('ending:show', clearCelebrationTimer);
  $('closeCelebration').onclick = () => requestDialogClose(celebration);
  celebration.addEventListener('cancel', (e) => {
    e.preventDefault();
    requestDialogClose(celebration);
  });
  celebration.addEventListener('liber:closing', () => {
    clearCelebrationTimer();
    videoAttempt++;
    greetingVideo.pause();
    cancelModalMotion();
  });
  celebration.addEventListener('close', () => {
    cancelModalMotion();
    clearCelebrationTimer();
    videoAttempt++;
    greetingVideo.pause();
    $('confetti').replaceChildren();
    emit('celebration:closed');
  });
  $('videoSetup').onclick = () => {
    if (greetingVideo.getAttribute('src')) {
      openVideoDialog();
      showVideo();
    } else $('greetingFile').click();
  };
  $('chooseGreeting').onclick = () => $('greetingFile').click();
  $('replaceGreeting').onclick = () => $('greetingFile').click();
  $('startGreeting').onclick = () => {
    if (greetingVideo.ended) greetingVideo.currentTime = 0;
    playGreeting();
  };
  $('greetingFile').onchange = chooseGreetingFile;
  greetingVideo.addEventListener('play', () => {
    if (!celebration.open) {
      greetingVideo.pause();
      return;
    }
    $('startGreeting').hidden = true;
    $('videoStatus').textContent = '';
  });
  greetingVideo.addEventListener('ended', () => emit('ending:show'));
  greetingVideo.addEventListener('error', () => {
    if (!greetingVideo.getAttribute('src')) return;
    if (!celebration.open) {
      openVideoDialog();
      showVideo();
    }
    $('videoStatus').textContent = 'Không đọc được video. Hãy chọn file MP4 khác.';
    $('startGreeting').hidden = true;
  });
  $('skipVideoLead').onclick = () => {
    clearCelebrationTimer();
    showVideo();
  };
  $('replayGreeting').onclick = () => {
    greetingVideo.currentTime = 0;
    showVideo();
  };
  if (GREETING_VIDEO) {
    greetingVideo.src = GREETING_VIDEO;
    configureVideo();
  }
  window.addEventListener('pagehide', () => {
    clearCelebrationTimer();
    greetingVideo.pause();
  });
}
