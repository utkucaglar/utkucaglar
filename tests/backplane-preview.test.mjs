import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const config = JSON.parse(await readFile(new URL('../profile.config.json', import.meta.url), 'utf8'));

test('configured README hero is a compact single-frame WebP', async () => {
  const heroUrl = new URL(`../${config.hero.file}`, import.meta.url);
  const bytes = await readFile(heroUrl);
  const metadata = await stat(heroUrl);

  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.equal(bytes.includes(Buffer.from('ANIM')), false, 'hero must not animate');
  assert.ok(metadata.size > 150_000, `hero is unexpectedly small: ${metadata.size}`);
  assert.ok(metadata.size < 1_000_000, `hero exceeds budget: ${metadata.size}`);
});
