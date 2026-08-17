import { copyFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';
import { PORTS } from '../backplane/ports.js';

const root = resolve(import.meta.dirname, '..');
const sourceFile = resolve(root, 'assets/patent-assembly-greenprint-v2-six-port.webp');
const outputFile = resolve(root, 'assets/project-backplane-cycle.webp');
const deployedFile = resolve(root, 'backplane/assets/project-backplane-cycle.webp');
const phasesPerPort = 3;
const frameDelayMs = 1000;
const frameWidth = 1440;
const frameHeight = 600;

const renderMask = (port) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${frameWidth}" height="${frameHeight}" viewBox="0 0 1942 809">
  <defs>
    <filter id="feather" x="-24%" y="-24%" width="148%" height="148%">
      <feGaussianBlur stdDeviation="13"/>
    </filter>
  </defs>
  <g fill="white" filter="url(#feather)">
    <path d="${port.maskPath}"/>
    <circle cx="${port.label.cx}" cy="${port.label.cy}" r="${port.label.r}"/>
  </g>
</svg>`);

const renderRoute = (port, phase) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${frameWidth}" height="${frameHeight}" viewBox="0 0 1942 809">
  <defs>
    <filter id="route-glow" x="-35%" y="-35%" width="170%" height="170%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <path d="${port.routePath}" fill="none" stroke="#59d77c" stroke-opacity="0.34" stroke-width="4" stroke-linecap="round"/>
  <path d="${port.routePath}" fill="none" stroke="#ddff8a" stroke-width="7" stroke-linecap="round" stroke-dasharray="28 92" stroke-dashoffset="${-phase * 40}" filter="url(#route-glow)"/>
</svg>`);

const run = (command, args) => new Promise((resolveRun, reject) => {
  const child = spawn(command, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let errorOutput = '';
  child.stderr.on('data', (chunk) => { errorOutput += chunk; });
  child.on('error', reject);
  child.on('close', (code) => {
    if (code === 0) resolveRun();
    else reject(new Error(`ffmpeg exited with ${code}: ${errorOutput}`));
  });
});

const framesDirectory = await mkdtemp(join(tmpdir(), 'backplane-preview-'));

try {
  const dimBase = await sharp(sourceFile)
    .resize(frameWidth, frameHeight)
    .modulate({ brightness: 0.5, saturation: 0.72 })
    .png()
    .toBuffer();
  const brightBase = await sharp(sourceFile)
    .resize(frameWidth, frameHeight)
    .modulate({ brightness: 1.08, saturation: 1.08 })
    .png()
    .toBuffer();

  let frame = 0;
  for (const port of PORTS) {
    const mask = await sharp(renderMask(port)).png().toBuffer();
    const focus = await sharp(brightBase)
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toBuffer();

    for (let phase = 0; phase < phasesPerPort; phase += 1) {
      const frameFile = join(framesDirectory, `frame-${String(frame).padStart(2, '0')}.png`);
      const route = await sharp(renderRoute(port, phase)).png().toBuffer();
      await sharp(dimBase)
        .composite([{ input: focus }, { input: route }])
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toFile(frameFile);
      frame += 1;
    }
  }

  await run(ffmpegPath, [
    '-hide_banner',
    '-loglevel', 'error',
    '-y',
    '-framerate', String(1000 / frameDelayMs),
    '-i', join(framesDirectory, 'frame-%02d.png'),
    '-c:v', 'libwebp_anim',
    '-preset', 'drawing',
    '-quality', '84',
    '-loop', '0',
    outputFile,
  ]);
  await copyFile(outputFile, deployedFile);
} finally {
  await rm(framesDirectory, { recursive: true, force: true });
}
