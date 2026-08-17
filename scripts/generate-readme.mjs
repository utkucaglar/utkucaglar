import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const config = JSON.parse(await readFile(resolve(root, 'profile.config.json'), 'utf8'));

const attr = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

await Promise.all([...config.ports, ...config.external].map((item) => copyFile(
  resolve(root, item.asset),
  resolve(root, 'backplane/assets', basename(item.asset)),
)));

const portRows = [];
for (let index = 0; index < config.ports.length; index += 2) {
  const row = config.ports.slice(index, index + 2).map((port) => `<a href="${attr(port.url)}" data-port="${attr(port.id)}"><img width="410" src="${attr(port.publicAsset)}" alt="${attr(`${port.role}: ${port.name} — ${port.signals.join(', ')}`)}"></a>`).join('\n');
  portRows.push(`${row}<br>`);
}

const ports = `<div align="center">
  <p><samp>PROJECT BACKPLANE · 06 LINKED MODULES</samp></p>
  ${portRows.join('\n  ')}
</div>`;

const external = config.external
  .map((item) => `<a href="${attr(item.url)}" data-channel="${attr(item.id)}"><img width="255" src="${attr(item.publicAsset)}" alt="${attr(item.alt)}"></a>`)
  .join('\n');

const readme = `<div align="center">
  <p><samp>${attr(config.identity.system)} &nbsp;·&nbsp; ${attr(config.identity.plate)} &nbsp;·&nbsp; ${attr(config.identity.status)}</samp></p>
  <h1>${attr(config.identity.name)}</h1>
  <p><samp>${attr(config.identity.role)}</samp></p>
</div>

<a href="${attr(config.interactive.url)}"><img width="100%" src="${attr(config.hero.publicUrl)}" alt="${attr(config.hero.alt)}"></a>

<br>

${ports}

<br>

<div align="center">
  <p><samp>EXTERNAL I/O · 03 ACTIVE CHANNELS</samp></p>
  ${external}
</div>
`;

await writeFile(resolve(root, 'README.md'), readme, 'utf8');
