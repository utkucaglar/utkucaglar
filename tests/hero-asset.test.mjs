import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const config = JSON.parse(await readFile(new URL('../profile.config.json', import.meta.url), 'utf8'));

test('configured hero is the generated animated six-port preview', async () => {
  assert.equal(config.hero.file, 'assets/project-backplane-cycle.webp');
  assert.equal(config.hero.publicUrl, 'https://utkucaglar.github.io/utkucaglar/assets/project-backplane-cycle.webp');
  assert.equal(config.hero.sourceFile, 'assets/patent-assembly-greenprint-v2-six-port.webp');
  assert.match(config.hero.alt, /automatic six-port focus sequence/i);
  const heroUrl = new URL(`../${config.hero.file}`, import.meta.url);
  const hero = await readFile(heroUrl);
  assert.equal(hero.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(hero.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(hero.includes(Buffer.from('ANIM')));

  const deployed = await readFile(new URL('../backplane/assets/project-backplane-cycle.webp', import.meta.url));
  assert.deepEqual(deployed, hero);

  const sourceUrl = new URL(`../${config.hero.sourceFile}`, import.meta.url);
  const bytes = await readFile(sourceUrl);
  const metadata = await stat(sourceUrl);
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(metadata.size > 150_000, `source hero is unexpectedly small: ${metadata.size}`);
  assert.ok(metadata.size < 1_000_000, `hero exceeds budget: ${metadata.size}`);
});
