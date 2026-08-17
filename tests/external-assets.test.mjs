import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('profile.config.json', root), 'utf8'));
const expectedChannels = [
  {
    id: 'portfolio',
    label: 'PORTFOLIO',
    channel: 'WEB UPLINK',
    detail: 'PUBLIC INTERFACE',
    asset: 'assets/io-portfolio-terminal.svg',
    publicAsset: 'https://utkucaglar.github.io/utkucaglar/assets/io-portfolio-terminal.svg',
  },
  {
    id: 'linkedin',
    label: 'LINKEDIN',
    channel: 'NETWORK NODE',
    detail: 'PROFESSIONAL GRAPH',
    asset: 'assets/io-linkedin-network.svg',
    publicAsset: 'https://utkucaglar.github.io/utkucaglar/assets/io-linkedin-network.svg',
  },
  {
    id: 'email',
    label: 'EMAIL',
    channel: 'DIRECT CHANNEL',
    detail: 'MESSAGE LINE',
    asset: 'assets/io-email-channel.svg',
    publicAsset: 'https://utkucaglar.github.io/utkucaglar/assets/io-email-channel.svg',
  },
];

for (const expected of expectedChannels) {
  test(`${expected.label} terminal is self-contained and deployed to Pages`, async () => {
    const channel = config.external.find((item) => item.id === expected.id);
    assert.deepEqual(channel, {
      ...expected,
      url: channel?.url,
      alt: channel?.alt,
    });
    const sourceUrl = new URL(expected.asset, root);
    const svg = await readFile(sourceUrl, 'utf8');
    assert.match(svg, /<svg[^>]+viewBox="0 0 500 340"/);
    assert.ok(svg.includes(expected.label));
    assert.ok(svg.includes(expected.channel));
    assert.ok(svg.includes(expected.detail));
    const contentWithoutNamespace = svg.replace('http://www.w3.org/2000/svg', '');
    assert.doesNotMatch(contentWithoutNamespace, /<script|@import|https?:\/\/|xlink:href/i);
    assert.ok(Buffer.byteLength(svg) < 25_000);
    assert.equal(expected.publicAsset, `https://utkucaglar.github.io/utkucaglar/assets/${expected.asset.split('/').at(-1)}`);
    const deployed = await readFile(new URL(`backplane/assets/${expected.asset.split('/').at(-1)}`, root));
    assert.deepEqual(deployed, await readFile(sourceUrl));
  });
}
