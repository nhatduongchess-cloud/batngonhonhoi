import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findRecipient, looseProfileKey, profileKey } from '../../js/features/entry/recipient-search.js';
import recipients from '../../js/data/recipients.js';

const profiles = [
  { id: 'a', name: 'Trịnh Hoàng Phương An' },
  { id: 'b', name: 'Nguyễn Thị Lan' },
  { id: 'c', name: 'Nguyễn Thị Lan' },
  { id: 'd', name: 'Đặng Minh Thư', aliases: ['Thư Đặng'] },
  { id: 'e', name: 'Lê Thu Hà' },
  { id: 'f', name: 'Lê Thu Hằng' },
];

test('keys normalise case, spacing and accents', () => {
  assert.equal(profileKey('  Phương   AN '), 'phương an');
  assert.equal(looseProfileKey('Đặng Minh Thư'), 'dang minh thu');
});

test('empty input asks for a name', () => {
  const match = findRecipient('   ', profiles);
  assert.equal(match.profile, null);
  assert.match(match.error, /tên/);
});

test('full name matches with or without accents', () => {
  assert.equal(findRecipient('Trịnh Hoàng Phương An', profiles).profile.id, 'a');
  assert.equal(findRecipient('trinh hoang phuong an', profiles).profile.id, 'a');
});

test('đ folds to d and aliases match', () => {
  assert.equal(findRecipient('dang minh thu', profiles).profile.id, 'd');
  assert.equal(findRecipient('Thư Đặng', profiles).profile.id, 'd');
});

test('identical full names require a photo choice', () => {
  const match = findRecipient('Nguyễn Thị Lan', profiles);
  assert.equal(match.profile, null);
  assert.deepEqual(match.candidates.map((p) => p.id).sort(), ['b', 'c']);
});

test('a trailing given name matches directly', () => {
  assert.equal(findRecipient('Phương An', profiles).profile.id, 'a');
});

test('a partial name that is not the ending asks to confirm', () => {
  const match = findRecipient('Trịnh Hoàng', profiles);
  assert.equal(match.profile, null);
  assert.deepEqual(
    match.candidates.map((p) => p.id),
    ['a'],
  );
});

test('accents pick the precise person among unaccented look-alikes', () => {
  assert.deepEqual(findRecipient('le thu ha', profiles).profile.id, 'e');
  assert.equal(findRecipient('Thu Hằng', profiles).profile.id, 'f');
});

test('unknown names report not found', () => {
  const match = findRecipient('Không Có Ai', profiles);
  assert.equal(match.profile, null);
  assert.deepEqual(match.candidates, []);
});

test('every real recipient is found by their own full name', () => {
  for (const person of recipients) {
    const match = findRecipient(person.name, recipients);
    const found = match.profile ? [match.profile] : match.candidates;
    assert.ok(
      found.some((p) => p.id === person.id),
      `${person.name} should be reachable`,
    );
  }
});

test('recipient data is well-formed', () => {
  const ids = new Set();
  for (const person of recipients) {
    assert.equal(typeof person.id, 'string');
    assert.ok(!ids.has(person.id), `duplicate id ${person.id}`);
    ids.add(person.id);
    assert.ok(person.name.trim(), 'name is required');
    assert.match(person.photo, /^assets\//);
  }
});
