import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const markdown = await readFile(resolve(root, 'README.md'), 'utf8');
const response = await fetch('https://api.github.com/markdown', {
  method: 'POST',
  headers: {
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'utkucaglar-profile-preview',
    'X-GitHub-Api-Version': '2022-11-28',
  },
  body: JSON.stringify({
    text: markdown,
    mode: 'gfm',
  }),
});

if (!response.ok) throw new Error(`GitHub Markdown API returned ${response.status}`);
const fragment = (await response.text())
  .replaceAll('src="./assets/', 'src="../assets/');
const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GitHub Profile Preview</title>
<style>
  *{box-sizing:border-box}body{margin:0;background:#0d1117;color:#f0f6fc;font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  main{width:min(100% - 32px,900px);margin:32px auto}.markdown-body img{max-width:100%;height:auto}.markdown-body a{color:#58a6ff;text-decoration:none}.markdown-body h1{border:0;text-align:center}.markdown-body p{margin:12px 0}
</style>
<main class="markdown-body">${fragment}</main>
</html>`;

await mkdir(resolve(root, '.preview'), { recursive: true });
await writeFile(resolve(root, '.preview/index.html'), html, 'utf8');
