// The slider-driven heart on the main page, with flowers that bloom as it fills.
// Reference curve: y = cbrt(x*x) + sqrt(3-x*x) * sin(m*pi*x).
// Its 3D extension uses z = .38 * sqrt(3-x*x) * cos(m*pi*x).
import { $, reducedMotion } from '../core/dom.js';
import { emit, on } from '../core/bus.js';
import { state } from '../core/state.js';
import { blossom, leaf } from '../drawing/doodles.js';

let canvas, ctx;
let paused = reducedMotion.matches,
  w = 0,
  h = 0,
  time = 0,
  last = 0,
  raf = 0,
  angle = 0,
  drag = null,
  progress = 0;
let curve = [],
  tier = -1,
  completionShown = false;
const stars = Array.from({ length: 36 }, () => ({
  x: Math.random(),
  y: Math.random(),
  r: 0.4 + Math.random(),
  p: Math.random() * 6.28,
}));

function buildCurve() {
  // Match the reference equation, adding an elliptical depth to its oscillations.
  // Higher slider values increase m; this changes geometry rather than opacity.
  const m = 0.2 + 99.8 * (progress / 100) ** 2,
    segments = Math.ceil(1000 + m * 65),
    depth = 0.38;
  curve = [];
  for (let i = 0; i <= segments; i++) {
    const x = -Math.sqrt(3) + (2 * Math.sqrt(3) * i) / segments,
      envelope = Math.sqrt(Math.max(0, 3 - x * x)),
      phase = m * Math.PI * x;
    curve.push({
      x: x / 1.8,
      y: -(Math.cbrt(x * x) + envelope * Math.sin(phase) - 0.6) / 1.8,
      z: (depth * envelope * Math.cos(phase)) / 1.8,
      p: i * 0.41,
    });
  }
}

function project(p) {
  const rot = angle + 0.12 + Math.sin(time * 0.3) * 0.09,
    ca = Math.cos(rot),
    sa = Math.sin(rot),
    rx = p.x * ca + p.z * sa,
    rz = p.z * ca - p.x * sa,
    tilt = 0.07,
    y = p.y * Math.cos(tilt) - rz * Math.sin(tilt),
    z = p.y * Math.sin(tilt) + rz * Math.cos(tilt),
    perspective = 4.5 / (4.5 + z),
    scale = Math.min(w * 0.4, h * 0.32);
  return { x: w / 2 + rx * scale * perspective, y: h * 0.47 + y * scale * perspective, z };
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  w = rect.width;
  h = rect.height;
  if (!w || !h) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function draw() {
  if (!ctx || !w || !h) return;
  ctx.clearRect(0, 0, w, h);
  for (const s of stars) {
    ctx.fillStyle = `rgba(237,203,223,${0.12 + (0.16 * (1 + Math.sin(time * 0.5 + s.p))) / 2})`;
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  const projected = curve.map(project);
  ctx.beginPath();
  for (let i = 0; i < projected.length; i++) {
    const p = projected[i];
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.strokeStyle = progress > 65 ? '#ef83b477' : '#f79fc9ce';
  ctx.lineWidth = progress > 65 ? 0.7 : 1.35;
  ctx.shadowColor = '#ff87c6';
  ctx.shadowBlur = progress > 60 ? 2 : 7;
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Shimmering points follow the actual curve, including on partial drawings.
  const step = Math.max(2, Math.floor(curve.length / 380));
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < projected.length; i += step) {
    const p = projected[i],
      glow = 0.3 + (0.6 * (1 + Math.sin(time * 1.3 + curve[i].p))) / 2;
    ctx.fillStyle = `rgba(255,192,216,${glow})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, progress > 60 ? 1.05 : 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  drawGrowingFlowers();
}

function drawGrowingFlowers() {
  const locations = [
    [0.22, 0.16],
    [0.82, 0.25],
    [0.12, 0.43],
    [0.87, 0.55],
    [0.19, 0.74],
    [0.77, 0.8],
    [0.43, 0.1],
    [0.58, 0.88],
  ];
  const colors = ['#efabc5', '#bda2d4', '#f1d3ac'];
  let visible = 0;
  for (let i = 0; i < locations.length; i++) {
    const growth = Math.max(0, Math.min(1, (progress - 8 - i * 10) / 15));
    if (growth <= 0) continue;
    visible++;
    const [fx, fy] = locations[i],
      x = w * fx,
      y = h * fy,
      size = Math.min(w, h) * 0.037 * growth;
    ctx.globalAlpha = growth;
    leaf(ctx, x + size * 0.55, y + size * 1.2, -0.5, size * 0.55);
    blossom(ctx, x, y, size, colors[i % 3], (paused ? 0 : Math.sin(time * 0.6 + i) * 0.12) + i * 0.4);
  }
  ctx.globalAlpha = 1;
  canvas.dataset.flowers = String(visible);
}

// Animate only while the main page is showing and no dialog covers it.
function frame(now) {
  raf = 0;
  if (paused || document.hidden || state.activePage !== 'mainPage' || $('celebration').open) return;
  if (last) time += Math.min((now - last) / 1000, 0.05);
  last = now;
  draw();
  raf = requestAnimationFrame(frame);
}
function start() {
  last = 0;
  if (!paused && !document.hidden && state.activePage === 'mainPage' && !$('celebration').open && !raf)
    raf = requestAnimationFrame(frame);
}
function stopFrames() {
  cancelAnimationFrame(raf);
  raf = 0;
}

function setProgress(value) {
  progress = Math.max(0, Math.min(100, Number(value) || 0));
  $('drawProgress').value = String(progress);
  $('drawProgress').style.setProperty('--fill', progress + '%');
  $('progressValue').textContent = Math.round(progress) + '%';
  $('drawProgress').setAttribute(
    'aria-valuetext',
    Math.round(progress) + ' phần trăm, ' + (progress === 100 ? 'trái tim hoàn thành' : 'đang vẽ trái tim'),
  );
  const next = progress === 100 ? 4 : progress >= 65 ? 3 : progress >= 30 ? 2 : progress > 0 ? 1 : 0;
  if (next !== tier) {
    tier = next;
    $('drawStatus').textContent = [
      'Kéo sang phải để bắt đầu nhé.',
      'Thêm một chút yêu thương…',
      'Trái tim đang hiện ra rồi!',
      'Sắp xong rồi nhé ♡',
      'Dành tặng bạn, trọn vẹn yêu thương ♡',
    ][tier];
    $('drawStatus').classList.toggle('completion', tier === 4);
  }
  canvas.setAttribute(
    'aria-label',
    'Trái tim đã vẽ ' + Math.round(progress) + ' phần trăm, hoa nở dần xung quanh. Kéo trên hình để xoay.',
  );
  buildCurve();
  draw();
  if (progress < 95) completionShown = false;
  if (progress === 100 && !completionShown) {
    completionShown = true;
    emit('heart:complete');
  }
}

export function init() {
  canvas = $('heart');
  ctx = canvas.getContext('2d');
  reducedMotion.addEventListener('change', (e) => {
    paused = e.matches;
    if (paused) {
      stopFrames();
      draw();
    } else start();
  });
  $('drawProgress').addEventListener('input', (e) => setProgress(e.target.value));
  canvas.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, angle };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (drag) {
      angle = drag.angle + (e.clientX - drag.x) * 0.008;
      draw();
    }
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture'])
    canvas.addEventListener(event, () => (drag = null));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopFrames();
    else start();
  });
  new ResizeObserver(resize).observe(canvas);
  buildCurve();
  on('route:leave', stopFrames);
  on('route:show', ({ id }) => {
    if (id === 'mainPage') resize();
  });
  on('route:settled', ({ id }) => {
    if (id === 'mainPage') {
      resize();
      start();
    }
  });
  on('session:start', () => {
    completionShown = false;
    angle = 0;
    setProgress(0);
  });
  on('session:reset', () => {
    completionShown = false;
  });
  on('celebration:opening', stopFrames);
  on('celebration:closed', start);
}
