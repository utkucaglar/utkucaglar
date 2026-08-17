import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const config = JSON.parse(await readFile(new URL('../profile.config.json', import.meta.url), 'utf8'));

test('configured hero is the static six-port patent assembly', async () => {
  assert.equal(config.hero.file, 'assets/patent-assembly-greenprint-v2-six-port.webp');
  assert.equal(config.hero.publicUrl, 'https://utkucaglar.github.io/utkucaglar/assets/assembly.webp');
  assert.match(config.hero.alt, /static six-port/i);
  const heroUrl = new URL(`../${config.hero.file}`, import.meta.url);
  const hero = await readFile(heroUrl);
  assert.equal(hero.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(hero.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.equal(hero.includes(Buffer.from('ANIM')), false);

  const deployed = await readFile(new URL('../backplane/assets/assembly.webp', import.meta.url));
  assert.deepEqual(deployed, hero);
  const metadata = await stat(heroUrl);
  assert.ok(metadata.size > 150_000, `hero is unexpectedly small: ${metadata.size}`);
  assert.ok(metadata.size < 1_000_000, `hero exceeds budget: ${metadata.size}`);
});
