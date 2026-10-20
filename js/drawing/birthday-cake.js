import { tinyHeart } from './doodles.js';
export function drawBirthdayCake(g, x, y, scale = 1) {
  g.save();
  g.translate(x, y);
  g.scale(scale, scale);
  g.fillStyle = '#fff3e6';
  g.beginPath();
  g.ellipse(0, 80, 108, 12, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#eaa8bf';
  g.beginPath();
  g.roundRect(-90, 9, 180, 66, 13);
  g.fill();
  g.fillStyle = '#fff1e8';
  g.fillRect(-90, 39, 180, 8);
  g.fillStyle = '#f8cedb';
  g.beginPath();
  g.roundRect(-73, -36, 146, 60, 13);
  g.fill();
  g.strokeStyle = '#fff9ed';
  g.lineWidth = 13;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-66, -28);
  g.lineTo(66, -28);
  g.stroke();
  for (const dx of [-38, 0, 38]) {
    g.fillStyle = '#b49bc8';
    g.fillRect(dx - 4, -70, 8, 35);
    g.fillStyle = '#efb65e';
    g.beginPath();
    g.ellipse(dx, -80, 6, 11, 0, 0, Math.PI * 2);
    g.fill();
  }
  tinyHeart(g, 0, 55, 0.7, '#fff9ed');
  g.restore();
}
