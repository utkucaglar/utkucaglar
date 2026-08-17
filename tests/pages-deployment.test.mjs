import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Pages workflow publishes only the backplane directory from main', async () => {
  const workflow = await readFile(new URL('../.github/workflows/deploy-pages.yml', import.meta.url), 'utf8');
  assert.match(workflow, /branches:\s*\[main\]/);
  assert.match(workflow, /^\s*workflow_dispatch:\s*$/m);
  assert.match(workflow, /schedule:\s*\n\s*- cron:\s*['"]17 4 \* \* \*['"]\s*\n\s*timezone:\s*['"]Europe\/Istanbul['"]/);
  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /concurrency:\s*\n\s*group:\s*pages\s*\n\s*cancel-in-progress:\s*true/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /npm run generate:contributions/);
  assert.match(workflow, /GITHUB_TOKEN:\s*\$\{\{\s*secrets\.GITHUB_TOKEN\s*\}\}/);
  assert.match(workflow, /GITHUB_USERNAME:\s*utkucaglar/);
  assert.ok(workflow.indexOf('npm run generate:contributions') < workflow.indexOf('actions/upload-pages-artifact@v3'));
  assert.match(workflow, /environment:\s*\n\s*name:\s*github-pages\s*\n\s*url:\s*\$\{\{\s*steps\.deployment\.outputs\.page_url\s*\}\}/);
  const uploadStep = workflow.match(/actions\/upload-pages-artifact@v3\s*\n\s*with:\s*\n\s*path:\s*([^\s#]+)/);
  assert.ok(uploadStep, 'workflow must upload a Pages artifact');
  assert.equal(uploadStep[1], 'backplane', 'upload artifact path must be exactly backplane');
  assert.doesNotMatch(workflow, /^\s*path:\s*["']?\.\/["']?\s*(?:#.*)?$/m);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});
