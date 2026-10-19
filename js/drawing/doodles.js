// Original canvas doodles shared by the heart page, the ending card and the
// downloadable keepsake. Each takes a 2D context and draws; none reads page state.

export function blossom(g, x, y, size, color, rotation = 0) {
  g.save();
  g.translate(x, y);
  g.rotate(rotation);
  g.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    g.save();
    g.rotate((i * Math.PI * 2) / 5);
    g.beginPath();
    g.ellipse(0, -size * 0.5, size * 0.37, size * 0.56, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  g.fillStyle = '#ebc58e';
  g.beginPath();
  g.arc(0, 0, size * 0.25, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

export function leaf(g, x, y, rotation, size) {
  g.save();
  g.translate(x, y);
  g.rotate(rotation);
  g.fillStyle = '#8fae9c';
  g.beginPath();
  g.ellipse(0, 0, size, size * 0.4, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

export function drawBouquet(g, cx, cy, scale) {
  g.save();
  g.translate(cx, cy);
  g.scale(scale, scale);
  const heads = [
    [-76, -64, 24, '#efabc5'],
    [-39, -106, 29, '#f3c5d4'],
    [5, -119, 27, '#bda2d4'],
    [53, -96, 28, '#efabc5'],
    [88, -49, 23, '#f1d3ac'],
    [-17, -48, 31, '#e997b8'],
    [34, -43, 25, '#f3d2ac'],
  ];
  g.lineWidth = 3;
  g.strokeStyle = '#91ad9b';
  for (const [x, y] of heads) {
    g.beginPath();
    g.moveTo(0, 112);
    g.quadraticCurveTo(x * 0.4, 20, x, y);
    g.stroke();
  }
  for (const [x, y, r] of [
    [-70, -18, -0.8],
    [65, -14, 0.7],
    [-42, -69, -0.4],
    [25, -86, 0.6],
  ])
    leaf(g, x, y, r, 20);
  g.fillStyle = '#f6dedc';
  g.beginPath();
  g.moveTo(-94, -11);
  g.lineTo(29, 134);
  g.lineTo(52, 139);
  g.lineTo(101, -13);
  g.lineTo(0, 28);
  g.closePath();
  g.fill();
  g.fillStyle = '#cf94b0';
  g.beginPath();
  g.moveTo(-94, -11);
  g.lineTo(0, 28);
  g.lineTo(101, -13);
  g.lineTo(32, 135);
  g.lineTo(-28, 135);
  g.closePath();
  g.fill();
  g.fillStyle = '#eeb7ca';
  g.beginPath();
  g.moveTo(0, 28);
  g.lineTo(101, -13);
  g.lineTo(32, 135);
  g.closePath();
  g.fill();
  for (const [x, y, size, color] of heads) blossom(g, x, y, size, color, x * 0.01);
  g.strokeStyle = '#8f5273';
  g.lineWidth = 6;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-27, 93);
  g.lineTo(35, 93);
  g.stroke();
  g.fillStyle = '#9f5b7f';
  for (const direction of [-1, 1]) {
    g.beginPath();
    g.moveTo(3, 94);
    g.bezierCurveTo(direction * 65, 52, direction * 59, 124, 3, 94);
    g.fill();
    g.beginPath();
    g.moveTo(3, 96);
    g.lineTo(direction * 24, 129);
    g.lineTo(direction * 17, 101);
    g.fill();
  }
  g.fillStyle = '#f6d4dd';
  g.beginPath();
  g.arc(3, 93, 6, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

export function tinyHeart(g, x, y, size, color) {
  g.save();
  g.translate(x, y);
  g.scale(size, size);
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(0, 7);
  g.bezierCurveTo(-24, -8, -12, -21, 0, -10);
  g.bezierCurveTo(12, -21, 24, -8, 0, 7);
  g.fill();
  g.restore();
}

export function drawKitten(g, x, y, scale, lavender = false) {
  g.save();
  g.translate(x, y);
  g.scale(scale, scale);
  g.lineWidth = 2.2;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.strokeStyle = '#80546c';
  const fur = lavender ? '#dfd0ed' : '#fff1df',
    ear = lavender ? '#c2a6d5' : '#edb0ba';
  g.strokeStyle = fur;
  g.lineWidth = 12;
  g.beginPath();
  g.moveTo(23, 32);
  g.bezierCurveTo(58, 43, 59, 9, 44, 12);
  g.stroke();
  g.strokeStyle = '#80546c';
  g.lineWidth = 2.2;
  g.fillStyle = fur;
  g.beginPath();
  g.ellipse(0, 25, 29, 31, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  g.beginPath();
  g.moveTo(-33, -7);
  g.lineTo(-32, -44);
  g.quadraticCurveTo(-30, -49, -25, -44);
  g.lineTo(-10, -29);
  g.quadraticCurveTo(0, -32, 12, -29);
  g.lineTo(29, -45);
  g.quadraticCurveTo(34, -48, 34, -40);
  g.lineTo(34, -7);
  g.bezierCurveTo(40, 25, -39, 27, -33, -7);
  g.closePath();
  g.fill();
  g.stroke();
  g.fillStyle = ear;
  for (const sign of [-1, 1]) {
    g.beginPath();
    g.moveTo(sign * 26, -36);
    g.lineTo(sign * 17, -25);
    g.lineTo(sign * 28, -22);
    g.closePath();
    g.fill();
  }
  g.strokeStyle = '#80546c';
  for (const x of [-13, 13]) {
    g.beginPath();
    g.moveTo(x - 5, -3);
    g.quadraticCurveTo(x, -10, x + 5, -3);
    g.stroke();
  }
  g.fillStyle = '#eba7b6';
  for (const x of [-24, 24]) {
    g.beginPath();
    g.ellipse(x, 4, 7, 4, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = '#a86e83';
  g.beginPath();
  g.moveTo(-3, 1);
  g.lineTo(3, 1);
  g.lineTo(0, 4);
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(-5, 7);
  g.quadraticCurveTo(-1, 11, 0, 5);
  g.quadraticCurveTo(1, 11, 5, 7);
  g.stroke();
  for (const sign of [-1, 1])
    for (const dy of [0, 7]) {
      g.beginPath();
      g.moveTo(sign * 27, dy);
      g.lineTo(sign * 40, dy - 3);
      g.stroke();
    }
  tinyHeart(g, 0, 35, 1.4, '#d983a6');
  g.fillStyle = fur;
  for (const sign of [-1, 1]) {
    g.beginPath();
    g.ellipse(sign * 23, 27, 8, 12, sign * 0.6, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.beginPath();
    g.ellipse(sign * 15, 52, 12, 7, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  }
  blossom(g, lavender ? -28 : 28, -28, 10, lavender ? '#efb8ce' : '#c3acd9', 0.25);
  g.restore();
}

export function floralSprig(g, x, y, scale, flip = 1) {
  g.save();
  g.translate(x, y);
  g.scale(scale * flip, scale);
  g.strokeStyle = '#9fb5a0';
  g.lineWidth = 2;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(0, 52);
  g.quadraticCurveTo(-12, 13, 4, -20);
  g.moveTo(-3, 36);
  g.quadraticCurveTo(16, 16, 29, 13);
  g.stroke();
  leaf(g, -11, 23, 0.5, 10);
  leaf(g, 9, 35, -0.6, 11);
  blossom(g, 4, -20, 16, '#efb4ce', 0.25);
  blossom(g, 29, 13, 12, '#cdb7e4', 0.4);
  blossom(g, -7, 3, 9, '#fff0d8', 0.3);
  g.restore();
}

export function drawLoopy(g, x, y, scale, tilt = 0) {
  g.save();
  g.translate(x, y);
  g.rotate(tilt);
  g.scale(scale, scale);
  g.lineJoin = 'round';
  g.lineCap = 'round';
  const oval = (x, y, rx, ry, color, outline = true) => {
    g.fillStyle = color;
    g.beginPath();
    g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    if (outline) {
      g.strokeStyle = '#fff4f7';
      g.lineWidth = 7;
      g.stroke();
    }
    g.fill();
  };
  oval(0, 32, 34, 40, '#efa3bf');
  oval(-25, 65, 17, 10, '#efa3bf');
  oval(24, 65, 17, 10, '#efa3bf');
  oval(-43, -33, 14, 16, '#eda2be');
  oval(43, -33, 14, 16, '#eda2be');
  oval(-43, -33, 7, 9, '#ce7f9f', false);
  oval(43, -33, 7, 9, '#ce7f9f', false);
  oval(0, -13, 49, 42, '#f3aec8');
  g.strokeStyle = '#bd7b9c';
  g.lineWidth = 2.5;
  g.beginPath();
  g.moveTo(-9, -53);
  g.quadraticCurveTo(-19, -67, -5, -64);
  g.quadraticCurveTo(7, -62, 2, -54);
  g.stroke();
  oval(-20, -20, 3.3, 4.5, '#5c344c', false);
  oval(20, -20, 3.3, 4.5, '#5c344c', false);
  oval(0, -6, 12, 8, '#965d83', false);
  oval(-33, -2, 10, 5, '#ea8faf', false);
  oval(33, -2, 10, 5, '#ea8faf', false);
  g.strokeStyle = '#87536f';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-13, 8);
  g.quadraticCurveTo(0, 20, 13, 8);
  g.stroke();
  g.fillStyle = '#fff9ef';
  g.fillRect(-6, 13, 12, 8);
  g.strokeStyle = '#c9a5b9';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(0, 14);
  g.lineTo(0, 20);
  g.stroke();
  tinyHeart(g, 7, 43, 1.55, '#c8618c');
  oval(-22, 34, 10, 15, '#f3aec8', false);
  oval(27, 35, 9, 14, '#f3aec8', false);
  g.restore();
}

function drawRose(g, x, y, size, color = '#d9789e') {
  g.save();
  g.translate(x, y);
  g.scale(size, size);
  g.fillStyle = color;
  g.strokeStyle = '#fff2f4';
  g.lineWidth = 0.12;
  g.beginPath();
  for (let i = 0; i < 7; i++) {
    const a = (i * Math.PI * 2) / 7;
    g.ellipse(Math.cos(a) * 0.4, Math.sin(a) * 0.4, 0.65, 0.48, a, 0, Math.PI * 2);
  }
  g.stroke();
  g.fill();
  g.strokeStyle = '#aa527b';
  g.lineWidth = 0.09;
  g.lineCap = 'round';
  g.beginPath();
  for (let t = 0; t < Math.PI * 4.1; t += 0.08) {
    const r = 0.04 + t * 0.047,
      x = Math.cos(t) * r,
      y = Math.sin(t) * r;
    if (t === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke();
  g.beginPath();
  g.arc(-0.09, 0.1, 0.76, 0.1, 2.4);
  g.stroke();
  g.restore();
}

export function roseBouquet(g, x, y, scale, tilt = 0.25) {
  g.save();
  g.translate(x, y);
  g.rotate(tilt);
  g.scale(scale, scale);
  g.fillStyle = '#eee0cf';
  g.strokeStyle = '#fff5ec';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(-39, 4);
  g.lineTo(7, 93);
  g.lineTo(44, 0);
  g.closePath();
  g.fill();
  g.stroke();
  g.strokeStyle = '#8ba68f';
  g.lineWidth = 2.5;
  for (const dx of [-22, 0, 25]) {
    g.beginPath();
    g.moveTo(5, 75);
    g.quadraticCurveTo(dx, 30, dx, -15);
    g.stroke();
  }
  leaf(g, -28, 9, -0.65, 17);
  leaf(g, 26, 24, 0.45, 18);
  leaf(g, 2, -21, -0.7, 15);
  drawRose(g, -23, -10, 21, '#e59ab3');
  drawRose(g, 22, -6, 22, '#c9648f');
  drawRose(g, 0, -36, 23, '#eab4c7');
  g.fillStyle = '#b694c9';
  g.beginPath();
  g.moveTo(6, 65);
  g.bezierCurveTo(-35, 30, -39, 87, 6, 65);
  g.bezierCurveTo(41, 28, 46, 83, 6, 65);
  g.fill();
  g.strokeStyle = '#b694c9';
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(6, 65);
  g.quadraticCurveTo(3, 90, -8, 99);
  g.moveTo(6, 65);
  g.quadraticCurveTo(15, 82, 26, 81);
  g.stroke();
  g.restore();
}

export function stickerStar(g, x, y, r, tilt = 0) {
  g.save();
  g.translate(x, y);
  g.rotate(tilt);
  g.fillStyle = '#f3d18f';
  g.strokeStyle = '#fff3dd';
  g.lineWidth = r * 0.15;
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2,
      rr = i % 2 ? r * 0.48 : r;
    g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  g.closePath();
  g.stroke();
  g.fill();
  g.restore();
}

export function washiTape(g, x, y, w, angle, color) {
  g.save();
  g.translate(x, y);
  g.rotate(angle);
  g.fillStyle = color + 'bb';
  g.fillRect(-w / 2, -9, w, 18);
  g.fillStyle = '#fff5f15c';
  for (let i = -w / 2 + 6; i < w / 2; i += 11) {
    g.beginPath();
    g.arc(i, 0, 2, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

export function drawBunny(g, x, y, scale, tilt = -0.1) {
  g.save();
  g.translate(x, y);
  g.rotate(tilt);
  g.scale(scale, scale);
  g.lineWidth = 5;
  g.strokeStyle = '#fff8ef';
  g.lineJoin = 'round';
  const oval = (x, y, rx, ry, color, angle = 0) => {
    g.fillStyle = color;
    g.beginPath();
    g.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
    g.stroke();
    g.fill();
  };
  oval(-17, -43, 10, 31, '#fff0dc', -0.18);
  oval(16, -46, 10, 31, '#fff0dc', 0.15);
  g.lineWidth = 0;
  g.fillStyle = '#efbdcf';
  for (const x of [-17, 16]) {
    g.beginPath();
    g.ellipse(x, -47, 4, 19, x < 0 ? -0.18 : 0.15, 0, Math.PI * 2);
    g.fill();
  }
  g.lineWidth = 4;
  oval(0, 36, 27, 28, '#dfcce9');
  oval(0, -2, 35, 29, '#fff0dc');
  oval(-16, 60, 12, 7, '#fff0dc');
  oval(16, 60, 12, 7, '#fff0dc');
  g.fillStyle = '#80556e';
  for (const x of [-12, 12]) {
    g.beginPath();
    g.arc(x, -6, 2.6, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = '#ebadc5';
  for (const x of [-24, 24]) {
    g.beginPath();
    g.ellipse(x, 4, 7, 4, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.strokeStyle = '#a47489';
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(-5, 8);
  g.quadraticCurveTo(0, 14, 5, 8);
  g.stroke();
  stickerStar(g, 0, 32, 17, 0.1);
  g.strokeStyle = '#fff8ef';
  oval(-23, 30, 8, 11, '#fff0dc', -0.3);
  oval(23, 30, 8, 11, '#fff0dc', 0.3);
  blossom(g, 27, -20, 9, '#c6afd9', 0.4);
  g.restore();
}

export function happyStar(g, x, y, r, tilt = 0.15) {
  g.save();
  g.translate(x, y);
  g.rotate(tilt);
  stickerStar(g, 0, 0, r);
  g.fillStyle = '#8f6572';
  for (const dx of [-0.18, 0.18]) {
    g.beginPath();
    g.arc(r * dx, 0, r * 0.045, 0, Math.PI * 2);
    g.fill();
  }
  g.strokeStyle = '#a77580';
  g.lineWidth = Math.max(1, r * 0.035);
  g.beginPath();
  g.arc(0, r * 0.09, r * 0.1, 0, Math.PI);
  g.stroke();
  g.restore();
}
