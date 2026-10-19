import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { MUSIC_PLAYLIST } from '../../js/config.js';

// readdirSync returns names with their real capitalisation, so this also catches
// "Bai-1.mp3" vs "bai-1.mp3", which works on Windows but 404s on GitHub Pages.
const musicDir = new URL('../../assets/music/', import.meta.url);
const musicFiles = existsSync(musicDir) ? readdirSync(musicDir) : [];

test('every playlist track is a file in assets/music/', () => {
  for (const track of MUSIC_PLAYLIST) {
    assert.match(
      track.src,
      /^assets\/music\/[a-z0-9._-]+$/,
      `${track.src}: use lowercase names without spaces or accents`,
    );
    assert.ok(musicFiles.includes(track.src.slice('assets/music/'.length)), `${track.src} is missing`);
  }
});

test('every playlist track has a title to show', () => {
  for (const track of MUSIC_PLAYLIST) assert.ok(track.title?.trim(), `${track.src} needs a title`);
});
