import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const config = JSON.parse(await readFile(new URL('../profile.config.json', import.meta.url), 'utf8'));

test('configured hero is the compact six-port local WebP', async () => {
  assert.equal(config.hero.file, 'assets/patent-assembly-greenprint-v2-six-port.webp');
  assert.match(config.hero.alt, /six numbered repository markers/i);
  const heroUrl = new URL(`../${config.hero.file}`, import.meta.url);
  const bytes = await readFile(heroUrl);
  const metadata = await stat(heroUrl);
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(metadata.size > 150_000, `hero is unexpectedly small: ${metadata.size}`);
  assert.ok(metadata.size < 1_000_000, `hero exceeds budget: ${metadata.size}`);
});
