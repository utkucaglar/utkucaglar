import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PORTS } from '../backplane/ports.js';

const pageUrl = new URL('../backplane/index.html', import.meta.url);

test('interactive page exposes six accessible ports and a repository action', async () => {
  const html = await readFile(pageUrl, 'utf8');
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  assert.equal((html.match(/data-select-port="\d{2}"/g) ?? []).length, 6);
  assert.equal((html.match(/aria-label="Select port \d{2}:/g) ?? []).length, 6);
  assert.equal((html.match(/data-port-layer="\d{2}"/g) ?? []).length, 6);
  assert.equal((html.match(/data-port-route="\d{2}"/g) ?? []).length, 6);
  assert.match(html, /data-active-link[^>]+OPEN REPOSITORY/);
  assert.doesNotMatch(html, /https?:\/\/(?!www\.w3\.org\/2000\/svg)/);
});

test('page port targets are unique and cover the six canonical IDs', async () => {
  const html = await readFile(pageUrl, 'utf8');
  const expected = ['01', '02', '03', '04', '05', '06'];
  const idsFor = (attribute) => [
    ...html.matchAll(new RegExp(`${attribute}="(\\d{2})"`, 'g')),
  ].map((match) => match[1]).sort();

  assert.deepEqual(idsFor('data-select-port'), expected);
  assert.deepEqual(idsFor('data-port-layer'), expected);
  assert.deepEqual(idsFor('data-port-route'), expected);
});

test('page drawing geometry stays synchronized with the canonical port registry', async () => {
  const html = await readFile(pageUrl, 'utf8');
  const masks = new Map(
    [...html.matchAll(/<clipPath id="port-mask-(\d{2})"><path d="([^"]+)"\/><circle cx="([^"]+)" cy="([^"]+)" r="([^"]+)"\/><\/clipPath>/g)]
      .map(([, id, maskPath, cx, cy, r]) => [id, { maskPath, label: { cx: Number(cx), cy: Number(cy), r: Number(r) } }]),
  );
  const routes = new Map(
    [...html.matchAll(/<path\b(?=[^>]*data-port-route="(\d{2})")(?=[^>]*d="([^"]+)")[^>]*\/>/g)]
      .map(([, id, routePath]) => [id, routePath]),
  );
  const hotspots = new Map(
    [...html.matchAll(/<button\b[^>]*data-select-port="\d{2}"[^>]*>/g)].map(([element]) => {
      const id = element.match(/data-select-port="(\d{2})"/)?.[1];
      const coordinates = element.match(/--hotspot-x:\s*([\d.]+)%;\s*--hotspot-y:\s*([\d.]+)%/);
      return [id, { x: Number(coordinates?.[1]), y: Number(coordinates?.[2]) }];
    }),
  );

  assert.equal(masks.size, PORTS.length, 'each canonical port needs one SVG mask');
  assert.equal(routes.size, PORTS.length, 'each canonical port needs one SVG route');
  assert.equal(hotspots.size, PORTS.length, 'each canonical port needs one interactive hotspot');

  for (const { id, maskPath, label, routePath, hotspot } of PORTS) {
    assert.deepEqual(masks.get(id), { maskPath, label }, `mask geometry for port ${id}`);
    assert.equal(routes.get(id), routePath, `route geometry for port ${id}`);
    assert.deepEqual(hotspots.get(id), hotspot, `hotspot geometry for port ${id}`);
  }
});

test('page uses local stylesheet, module, and assembly image resources', async () => {
  const html = await readFile(pageUrl, 'utf8');
  assert.match(html, /<link rel="stylesheet" href="\.\/backplane\.css">/);
  assert.match(html, /<script type="module" src="\.\/backplane\.js"><\/script>/);
  assert.ok((html.match(/href="\.\/backplane\.css"/g) ?? []).length === 1);
  assert.ok((html.match(/src="\.\/backplane\.js"/g) ?? []).length === 1);
  assert.ok((html.match(/href="\.\/assets\/assembly\.webp"/g) ?? []).length >= 1);
  assert.doesNotMatch(html, /(?:src|href)="\/(?!\/)/);
});

test('deployed assembly is a byte-for-byte copy of the canonical hero', async () => {
  const [deployed, canonical] = await Promise.all([
    readFile(new URL('../backplane/assets/assembly.webp', import.meta.url)),
    readFile(new URL('../assets/patent-assembly-greenprint-v2-six-port.webp', import.meta.url)),
  ]);
  assert.deepEqual(deployed, canonical);
});
