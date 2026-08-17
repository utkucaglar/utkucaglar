import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('animated preview embeds one dim base and six feathered focus states', async () => {
  const svg = await readFile(new URL('../assets/project-backplane-cycle.svg', import.meta.url), 'utf8');
  assert.match(svg, /viewBox="0 0 1942 809"/);
  assert.equal((svg.match(/data:image\/webp;base64,/g) ?? []).length, 1);
  assert.equal((svg.match(/data-focus-port="\d{2}"/g) ?? []).length, 6);
  assert.equal((svg.match(/data-route-port="\d{2}"/g) ?? []).length, 6);
  assert.equal((svg.match(/repeatCount="indefinite"/g) ?? []).length, 12);
  assert.match(svg, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(svg, /<script|@import|https?:\/\//i);
});
