import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const config = JSON.parse(await readFile(resolve(root, 'profile.config.json'), 'utf8'));

const xml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

for (const port of config.ports) {
  const signals = port.signals.join('   ·   ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="210" viewBox="0 0 1200 210" role="img" aria-label="${xml(`${port.role}: ${port.name}`)}">
  <defs>
    <pattern id="grid-${port.id}" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M20 0H0V20" fill="none" stroke="#16351F" stroke-width="1"/>
    </pattern>
    <linearGradient id="panel-${port.id}" x1="0" x2="1">
      <stop offset="0" stop-color="#06130B"/>
      <stop offset="1" stop-color="#020B06"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="1198" height="208" rx="18" fill="url(#panel-${port.id})" stroke="#315E39" stroke-width="2"/>
  <rect x="1" y="1" width="1198" height="208" rx="18" fill="url(#grid-${port.id})" opacity="0.52"/>
  <path d="M94 0V52M94 158V210M0 105H42M146 105H250" fill="none" stroke="#63D56F" stroke-width="2" opacity="0.7"/>
  <circle cx="94" cy="105" r="46" fill="#020B06" stroke="#A3F4AA" stroke-width="2"/>
  <circle cx="94" cy="105" r="56" fill="none" stroke="#315E39" stroke-width="1"/>
  <text x="94" y="115" text-anchor="middle" fill="#A3F4AA" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="30" font-weight="800">${xml(port.id)}</text>
  <text x="180" y="57" fill="#63D56F" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="28" font-weight="700" letter-spacing="3">${xml(port.role)}</text>
  <text x="180" y="117" fill="#E2E9DE" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="42" font-weight="800" letter-spacing="2">${xml(port.name)}</text>
  <text x="180" y="170" fill="#7D9080" font-family="ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace" font-size="28" font-weight="700" letter-spacing="2">${xml(signals)}</text>
  <path d="M1120 105h38m-14-14 14 14-14 14" fill="none" stroke="#A3F4AA" stroke-width="3"/>
</svg>`;

  const output = resolve(root, port.asset);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${svg}\n`, 'utf8');
}
