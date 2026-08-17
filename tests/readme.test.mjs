import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('profile.config.json', root), 'utf8'));

test('README contains the approved identity and one local hero', async () => {
  const readme = await readFile(new URL('README.md', root), 'utf8');
  assert.ok(readme.includes(config.identity.name));
  assert.ok(readme.includes(config.identity.role));
  assert.ok(readme.includes(`src="./${config.hero.file}"`));
  assert.ok(readme.includes(`alt="${config.hero.alt}"`));
});

test('README contains exactly five linked repository cards', async () => {
  const readme = await readFile(new URL('README.md', root), 'utf8');
  for (const port of config.ports) {
    assert.ok(readme.includes(`href="${port.url}"`));
    assert.ok(readme.includes(`src="./${port.asset}"`));
    assert.ok(readme.includes(`${port.role}: ${port.name} — ${port.signals.join(', ')}`));
  }
  assert.equal((readme.match(/data-port="\d{2}"/g) ?? []).length, 5);
});

test('README contains external I/O and excludes generic profile widgets', async () => {
  const readme = await readFile(new URL('README.md', root), 'utf8');
  for (const item of config.external) assert.ok(readme.includes(`href="${item.url}"`));
  assert.doesNotMatch(readme, /github-readme-stats|troph|visitor|streak|wak(atime)?/i);
  assert.doesNotMatch(readme, /<script|<style/i);
});
