import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const heroUrl = new URL('../assets/patent-assembly-greenprint.webp', import.meta.url);

test('hero is a compact local WebP', async () => {
  const bytes = await readFile(heroUrl);
  const metadata = await stat(heroUrl);
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(metadata.size > 150_000, `hero is unexpectedly small: ${metadata.size}`);
  assert.ok(metadata.size < 1_000_000, `hero exceeds budget: ${metadata.size}`);
});
