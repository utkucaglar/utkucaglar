import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

test('README preview is a GitHub-safe animated WebP with six readable focus holds', async () => {
  const previewUrl = new URL('../assets/project-backplane-cycle.webp', import.meta.url);
  const bytes = await readFile(previewUrl);
  const metadata = await stat(previewUrl);

  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(bytes.includes(Buffer.from('ANIM')), 'preview must be animated');
  assert.equal(bytes.toString('latin1').match(/ANMF/g)?.length, 18);
  assert.ok(metadata.size > 150_000, `preview is unexpectedly small: ${metadata.size}`);
  assert.ok(metadata.size < 5_000_000, `preview exceeds GitHub-friendly budget: ${metadata.size}`);
});

test('preview generator derives three moving-route frames for every canonical port', async () => {
  const generator = await readFile(new URL('../scripts/generate-backplane-preview.mjs', import.meta.url), 'utf8');
  assert.match(generator, /const phasesPerPort = 3/);
  assert.match(generator, /for \(const port of PORTS\)/);
  assert.match(generator, /libwebp_anim/);
});
