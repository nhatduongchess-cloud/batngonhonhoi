// The feedback cat: its face follows the 0–100 score. Returns SVG markup.

export function feedbackMood(score) {
  return score < 20
    ? 'Buồn một chút'
    : score < 40
      ? 'Chưa vui lắm'
      : score < 60
        ? 'Bình thường'
        : score < 80
          ? 'Khá vui'
          : 'Vui hết nấc';
}

export function catDrawing(score, thumb = false) {
  const t = score / 100,
    curve = 94 + (t - 0.5) * 30,
    eye =
      score >= 75
        ? '<path d="M74 73Q81 61 88 73M112 73Q119 61 126 73" fill="none" stroke="#6b4a59" stroke-width="4" stroke-linecap="round"/>'
        : '<ellipse cx="81" cy="72" rx="5" ry="' +
          (7 - t * 2) +
          '" fill="#6b4a59"/><ellipse cx="119" cy="72" rx="5" ry="' +
          (7 - t * 2) +
          '" fill="#6b4a59"/><circle cx="83" cy="70" r="1.6" fill="white"/><circle cx="121" cy="70" r="1.6" fill="white"/>';
  const tears =
    score < 25
      ? '<path d="M69 81Q59 94 68 96Q77 94 69 81M132 81Q123 94 132 96Q141 94 132 81" fill="#aacbdc" opacity="' +
        (1 - t * 3) +
        '"/>'
      : '';
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' +
    (thumb ? '40 10 120 115' : '0 0 220 175') +
    '">' +
    (!thumb
      ? '<ellipse cx="108" cy="160" rx="68" ry="8" fill="#b994aa" opacity=".18"/><path class="cat-tail" d="M153 143Q203 154 193 117" fill="none" stroke="#ebcbb7" stroke-width="16" stroke-linecap="round"/><ellipse cx="106" cy="128" rx="46" ry="35" fill="#f6e2ce" stroke="#c99caa" stroke-width="2"/><ellipse cx="79" cy="151" rx="19" ry="10" fill="#fff1df"/><ellipse cx="131" cy="151" rx="19" ry="10" fill="#fff1df"/>'
      : '') +
    '<path d="M52 57L48 ' +
    (17 + (1 - t) * 13) +
    'Q68 20 82 41Q100 33 119 41Q137 20 153 ' +
    (17 + (1 - t) * 13) +
    'L148 60Q162 99 132 112Q100 125 69 112Q39 98 52 57" fill="#fff0dc" stroke="#bb8c9e" stroke-width="2.5"/><path d="M56 49L55 31L74 44M127 44L146 31L145 51" fill="#efb8c8"/>' +
    eye +
    '<ellipse cx="65" cy="88" rx="10" ry="5" fill="#ed9fb9" opacity="' +
    (0.25 + t * 0.6) +
    '"/><ellipse cx="136" cy="88" rx="10" ry="5" fill="#ed9fb9" opacity="' +
    (0.25 + t * 0.6) +
    '"/><path d="M96 82Q100 79 104 82L100 87Z" fill="#b87e97"/><path d="M87 96Q100 ' +
    curve +
    ' 113 96" fill="none" stroke="#855e73" stroke-width="3" stroke-linecap="round"/><path d="M56 79L43 76M55 86L41 86M146 79L159 76M147 86L161 86" stroke="#bb8c9e" stroke-width="1.5" stroke-linecap="round"/>' +
    tears +
    (!thumb
      ? '<g fill="#df8eac" opacity="' +
        Math.max(0, (t - 0.65) / 0.35) +
        '"><path d="M27 43C9 25 2 48 27 60C53 43 40 26 27 43"/><path d="M184 28C170 14 160 32 184 43C208 30 197 14 184 28"/></g>'
      : '') +
    '</svg>'
  );
}
