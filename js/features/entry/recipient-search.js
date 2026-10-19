// Matches a typed name to recipients, tolerating missing Vietnamese accents.
// Pure functions: no DOM, so they are unit-tested in tests/unit.

export function profileKey(value) {
  return String(value).normalize('NFC').trim().toLocaleLowerCase('vi-VN').replace(/\s+/gu, ' ');
}

export function looseProfileKey(value) {
  return profileKey(value).normalize('NFD').replace(/[̀-ͯ]/g, '').replaceAll('đ', 'd');
}

export function findRecipient(value, profiles) {
  const input = profileKey(value),
    loose = looseProfileKey(value),
    hasAccent = input !== loose;
  const result = (found, confirm = false) =>
    found.length === 1 && !confirm
      ? { profile: found[0], error: '', candidates: [] }
      : {
          profile: null,
          error:
            found.length > 1
              ? 'Có vài tên gần giống nhau. Bạn chọn ảnh và họ tên của mình nhé ♡'
              : found.length
                ? 'Bạn xác nhận đúng ảnh và họ tên của mình nhé ♡'
                : 'Chưa tìm thấy tên này. Thử tên thật hoặc thêm chữ đệm nhé.',
          candidates: found,
        };
  if (!input) return { profile: null, error: 'Bạn để lại tên trước nha ♡', candidates: [] };
  const keys = (p) => [p.name, ...(p.aliases || [])];
  // Full names take precedence; identical full names still require a photo choice.
  let found = profiles.filter((p) => keys(p).some((k) => looseProfileKey(k) === loose));
  if (hasAccent) {
    const exact = found.filter((p) => keys(p).some((k) => profileKey(k) === input));
    if (exact.length) found = exact;
  }
  if (found.length) return result(found);
  // Match whole tokens in order, including middle names, to expose all plausible people.
  const contains = (name, query) => {
    const parts = name.split(' ');
    let from = 0;
    return query.split(' ').every((token) => {
      const i = parts.indexOf(token, from);
      if (i < 0) return false;
      from = i + 1;
      return true;
    });
  };
  found = profiles.filter((p) => keys(p).some((k) => contains(looseProfileKey(k), loose)));
  if (hasAccent) {
    const precise = found.filter((p) => keys(p).some((k) => contains(profileKey(k), input)));
    if (precise.length) found = precise;
  }
  found.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  const suffix = (p) => keys(p).some((k) => looseProfileKey(k).endsWith(' ' + loose));
  return result(found, found.length === 1 && !suffix(found[0]));
}
