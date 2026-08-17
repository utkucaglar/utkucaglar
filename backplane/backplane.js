import { PORTS, getPort } from './ports.js';
import { createPortNavigator } from './state.js';

const root = document.documentElement;
const controls = [...document.querySelectorAll('[data-select-port]')];
const layers = [...document.querySelectorAll('[data-port-layer]')];
const routes = [...document.querySelectorAll('[data-port-route]')];
const activeId = document.querySelector('[data-active-id]');
const activeRole = document.querySelector('[data-active-role]');
const activeName = document.querySelector('[data-active-name]');
const activeSignals = document.querySelector('[data-active-signals]');
const activeLink = document.querySelector('[data-active-link]');

function render(port) {
  root.dataset.activePort = port.id;
  controls.forEach((control) => {
    control.setAttribute('aria-pressed', String(control.dataset.selectPort === port.id));
  });
  layers.forEach((layer) => {
    layer.classList.toggle('is-active', layer.dataset.portLayer === port.id);
  });
  routes.forEach((route) => {
    route.classList.toggle('is-active', route.dataset.portRoute === port.id);
  });
  activeId.textContent = port.id;
  activeRole.textContent = port.role;
  activeName.textContent = port.name;
  activeSignals.textContent = port.signals.join(' · ');
  activeLink.href = port.url;
}

const navigator = createPortNavigator({
  ports: PORTS,
  initialId: '01',
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  advanceMs: 5000,
  onChange: render,
});

controls.forEach((control) => {
  control.addEventListener('click', () => {
    navigator.select(control.dataset.selectPort, 'human');
  });
});

function isEditable(target) {
  if (!(target instanceof Element)) return false;
  return target.matches('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
}

document.addEventListener('keydown', (event) => {
  if (isEditable(event.target)) return;

  const focusedHotspot = event.target.closest?.('[data-select-port]');
  const isArrow = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
  if (isArrow && !focusedHotspot) return;

  const handled = navigator.handleKey(event.key, false);
  if (!handled) return;
  event.preventDefault();

  if (isArrow) {
    const selectedPort = getPort(navigator.selectedId);
    document.querySelector(`[data-select-port="${selectedPort.id}"]`)?.focus();
  }
});

navigator.start();
