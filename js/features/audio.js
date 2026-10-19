// Background music: an original synthesized melody (no sampled recording), or a
// file the visitor picks, kept as a local blob URL. Starts only after a user gesture.
import { $ } from '../core/dom.js';
import { on } from '../core/bus.js';

let audio,
  audioCtx = null,
  master = null,
  timer = null,
  nextNote = 0,
  noteIndex = 0,
  playing = false,
  source = 'synth',
  fileURL = null,
  operation = 0,
  resumeMusic = false;
const melody = [
  72, 76, 79, 83, 79, 76, 74, 79, 81, 84, 81, 79, 71, 74, 78, 81, 78, 74, 69, 72, 76, 79, 76, 72, 67, 71, 74, 79, 74,
  71, 69, 74,
];
const chords = [
  [48, 55, 60, 64],
  [53, 60, 65, 69],
  [55, 62, 67, 71],
  [48, 55, 60, 64],
];

function tone(note, at, duration, level) {
  const osc = audioCtx.createOscillator(),
    gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 440 * 2 ** ((note - 69) / 12);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(level, at + 0.035);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(at);
  osc.stop(at + duration + 0.05);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

function schedule() {
  if (!playing || source !== 'synth') return;
  while (nextNote < audioCtx.currentTime + 0.25) {
    if (nextNote < audioCtx.currentTime - 0.5) nextNote = audioCtx.currentTime + 0.05;
    tone(melody[noteIndex % melody.length], nextNote, 2.3, 0.18);
    if (noteIndex % 8 === 0) for (const n of chords[Math.floor(noteIndex / 8) % 4]) tone(n, nextNote, 5.1, 0.055);
    noteIndex++;
    nextNote += 0.52;
  }
}

function updateAudio(message) {
  $('play').textContent = playing ? 'Ⅱ' : '▷';
  $('play').setAttribute('aria-pressed', String(playing));
  $('play').setAttribute('aria-label', playing ? 'Tắt nhạc nền' : 'Bật nhạc nền');
  $('audioStatus').textContent = message;
}

function stop() {
  operation++;
  playing = false;
  clearInterval(timer);
  timer = null;
  audio.pause();
  if (audioCtx && audioCtx.state === 'running') audioCtx.suspend().catch(() => {});
}

async function play() {
  const token = ++operation;
  $('play').disabled = true;
  try {
    if (source === 'file') {
      await audio.play();
    } else {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) throw Error('unsupported');
        audioCtx = new AC();
        master = audioCtx.createGain();
        master.gain.value = (Number($('volume').value) / 100) * 0.65;
        master.connect(audioCtx.destination);
        nextNote = audioCtx.currentTime + 0.08;
      }
      await audioCtx.resume();
    }
    if (token !== operation) {
      if (source === 'file') audio.pause();
      return;
    }
    playing = true;
    if (source === 'synth') {
      nextNote = Math.max(nextNote, audioCtx.currentTime + 0.06);
      schedule();
      timer = setInterval(schedule, 120);
    }
    updateAudio('Đang phát');
  } catch (e) {
    if (token === operation) {
      stop();
      updateAudio(
        source === 'file' ? 'Không phát được file này. Hãy thử file MP3 hoặc WAV khác.' : 'Nhấn nút phát để bật nhạc.',
      );
    }
  } finally {
    $('play').disabled = false;
  }
}

function chooseMusicFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!(file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name))) {
    $('audioStatus').textContent = 'Hãy chọn file âm thanh, ví dụ MP3 hoặc WAV.';
    e.target.value = '';
    return;
  }
  stop();
  audio.removeAttribute('src');
  audio.load();
  if (fileURL) URL.revokeObjectURL(fileURL);
  fileURL = URL.createObjectURL(file);
  audio.src = fileURL;
  source = 'file';
  $('trackName').textContent = file.name;
  $('resetMusic').hidden = false;
  updateAudio('Đã chọn nhạc · Nhấn phát để nghe.');
}

function resetMusic() {
  stop();
  source = 'synth';
  audio.removeAttribute('src');
  audio.load();
  if (fileURL) URL.revokeObjectURL(fileURL);
  fileURL = null;
  $('musicFile').value = '';
  $('trackName').textContent = 'Giai điệu dành cho Liber';
  $('resetMusic').hidden = true;
  updateAudio('Đã chọn giai điệu mặc định · Nhấn phát để nghe.');
}

export function init() {
  audio = new Audio();
  audio.loop = true;
  audio.preload = 'metadata';
  audio.volume = 0.4;
  $('play').onclick = () => {
    if (playing) {
      stop();
      updateAudio('Đã tắt nhạc');
    } else play();
  };
  $('volume').oninput = () => {
    const v = Number($('volume').value) / 100;
    audio.volume = v;
    if (master) master.gain.setTargetAtTime(v * 0.65, audioCtx.currentTime, 0.05);
  };
  $('musicFile').onchange = chooseMusicFile;
  $('resetMusic').onclick = resetMusic;
  audio.addEventListener('error', () => {
    if (source === 'file' && audio.getAttribute('src')) {
      stop();
      updateAudio('Không đọc được nhạc. Hãy chọn file MP3 hoặc WAV khác.');
    }
  });
  window.addEventListener('pagehide', stop);
  on('audio:autoplay', () => {
    if (!playing) play();
  });
  on('session:reset', () => {
    stop();
    updateAudio('Đã tắt nhạc');
  });
  // Music pauses while the greeting video dialog is open and resumes afterwards.
  on('celebration:opening', () => {
    resumeMusic = playing;
    stop();
    updateAudio('Nhạc tạm dừng để xem video');
  });
  on('celebration:closed', () => {
    if (resumeMusic) {
      resumeMusic = false;
      play();
    } else updateAudio('Đã tắt nhạc');
  });
}
