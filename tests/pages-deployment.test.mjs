import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Pages workflow publishes only the backplane directory from main', async () => {
  const workflow = await readFile(new URL('../.github/workflows/deploy-pages.yml', import.meta.url), 'utf8');
  assert.match(workflow, /branches:\s*\[main\]/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /actions\/upload-pages-artifact@v3[\s\S]+path:\s*backplane/);
  assert.doesNotMatch(workflow, /path:\s*[.'"]+\s*$/m);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});
