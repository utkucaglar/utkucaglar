import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const expectedPorts = [
  ['01', 'PLATFORM BOARD', 'NFC_LINK', ['TYPESCRIPT', 'REACT', 'SUPABASE'], 'https://github.com/utkucaglar/NFC_Link'],
  ['02', 'COMPUTE ASSEMBLY', 'CS445_PROJECT', ['NLP', 'REGRESSION', 'BERT'], 'https://github.com/utkucaglar/CS445-Project'],
  ['03', 'PROTOCOL DRIVE', 'YOK_AKADEMIK_MCP', ['MCP', 'SSE', 'AUTOMATION'], 'https://github.com/utkucaglar/YOK_Akademik_MCP'],
  ['04', 'COMMERCE MEMORY', 'PIXELVAULT', ['NEXT.JS', 'POSTGRES', 'N8N'], 'https://github.com/utkucaglar/cs308-team9-ecommerce-app'],
  ['05', 'DIGITAL I/O', 'BATTLESHIP_FPGA', ['VERILOG', 'FPGA', 'REALTIME'], 'https://github.com/utkucaglar/Battle_Ship_Game_FPGA'],
  ['06', 'PROCESS TREE', 'TREEPIPE_PROJECT', ['C', 'FORK', 'EXECVP', 'PIPES'], 'https://github.com/utkucaglar/TreePipe-Project'],
];

async function loadConfig() {
  return JSON.parse(await readFile(new URL('../profile.config.json', import.meta.url), 'utf8'));
}

test('manifest locks the approved system identity', async () => {
  const config = await loadConfig();
  assert.deepEqual(config.identity, {
    name: 'UTKU ÇAĞLAR',
    role: 'FULL-STACK · AI SYSTEMS · PRODUCT',
    system: 'UÇ/GREENPRINT',
    plate: 'PATENT ASSEMBLY',
    status: 'DRAWING ACTIVE',
  });
});

test('manifest defines the repository-hosted contribution matrix', async () => {
  const config = await loadConfig();
  assert.deepEqual(config.contributions, {
    username: 'utkucaglar',
    asset: 'assets/contribution-matrix.svg',
    publicAsset: 'assets/contribution-matrix.svg',
    url: 'https://github.com/utkucaglar?tab=overview',
    alt: 'Green technical contribution matrix for the last 365 days.',
  });
});

test('manifest locks the six approved repository ports', async () => {
  const config = await loadConfig();
  assert.equal(config.ports.length, 6);
  assert.deepEqual(
    config.ports.map(({ id, role, name, signals, url }) => [id, role, name, signals, url]),
    expectedPorts,
  );
  assert.equal(new Set(config.ports.map(({ id }) => id)).size, 6);
  assert.equal(new Set(config.ports.map(({ url }) => url)).size, 6);
});

test('manifest locks external I/O destinations', async () => {
  const config = await loadConfig();
  assert.deepEqual(
    config.external.map(({ label, url }) => ({ label, url })),
    [
      { label: 'PORTFOLIO', url: 'https://utkucaglar.com' },
      { label: 'LINKEDIN', url: 'https://www.linkedin.com/in/utku-%C3%A7a%C4%9Flar-065420311' },
      { label: 'EMAIL', url: 'mailto:utkucaglar00@gmail.com' },
    ],
  );
});
