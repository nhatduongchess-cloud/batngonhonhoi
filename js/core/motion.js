// Shared animation helpers: short scene transitions, the sparkle burst on page
// entry and the slow fireworks around the ending card.
import { $, reducedMotion } from './dom.js';

export async function motion(element, frames, options = {}, bag) {
  if (reducedMotion.matches || document.hidden || !element.animate) return true;
  let animation;
  try {
    animation = element.animate(frames, { duration: 280, easing: 'cubic-bezier(.2,.7,.25,1)', ...options });
    if (bag) bag.add(animation);
    await animation.finished;
    return true;
  } catch (e) {
    return false;
  } finally {
    if (bag && animation) bag.delete(animation);
  }
}

export function sceneHeight(element) {
  const style = getComputedStyle(element);
  return (
    element.getBoundingClientRect().height + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0)
  );
}

const cuteEffects = new Map();
export function clearCuteEffects(container) {
  const effect = cuteEffects.get(container);
  if (!effect) return;
  effect.animations.forEach((a) => a.cancel());
  effect.layer.remove();
  cuteEffects.delete(container);
}

function slowEndingCelebration(scene) {
  if (reducedMotion.matches || document.hidden) return;
  const container = scene.closest('dialog');
  if (!container || !container.open) return;
  clearCuteEffects(container);
  const layer = document.createElement('div');
  layer.className = 'cute-transition in-dialog ending-fireworks';
  layer.setAttribute('aria-hidden', 'true');
  layer.style.top = container.scrollTop + 'px';
  const w = container.clientWidth,
    h = Math.min(innerHeight * 0.88, scene.scrollHeight + 60),
    small = w < 500;
  layer.style.height = h + 'px';
  container.append(layer);
  const effect = { layer, animations: [] };
  cuteEffects.set(container, effect);
  const run = (el, frames, opts) => {
    if (!el.animate) return;
    effect.animations.push(el.animate(frames, { fill: 'both', ...opts }));
  };
  const colors = ['#efb2d0', '#d3b9ed', '#f3d49d'];
  const bursts = [
    [0.11, 0.16, 0],
    [0.9, 0.3, 850],
    [0.73, 0.075, 1750],
  ];
  bursts.forEach(([fx, fy, delay], index) => {
    const x = w * fx,
      y = Math.max(28, Math.min(h * 0.52, h * fy)),
      color = colors[index],
      radius = small ? 43 : 69;
    const comet = document.createElement('i');
    comet.className = 'ending-firework-comet';
    comet.style.left = x + 'px';
    comet.style.top = y + 'px';
    comet.style.color = color;
    layer.append(comet);
    run(
      comet,
      [
        { opacity: 0, transform: 'translate(-50%,95px) scale(.6)' },
        { opacity: 0.6, offset: 0.35 },
        { opacity: 0.6, offset: 0.8 },
        { opacity: 0, transform: 'translate(-50%,0) scale(.8)' },
      ],
      { delay, duration: 1050, easing: 'cubic-bezier(.25,.6,.3,1)' },
    );
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI * 2) / 16,
        dx = Math.cos(a) * radius,
        dy = Math.sin(a) * radius;
      const ray = document.createElement('i');
      ray.className = 'ending-firework-ray';
      ray.style.left = x + 'px';
      ray.style.top = y + 'px';
      ray.style.color = color;
      layer.append(ray);
      const angle = (a * 180) / Math.PI + 90;
      run(
        ray,
        [
          { opacity: 0, transform: `translate(-50%,-50%) rotate(${angle}deg) scale(.2)` },
          { opacity: 0.78, offset: 0.19 },
          {
            opacity: 0.55,
            offset: 0.55,
            transform: `translate(calc(-50% + ${dx * 0.78}px),calc(-50% + ${dy * 0.78}px)) rotate(${angle}deg) scale(1)`,
          },
          {
            opacity: 0,
            transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy + 22}px)) rotate(${angle}deg) scale(.3)`,
          },
        ],
        { delay: delay + 850, duration: 2650, easing: 'cubic-bezier(.16,.5,.3,1)' },
      );
    }
  });
  const blooms = small
    ? [
        [0.07, 0.48, 500],
        [0.94, 0.61, 1350],
        [0.14, 0.08, 2200],
        [0.86, 0.11, 950],
      ]
    : [
        [0.06, 0.5, 500],
        [0.95, 0.62, 1350],
        [0.24, 0.065, 2200],
        [0.83, 0.1, 950],
        [0.08, 0.75, 1600],
        [0.93, 0.43, 2450],
      ];
  blooms.forEach(([fx, fy, delay], index) => {
    const flower = document.createElement('span');
    flower.className = 'ending-bloom';
    const size = small ? 31 + (index % 2) * 7 : 43 + (index % 2) * 10;
    flower.style.width = size + 'px';
    flower.style.height = size + 'px';
    flower.style.left = w * fx - size / 2 + 'px';
    flower.style.top = h * fy - size / 2 + 'px';
    const ns = 'http://www.w3.org/2000/svg',
      svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 60 60');
    for (let petal = 0; petal < 5; petal++) {
      const ellipse = document.createElementNS(ns, 'ellipse');
      ellipse.setAttribute('cx', '30');
      ellipse.setAttribute('cy', '16');
      ellipse.setAttribute('rx', '9');
      ellipse.setAttribute('ry', '15');
      ellipse.setAttribute('fill', colors[index % colors.length]);
      ellipse.setAttribute('transform', `rotate(${petal * 72} 30 30)`);
      svg.append(ellipse);
    }
    const center = document.createElementNS(ns, 'circle');
    center.setAttribute('cx', '30');
    center.setAttribute('cy', '30');
    center.setAttribute('r', '7');
    center.setAttribute('fill', '#f5d49a');
    svg.append(center);
    flower.append(svg);
    layer.append(flower);
    run(
      flower,
      [
        { opacity: 0, transform: 'scale(.1) rotate(-35deg)' },
        { opacity: 0.9, transform: 'scale(1) rotate(0deg)', offset: 0.43 },
        { opacity: 0.78, transform: 'scale(1.06) rotate(9deg)', offset: 0.72 },
        { opacity: 0, transform: 'translateY(-13px) scale(.92) rotate(18deg)' },
      ],
      { delay, duration: 3200, easing: 'ease-in-out' },
    );
  });
  // The card remains interactive while the slow decorative sequence plays.
  for (const [i, el] of [$('recipientPortrait'), $('endingDecor')].entries()) {
    if (!el.hidden)
      run(
        el,
        [
          { opacity: 0, translate: '0 15px', scale: '.96' },
          { opacity: 1, translate: '0 0', scale: '1' },
        ],
        { duration: 1450, delay: i * 220, easing: 'cubic-bezier(.2,.65,.25,1)' },
      );
  }
  Promise.allSettled(effect.animations.map((a) => a.finished)).then(() => {
    if (cuteEffects.get(container) === effect) {
      layer.remove();
      cuteEffects.delete(container);
    }
  });
}

export function cuteEntrance(scene, kind = 'page') {
  if (kind === 'ending') {
    slowEndingCelebration(scene);
    return;
  }
  if (reducedMotion.matches || document.hidden) return;
  const container = scene.closest('dialog') || document.body;
  clearCuteEffects(container);
  const layer = document.createElement('div');
  layer.className = 'cute-transition' + (container === document.body ? '' : ' in-dialog');
  layer.setAttribute('aria-hidden', 'true');
  const inDialog = container !== document.body,
    cw = inDialog ? container.clientWidth : innerWidth,
    ch = inDialog ? container.clientHeight : innerHeight;
  if (inDialog) {
    layer.style.top = container.scrollTop + 'px';
    layer.style.height = ch + 'px';
  }
  container.append(layer);
  const effect = { layer, animations: [] };
  cuteEffects.set(container, effect);
  const anchor = kind === 'unlock' ? $('welcomeTitle') : scene.querySelector('h1,h2') || scene;
  const rect = anchor.getBoundingClientRect(),
    base = inDialog ? container.getBoundingClientRect() : { left: 0, top: 0 };
  const x = Math.max(40, Math.min(cw - 40, rect.left + rect.width * 0.5 - base.left)),
    y = Math.max(55, Math.min(ch * 0.55, rect.top + rect.height * 0.5 - base.top));
  const run = (el, frames, options) => {
    if (!el.animate) return;
    const a = el.animate(frames, options);
    effect.animations.push(a);
  };
  const halo = document.createElement('i');
  halo.className = 'cute-halo';
  halo.style.left = x + 'px';
  halo.style.top = y + 'px';
  layer.append(halo);
  run(
    halo,
    [
      { opacity: 0, transform: 'scale(.35)' },
      { opacity: 0.75, transform: 'scale(1)', offset: 0.22 },
      { opacity: 0, transform: 'scale(2.3)' },
    ],
    { duration: 700, easing: 'ease-out' },
  );
  const count = innerWidth < 600 ? 9 : 13,
    reach = innerWidth < 600 ? 100 : 155;
  for (let i = 0; i < count; i++) {
    const bit = document.createElement('span'),
      petal = i % 3 === 0;
    bit.className = 'cute-bit' + (petal ? ' petal' : '');
    bit.textContent = petal ? '' : i % 2 ? '♥' : '✦';
    bit.style.left = x + 'px';
    bit.style.top = y + 'px';
    bit.style.color = i % 2 ? '#f0b2cd' : '#cfb8e4';
    layer.append(bit);
    const angle = (i / count) * Math.PI * 2,
      dx = Math.cos(angle) * reach * (0.7 + (i % 3) * 0.15),
      dy = Math.sin(angle) * reach * 0.65 - 28;
    run(
      bit,
      [
        { opacity: 0, transform: 'translate(-50%,-50%) scale(.25) rotate(0deg)' },
        { opacity: 0.88, offset: 0.18 },
        {
          opacity: 0,
          transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.85) rotate(${i % 2 ? 75 : -65}deg)`,
        },
      ],
      { duration: 680 + (i % 3) * 75, delay: i * 18, easing: 'cubic-bezier(.16,.68,.3,1)' },
    );
  }
  const targets =
    kind === 'unlock'
      ? []
      : scene.id === 'guide'
        ? [...scene.querySelectorAll('.step')]
        : scene.id === 'mainPage'
          ? [...scene.querySelectorAll('.intro,.audio-panel')]
          : [];
  targets.forEach((el, i) => {
    if (el.hidden) return;
    run(
      el,
      [
        { opacity: 0, translate: '0 12px', scale: '.93' },
        { opacity: 1, translate: '0 -2px', scale: '1.015', offset: 0.73 },
        { opacity: 1, translate: '0 0', scale: '1' },
      ],
      { duration: 480, delay: i * 60, easing: 'cubic-bezier(.2,.7,.25,1)' },
    );
  });
  Promise.allSettled(effect.animations.map((a) => a.finished)).then(() => {
    if (cuteEffects.get(container) === effect) {
      layer.remove();
      cuteEffects.delete(container);
    }
  });
}

export function initMotion() {
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) for (const container of [...cuteEffects.keys()]) clearCuteEffects(container);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) for (const container of [...cuteEffects.keys()]) clearCuteEffects(container);
  });
}
