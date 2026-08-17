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
});

test('standalone preview declares its SVG namespace without external references', async () => {
  const svg = await readFile(new URL('../assets/project-backplane-cycle.svg', import.meta.url), 'utf8');
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  const withoutSvgNamespace = svg.replace('xmlns="http://www.w3.org/2000/svg"', '');
  assert.doesNotMatch(withoutSvgNamespace, /<script|@import|https?:\/\//i);
});

test('reduced motion shows a static port 01 state with no SMIL children', async () => {
  const svg = await readFile(new URL('../assets/project-backplane-cycle.svg', import.meta.url), 'utf8');
  assert.match(svg, /\.focus-layer, \.route-layer \{ display: none;/);
  assert.match(svg, /\.static-focus-layer, \.static-route-layer \{ display: inline;/);

  for (const role of ['focus', 'route']) {
    const staticLayer = svg.match(new RegExp(`<g class="static-${role}-layer" data-static-${role}-port="01">[\\s\\S]*?<\\/g>`))?.[0];
    assert.ok(staticLayer, `missing static reduced-motion ${role} layer`);
    assert.doesNotMatch(staticLayer, /<animate\b/);
  }
});
