import { test } from 'node:test';
import assert from 'node:assert/strict';
import recipients from '../../js/data/recipients.js';
import { findRecipient } from '../../js/features/entry/recipient-search.js';
import { isBirthdayRecipient } from '../../js/session/birthday.js';

test('Nguyen Thao alias selects Nguyên Thảo without a photo-choice prompt', () => {
  for (const name of ['Nguyen Thao', '  NGUYEN   THAO ', 'Nguyên Thảo', 'Trần Hoàng Nguyên Thảo']) {
    const match = findRecipient(name, recipients);
    assert.equal(match.profile.name, 'Trần Hoàng Nguyên Thảo');
    assert.deepEqual(match.candidates, []);
    assert.equal(match.error, '');
  }
});

test('Thảo Vân remains accessible and Thao alone still asks which person', () => {
  assert.equal(findRecipient('Nguyễn Ngọc Thảo Vân', recipients).profile.name, 'Nguyễn Ngọc Thảo Vân');
  const match = findRecipient('Thao', recipients);
  assert.equal(match.profile, null);
  assert.equal(match.candidates.length, 2);
});

test('birthday eligibility uses stable recipient identity, not partial name matching', () => {
  assert.deepEqual(
    recipients.filter(isBirthdayRecipient).map((p) => p.name),
    ['Trần Hoàng Nguyên Thảo'],
  );
  assert.equal(isBirthdayRecipient(null), false);
  assert.equal(isBirthdayRecipient({ name: 'Trần Hoàng Nguyên Thảo' }), false);
});
