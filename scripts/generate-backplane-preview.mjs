import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PORTS } from '../backplane/ports.js';

const root = resolve(import.meta.dirname, '..');
const sourceFile = resolve(root, 'assets/patent-assembly-greenprint-v2-six-port.webp');
const outputFile = resolve(root, 'assets/project-backplane-cycle.svg');
const image = (await readFile(sourceFile)).toString('base64');
const imageHref = `data:image/webp;base64,${image}`;
const keyTimes = '0;0.166667;0.333333;0.5;0.666667;0.833333;1';

const opacityValues = (index) => Array.from(
  { length: PORTS.length + 1 },
  (_, step) => step === index ? '1' : '0',
).join(';');

const dashValues = (index) => Array.from(
  { length: PORTS.length + 1 },
  (_, step) => step === index + 1 ? '0' : '120',
).join(';');

const filters = PORTS.map((port) => `
    <filter id="feather-${port.id}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>`).join('');

const masks = PORTS.map((port) => `
    <mask id="focus-mask-${port.id}">
      <rect width="1942" height="809" fill="black"/>
      <g fill="white" filter="url(#feather-${port.id})">
        <path d="${port.maskPath}"/>
        <circle cx="${port.label.cx}" cy="${port.label.cy}" r="${port.label.r}"/>
      </g>
    </mask>`).join('');

const focusLayers = PORTS.map((port, index) => `
  <g class="focus-layer focus-port-${port.id}" data-focus-port="${port.id}" opacity="0">
    <use href="#source-image" mask="url(#focus-mask-${port.id})"/>
    <animate attributeName="opacity" dur="30s" values="${opacityValues(index)}" keyTimes="${keyTimes}" calcMode="discrete" repeatCount="indefinite"/>
  </g>`).join('');

const routeLayers = PORTS.map((port, index) => `
  <g class="route-layer route-port-${port.id}" data-route-port="${port.id}" opacity="0">
    <path d="${port.routePath}" fill="none" stroke="#caf36c" stroke-width="8" stroke-linecap="round" stroke-dasharray="120 120" stroke-dashoffset="120">
      <animate attributeName="stroke-dashoffset" dur="30s" values="${dashValues(index)}" keyTimes="${keyTimes}" calcMode="linear" repeatDur="indefinite"/>
    </path>
    <animate attributeName="opacity" dur="30s" values="${opacityValues(index)}" keyTimes="${keyTimes}" calcMode="discrete" repeatCount="indefinite"/>
  </g>`).join('');

const svg = `<svg viewBox="0 0 1942 809" role="img" aria-labelledby="title description">
  <title id="title">Interactive Project Backplane preview</title>
  <desc id="description">A six-port technical drawing preview that automatically focuses each linked project module.</desc>
  <style>
    @media (prefers-reduced-motion: reduce) {
      .focus-layer, .route-layer { display: none; animation: none !important; }
      .focus-port-01, .route-port-01 { display: inline; opacity: 1 !important; }
      .focus-layer animate, .route-layer animate { display: none; }
    }
  </style>
  <defs>${filters}
${masks}
    <image id="source-image" width="1942" height="809" href="${imageHref}"/>
  </defs>
  <use id="dim-base" href="#source-image" opacity="0.38"/>${focusLayers}
${routeLayers}
</svg>
`;

await writeFile(outputFile, svg, 'utf8');
