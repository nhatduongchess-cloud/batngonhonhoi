import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const modules = readdirSync(new URL('../../js/', import.meta.url), { recursive: true })
  .map((path) => 'js/' + path.replaceAll('\\', '/'))
  .filter((path) => path.endsWith('.js'));
const preloaded = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map((match) => match[1]);

test('index.html loads js/main.js as a module', () => {
  assert.match(html, /<script type="module" src="js\/main\.js"><\/script>/);
});

test('every module is preloaded so the page is interactive quickly', () => {
  const missing = modules.filter((path) => path !== 'js/main.js' && !preloaded.includes(path));
  assert.deepEqual(missing, [], 'add a <link rel="modulepreload"> in index.html for each new module');
});

test('every preload points at an existing module', () => {
  const stale = preloaded.filter((path) => !modules.includes(path));
  assert.deepEqual(stale, [], 'remove preload links for deleted modules');
});
