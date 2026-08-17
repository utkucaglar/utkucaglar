import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

import { PORTS } from '../backplane/ports.js';
import { createPortNavigator } from '../backplane/state.js';

test('port geometry stays aligned with all six canonical repositories', async () => {
  const config = JSON.parse(await readFile(new URL('../profile.config.json', import.meta.url)));
  assert.deepEqual(
    PORTS.map(({ id, role, name, signals, url }) => ({ id, role, name, signals, url })),
    config.ports.map(({ id, role, name, signals, url }) => ({ id, role, name, signals, url })),
  );
  assert.equal(new Set(PORTS.map(({ id }) => id)).size, 6);
  for (const port of PORTS) {
    assert.match(port.maskPath, /^M[\d .LZ-]+$/);
    assert.ok(port.hotspot.x >= 0 && port.hotspot.x <= 100);
    assert.ok(port.hotspot.y >= 0 && port.hotspot.y <= 100);
    assert.match(port.routePath, /^M[\d .CS-]+$/);
  }
});

test('human selection is persistent and cancels auto advance', () => {
  const changes = [];
  const pending = new Map();
  let token = 0;
  const navigator = createPortNavigator({
    ports: PORTS,
    initialId: '01',
    reducedMotion: false,
    advanceMs: 5000,
    onChange: (port) => changes.push(port.id),
    schedule: (callback) => { pending.set(++token, callback); return token; },
    cancel: (id) => pending.delete(id),
  });
  navigator.start();
  navigator.select('04', 'human');
  assert.equal(navigator.selectedId, '04');
  assert.equal(navigator.interacted, true);
  assert.equal(pending.size, 0);
  assert.deepEqual(changes, ['01', '04']);
});

test('number and arrow keys select without hijacking editable controls', () => {
  const navigator = createPortNavigator({ ports: PORTS, initialId: '01', reducedMotion: true, onChange() {} });
  assert.equal(navigator.handleKey('6', false), true);
  assert.equal(navigator.selectedId, '06');
  assert.equal(navigator.handleKey('ArrowRight', false), true);
  assert.equal(navigator.selectedId, '01');
  assert.equal(navigator.handleKey('3', true), false);
  assert.equal(navigator.selectedId, '01');
});

test('machine advance wraps and reschedules until human interaction', () => {
  const changes = [];
  const pending = new Map();
  let token = 0;
  const navigator = createPortNavigator({
    ports: PORTS,
    initialId: '06',
    advanceMs: 10,
    onChange: (port) => changes.push(port.id),
    schedule: (callback) => { pending.set(++token, callback); return token; },
    cancel: (id) => pending.delete(id),
  });

  navigator.start();
  const firstAdvance = pending.get(1);
  pending.delete(1);
  firstAdvance();
  assert.equal(navigator.selectedId, '01');
  assert.equal(pending.size, 1);
  assert.deepEqual(changes, ['06', '01']);
});

test('invalid IDs do not mutate selection and reduced motion does not schedule', () => {
  let scheduled = 0;
  const changes = [];
  const navigator = createPortNavigator({
    ports: PORTS,
    initialId: '01',
    reducedMotion: true,
    onChange: (port) => changes.push(port.id),
    schedule: () => { scheduled += 1; return scheduled; },
  });

  navigator.start();
  assert.equal(navigator.select('99', 'human'), false);
  assert.equal(navigator.selectedId, '01');
  assert.equal(navigator.interacted, false);
  assert.equal(scheduled, 0);
  assert.deepEqual(changes, ['01']);
});
