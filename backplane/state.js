export function createPortNavigator({
  ports,
  initialId,
  reducedMotion = false,
  advanceMs = 5000,
  onChange = () => {},
  schedule = setTimeout,
  cancel = clearTimeout,
}) {
  const initialPort = ports.find((port) => port.id === initialId) ?? ports[0];
  let selectedId = initialPort?.id;
  let interacted = false;
  let started = false;
  let timerId;

  const selectedPort = () => ports.find((port) => port.id === selectedId);
  const clearSchedule = () => {
    if (timerId !== undefined) {
      cancel(timerId);
      timerId = undefined;
    }
  };
  const scheduleAdvance = () => {
    if (reducedMotion || interacted || !started || timerId !== undefined) return;
    timerId = schedule(() => {
      timerId = undefined;
      next('machine');
    }, advanceMs);
  };
  const isHuman = (source) => source !== 'machine';

  const select = (id, source = 'human') => {
    const port = ports.find((candidate) => candidate.id === id);
    if (!port) return false;

    if (isHuman(source)) {
      interacted = true;
      clearSchedule();
    }
    selectedId = id;
    onChange(port);
    scheduleAdvance();
    return true;
  };
  const move = (offset, source = 'human') => {
    const index = ports.findIndex((port) => port.id === selectedId);
    if (index < 0 || ports.length === 0) return false;
    return select(ports[(index + offset + ports.length) % ports.length].id, source);
  };
  const next = (source = 'human') => move(1, source);
  const previous = (source = 'human') => move(-1, source);

  return {
    get selectedId() {
      return selectedId;
    },
    get interacted() {
      return interacted;
    },
    select,
    next,
    previous,
    handleKey(key, editable) {
      if (editable) return false;
      if (/^[1-6]$/.test(key)) return select(key.padStart(2, '0'), 'human');
      if (key === 'ArrowRight') return next('human');
      if (key === 'ArrowLeft') return previous('human');
      return false;
    },
    start() {
      if (started || !selectedPort()) return;
      started = true;
      onChange(selectedPort());
      scheduleAdvance();
    },
    stop() {
      clearSchedule();
      started = false;
    },
  };
}
