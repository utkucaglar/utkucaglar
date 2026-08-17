import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('profile.config.json', root), 'utf8'));

for (const port of config.ports) {
  test(`${port.id} card is complete and self-contained`, async () => {
    const svg = await readFile(new URL(port.asset, root), 'utf8');
    assert.match(svg, /<svg[^>]+viewBox="0 0 800 170"/);
    assert.match(svg, new RegExp(`>${port.id}<`));
    assert.ok(svg.includes(port.role));
    assert.ok(svg.includes(port.name));
    for (const signal of port.signals) assert.ok(svg.includes(signal));
    const contentWithoutNamespace = svg.replace('http://www.w3.org/2000/svg', '');
    assert.doesNotMatch(contentWithoutNamespace, /<script|@import|https?:\/\/|xlink:href/i);
    assert.ok(Buffer.byteLength(svg) < 25_000);
  });
}
