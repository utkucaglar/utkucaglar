import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('profile.config.json', root), 'utf8'));

test('README contains the approved identity and one Pages-hosted hero', async () => {
  const readme = await readFile(new URL('README.md', root), 'utf8');
  assert.ok(readme.includes(config.identity.name));
  assert.ok(readme.includes(config.identity.role));
  assert.ok(readme.includes(`src="${config.hero.publicUrl}"`));
  assert.ok(readme.includes(`alt="${config.hero.alt}"`));
});

test('README hero opens the interactive backplane', async () => {
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, new RegExp(`<a href="${config.interactive.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">\\s*<img width="100%" src="${config.hero.publicUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  assert.equal(config.hero.file, 'assets/project-backplane-cycle.webp');
  assert.equal(config.hero.sourceFile, 'assets/patent-assembly-greenprint-v2-six-port.webp');
});

test('README contains exactly six linked repository cards including TreePipe', async () => {
  const readme = await readFile(new URL('README.md', root), 'utf8');
  for (const port of config.ports) {
    assert.ok(readme.includes(`href="${port.url}"`));
    assert.ok(readme.includes(`src="./${port.asset}"`));
    assert.ok(readme.includes(`${port.role}: ${port.name} — ${port.signals.join(', ')}`));
  }
  assert.ok(readme.includes('href="https://github.com/utkucaglar/TreePipe-Project"'));
  assert.ok(readme.includes('data-port="06"'));
  assert.equal((readme.match(/data-port="\d{2}"/g) ?? []).length, 6);
});

test('README arranges compact project modules in three desktop pairs', async () => {
  const readme = await readFile(new URL('README.md', root), 'utf8');
  assert.ok(readme.includes('PROJECT BACKPLANE · 06 LINKED MODULES'));
  assert.equal((readme.match(/<img width="410" src="\.\/assets\/port-\d{2}[^\"]+\.svg"/g) ?? []).length, 6);
  assert.equal((readme.match(/<\/a><br>/g) ?? []).length, 3);
});

test('README contains external I/O and excludes generic profile widgets', async () => {
  const readme = await readFile(new URL('README.md', root), 'utf8');
  for (const item of config.external) assert.ok(readme.includes(`href="${item.url}"`));
  assert.doesNotMatch(readme, /github-readme-stats|troph|visitor|streak|wak(atime)?/i);
  assert.doesNotMatch(readme, /<script|<style/i);
});
