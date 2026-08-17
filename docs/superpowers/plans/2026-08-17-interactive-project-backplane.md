# Interactive Project Backplane Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a six-port GitHub Pages experience with persistent component selection and replace the static README hero with a script-free animated preview that links to it.

**Architecture:** A dependency-free ES-module state engine owns the selected port and timing policy. A static HTML/CSS/SVG surface renders the canonical assembly image with six feathered masks and routes, while a deterministic Node generator embeds the same image and geometry into an animated README SVG. GitHub Actions publishes only `backplane/`.

**Tech Stack:** HTML5, CSS, browser ES modules, Node.js built-in test runner, generated SVG, GitHub Pages Actions

**Spec:** `docs/superpowers/specs/2026-08-17-interactive-project-backplane-design.md`

## Global Constraints

- No framework, analytics, database, remote font, build tool, or runtime dependency.
- README interaction must not depend on JavaScript, image maps, custom data attributes surviving GitHub sanitization, or inline SVG markup.
- The interactive URL is exactly `https://utkucaglar.github.io/utkucaglar/`.
- Exactly six ports exist, with repository identity and URLs matching `profile.config.json`.
- Selection changes light exposure only: no pulsing green halo and no decorative selection circle.
- Hotspot targets are at least 44 CSS pixels; mobile must remain usable at 390 CSS pixels.
- First human interaction stops auto-advance; reduced motion disables auto-advance and route motion.
- The six existing Modular Backplane cards remain direct repository links.

---

### Task 1: Port geometry and selection engine

**Files:**
- Create: `package.json`
- Create: `backplane/ports.js`
- Create: `backplane/state.js`
- Create: `tests/backplane-state.test.mjs`

**Interfaces:**
- Consumes: six canonical project records from `profile.config.json` (the test enforces parity).
- Produces: `PORTS`, `PORT_IDS`, `getPort(id)`, and `createPortNavigator(options)` for the page and preview generator.
- `createPortNavigator({ ports, initialId, reducedMotion, advanceMs, onChange, schedule, cancel })` returns `{ selectedId, interacted, select(id, source), next(source), previous(source), handleKey(key, editable), start(), stop() }`.

- [ ] **Step 1: Write the failing state and geometry tests**

  Add tests that name these breaks:

  ```js
  test('port geometry stays aligned with all six canonical repositories', async () => {
    const config = JSON.parse(await readFile(new URL('../profile.config.json', import.meta.url)));
    assert.deepEqual(PORTS.map(({ id, role, name, signals, url }) => ({ id, role, name, signals, url })), config.ports);
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
  ```

- [ ] **Step 2: Run the test and verify RED**

  Run: `node --test tests/backplane-state.test.mjs`

  Expected: FAIL because `backplane/ports.js` and `backplane/state.js` do not exist.

- [ ] **Step 3: Implement the canonical port geometry**

  `backplane/ports.js` exports literal records with these geometry values and the exact config identity fields:

  ```js
  export const PORTS = [
    { id: '01', role: 'PLATFORM BOARD', name: 'NFC_LINK', signals: ['TYPESCRIPT', 'REACT', 'SUPABASE'], url: 'https://github.com/utkucaglar/NFC_Link', hotspot: { x: 24.2, y: 8.3 }, label: { cx: 470, cy: 70, r: 58 }, maskPath: 'M45 145 L230 45 L410 85 L490 170 L470 270 L245 340 L45 255 Z', routePath: 'M1000 430 C800 350 600 250 280 210' },
    { id: '02', role: 'COMPUTE ASSEMBLY', name: 'CS445_PROJECT', signals: ['NLP', 'REGRESSION', 'BERT'], url: 'https://github.com/utkucaglar/CS445-Project', hotspot: { x: 68.1, y: 10.8 }, label: { cx: 1325, cy: 90, r: 58 }, maskPath: 'M530 40 L1220 10 L1260 300 L1215 515 L1060 710 L705 700 L545 520 Z', routePath: 'M1000 430 C1090 350 1130 260 1070 190' },
    { id: '03', role: 'PROTOCOL DRIVE', name: 'YOK_AKADEMIK_MCP', signals: ['MCP', 'SSE', 'AUTOMATION'], url: 'https://github.com/utkucaglar/YOK_Akademik_MCP', hotspot: { x: 21.5, y: 72.2 }, label: { cx: 420, cy: 575, r: 58 }, maskPath: 'M75 590 L315 540 L415 635 L365 718 L135 728 L75 670 Z', routePath: 'M1000 430 C750 520 540 620 270 650' },
    { id: '04', role: 'COMMERCE MEMORY', name: 'PIXELVAULT', signals: ['NEXT.JS', 'POSTGRES', 'N8N'], url: 'https://github.com/utkucaglar/cs308-team9-ecommerce-app', hotspot: { x: 4.5, y: 43.7 }, label: { cx: 82, cy: 353, r: 58 }, maskPath: 'M80 380 L330 350 L425 425 L395 505 L135 535 L75 480 Z', routePath: 'M1000 430 C680 430 480 440 250 445' },
    { id: '05', role: 'DIGITAL I/O', name: 'BATTLESHIP_FPGA', signals: ['VERILOG', 'FPGA', 'REALTIME'], url: 'https://github.com/utkucaglar/Battle_Ship_Game_FPGA', hotspot: { x: 78.4, y: 55.1 }, label: { cx: 1520, cy: 450, r: 58 }, maskPath: 'M1480 460 L1710 395 L1870 485 L1875 700 L1720 755 L1500 650 Z', routePath: 'M1000 430 C1250 460 1450 540 1680 575' },
    { id: '06', role: 'PROCESS TREE', name: 'TREEPIPE_PROJECT', signals: ['C', 'FORK', 'EXECVP', 'PIPES'], url: 'https://github.com/utkucaglar/TreePipe-Project', hotspot: { x: 95.6, y: 10.5 }, label: { cx: 1850, cy: 95, r: 58 }, maskPath: 'M1440 80 L1830 45 L1900 140 L1860 330 L1620 360 L1430 245 Z', routePath: 'M1000 430 C1250 380 1490 250 1660 180' },
  ];
  export const PORT_IDS = PORTS.map(({ id }) => id);
  export const getPort = (id) => PORTS.find((port) => port.id === id);
  ```

- [ ] **Step 4: Implement the state engine and package metadata**

  Add `package.json` with `"type": "module"` and `"test": "node --test"`. Implement `createPortNavigator` so invalid IDs are rejected without state mutation, initial state is emitted once by `start()`, machine advances reschedule while human input cancels scheduling permanently, numbers map directly, arrows wrap, and reduced motion never schedules.

- [ ] **Step 5: Run the focused and full suites**

  Run: `node --test tests/backplane-state.test.mjs`

  Expected: PASS.

  Run: `node --test`

  Expected: all tests PASS with no warnings.

- [ ] **Step 6: Commit**

  ```bash
  git add package.json backplane/ports.js backplane/state.js tests/backplane-state.test.mjs
  git commit -m "feat: model six-port backplane state"
  ```

---

### Task 2: Interactive patent-assembly page

**Files:**
- Create: `backplane/index.html`
- Create: `backplane/backplane.css`
- Create: `backplane/backplane.js`
- Create: `backplane/assets/assembly.webp`
- Create: `tests/backplane-page.test.mjs`

**Interfaces:**
- Consumes: `PORTS`, `getPort`, and `createPortNavigator` from Task 1.
- Produces: a deployable static document whose active state is exposed as `document.documentElement.dataset.activePort` and whose controls use `[data-select-port]`, layers use `[data-port-layer]`, routes use `[data-port-route]`, and detail fields use `[data-active-*]`.

- [ ] **Step 1: Write the failing page contract test**

  The test reads the actual HTML and assets, validates six unique semantic buttons and six layer/route targets, verifies the copied WebP byte-for-byte against the canonical hero, and checks that the page references only local CSS/JS/image resources. It must fail if a hotspot loses its accessible name, if the explicit repository link is absent, or if the mobile viewport declaration is removed.

  ```js
  test('interactive page exposes six accessible ports and a repository action', async () => {
    const html = await readFile(new URL('../backplane/index.html', import.meta.url), 'utf8');
    assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
    assert.equal((html.match(/data-select-port="\d{2}"/g) ?? []).length, 6);
    assert.equal((html.match(/aria-label="Select port \d{2}:/g) ?? []).length, 6);
    assert.equal((html.match(/data-port-layer="\d{2}"/g) ?? []).length, 6);
    assert.equal((html.match(/data-port-route="\d{2}"/g) ?? []).length, 6);
    assert.match(html, /data-active-link[^>]+OPEN REPOSITORY/);
    assert.doesNotMatch(html, /https?:\/\/(?!www\.w3\.org\/2000\/svg)/);
  });
  ```

- [ ] **Step 2: Run the test and verify RED**

  Run: `node --test tests/backplane-page.test.mjs`

  Expected: FAIL because `backplane/index.html` and the page assets do not exist.

- [ ] **Step 3: Build the semantic SVG stage**

  Create a `1942 809` SVG viewBox above an instrument strip. Render the dimmed canonical image once, then render six duplicate image layers masked by each port's `maskPath` plus `label` circle. Add one path per `routePath`. Place six real `<button type="button">` controls over the printed labels using `hotspot.x/y`; their visual child is only a small `PORT_XX` focus readout that stays transparent until keyboard focus.

  The initial active port is 01. The panel labels are `ACTIVE POWER DOMAIN`, role, repository name, signal list, and an explicit `OPEN REPOSITORY ↗` link.

- [ ] **Step 4: Implement the visual system**

  Use the six spec tokens as CSS custom properties. The base assembly uses `brightness(.42) saturate(.72) contrast(1.04)`. Inactive masked layers have opacity 0; the active masked layer uses opacity 1 with `brightness(1.22) saturate(1.12)` and a restrained `drop-shadow(0 0 10px rgba(117,255,155,.24))`. Layer transitions use 360ms opacity; routes use a single 900ms dash animation when active. No `animation` may target the selected layer itself.

  At `max-width: 640px`, stack the instrument strip, preserve the complete SVG, keep every hotspot at `min-width/min-height: 44px`, and allow the repository name to wrap. At reduced motion, set route and layer transition durations to 1ms and disable route animation.

- [ ] **Step 5: Wire interaction to the state engine**

  `backplane/backplane.js` must:

  ```js
  const navigator = createPortNavigator({
    ports: PORTS,
    initialId: '01',
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    advanceMs: 5000,
    onChange: render,
  });
  ```

  `render(port)` updates the root dataset, `aria-pressed`, layer/route `.is-active`, the role/name/signals text, link `href`, and the visible port number. Clicks call `select(id, 'human')`. `keydown` ignores `input`, `textarea`, `select`, and `contenteditable`; numbers delegate to `handleKey`, while focused hotspot arrows move focus to the newly selected hotspot. Start the navigator exactly once.

- [ ] **Step 6: Run tests and perform the first browser smoke check**

  Run: `node --test tests/backplane-state.test.mjs tests/backplane-page.test.mjs`

  Expected: PASS.

  Serve the repository root and verify port 01 is initially active, clicking 04 sets the root dataset to `04`, key `6` sets it to `06`, the detail link changes to TreePipe, and no console errors occur.

- [ ] **Step 7: Commit**

  ```bash
  git add backplane/index.html backplane/backplane.css backplane/backplane.js backplane/assets/assembly.webp tests/backplane-page.test.mjs
  git commit -m "feat: build interactive project backplane"
  ```

---

### Task 3: Animated README preview and hero link

**Files:**
- Create: `scripts/generate-backplane-preview.mjs`
- Create: `assets/project-backplane-cycle.svg`
- Create: `tests/backplane-preview.test.mjs`
- Modify: `profile.config.json`
- Modify: `scripts/generate-readme.mjs`
- Modify: `tests/hero-asset.test.mjs`
- Modify: `tests/readme.test.mjs`
- Modify: `README.md`

**Interfaces:**
- Consumes: `PORTS` geometry, canonical WebP, and the exact interactive URL.
- Produces: deterministic `assets/project-backplane-cycle.svg`; `config.hero.file` points at it while `config.hero.sourceFile` retains the WebP; README wraps that asset in `config.interactive.url`.

- [ ] **Step 1: Write failing generator and README behavior tests**

  Assert these observable contracts:

  ```js
  test('animated preview embeds one dim base and six feathered focus states', async () => {
    const svg = await readFile(new URL('../assets/project-backplane-cycle.svg', import.meta.url), 'utf8');
    assert.match(svg, /viewBox="0 0 1942 809"/);
    assert.equal((svg.match(/data-focus-port="\d{2}"/g) ?? []).length, 6);
    assert.equal((svg.match(/data-route-port="\d{2}"/g) ?? []).length, 6);
    assert.equal((svg.match(/repeatCount="indefinite"/g) ?? []).length, 12);
    assert.match(svg, /prefers-reduced-motion: reduce/);
    assert.doesNotMatch(svg, /<script|@import|https?:\/\//i);
  });

  test('README hero opens the interactive backplane', async () => {
    const config = JSON.parse(await readFile(new URL('../profile.config.json', import.meta.url)));
    const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
    assert.match(readme, new RegExp(`<a href="${config.interactive.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">\\s*<img width="100%" src="\\./${config.hero.file}`));
    assert.equal(config.hero.file, 'assets/project-backplane-cycle.svg');
    assert.equal(config.hero.sourceFile, 'assets/patent-assembly-greenprint-v2-six-port.webp');
  });
  ```

- [ ] **Step 2: Run the focused tests and verify RED**

  Run: `node --test tests/backplane-preview.test.mjs tests/readme.test.mjs tests/hero-asset.test.mjs`

  Expected: FAIL because the preview and interactive config do not exist.

- [ ] **Step 3: Implement the deterministic preview generator**

  Read the canonical WebP, embed it as one base64 data URI, and emit one dim base image plus six masked copies using the exact Task 1 geometry. Each mask contains the component path and printed-number circle, both feathered with `feGaussianBlur stdDeviation="16"`.

  Give each focus layer and route a 30-second SMIL opacity animation with literal `keyTimes` so only one port is active during each five-second segment. Route paths also animate `stroke-dashoffset` inside their active segment. Include a CSS reduced-motion rule that hides all animated focus/route layers except port 01 and disables their animations. Do not include links, script, or remote resources inside the SVG.

- [ ] **Step 4: Update config and generate the README**

  Add:

  ```json
  "interactive": {
    "url": "https://utkucaglar.github.io/utkucaglar/",
    "label": "OPEN INTERACTIVE PROJECT BACKPLANE"
  }
  ```

  Change `hero.file` to `assets/project-backplane-cycle.svg`, retain the WebP as `hero.sourceFile`, and change the alt text to describe the automatic six-port focus sequence and the linked interactive experience. Update the README generator to wrap only the hero in the interactive anchor.

  Run:

  ```bash
  node scripts/generate-backplane-preview.mjs
  node scripts/generate-readme.mjs
  ```

- [ ] **Step 5: Run determinism and full-suite verification**

  Hash both generated files, run both generators again, and assert the hashes are unchanged. Then run `node --test` and `git diff --check`; all must pass.

- [ ] **Step 6: Commit**

  ```bash
  git add scripts/generate-backplane-preview.mjs assets/project-backplane-cycle.svg profile.config.json scripts/generate-readme.mjs README.md tests/backplane-preview.test.mjs tests/hero-asset.test.mjs tests/readme.test.mjs
  git commit -m "feat: animate the profile backplane gateway"
  ```

---

### Task 4: Pages deployment contract and release verification

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Create: `backplane/.nojekyll`
- Create: `tests/pages-deployment.test.mjs`

**Interfaces:**
- Consumes: self-contained `backplane/` from Task 2.
- Produces: a GitHub Pages workflow that uploads only `backplane/` and deploys on pushes to `main`.

- [ ] **Step 1: Write the failing deployment-scope test**

  The test reads the workflow as configuration and catches broad artifact publication or incorrect branch/event permissions:

  ```js
  test('Pages workflow publishes only the backplane directory from main', async () => {
    const workflow = await readFile(new URL('../.github/workflows/deploy-pages.yml', import.meta.url), 'utf8');
    assert.match(workflow, /branches:\s*\[main\]/);
    assert.match(workflow, /pages:\s*write/);
    assert.match(workflow, /id-token:\s*write/);
    assert.match(workflow, /actions\/upload-pages-artifact@v3[\s\S]+path:\s*backplane/);
    assert.doesNotMatch(workflow, /path:\s*[.'"]+\s*$/m);
    assert.match(workflow, /actions\/deploy-pages@v4/);
  });
  ```

- [ ] **Step 2: Run the test and verify RED**

  Run: `node --test tests/pages-deployment.test.mjs`

  Expected: FAIL because the workflow does not exist.

- [ ] **Step 3: Implement the least-privilege Pages workflow**

  The workflow runs on `push` to `main` and manual dispatch, grants `contents: read`, `pages: write`, and `id-token: write`, uses concurrency group `pages`, configures Pages, uploads exactly `backplane`, and deploys through the `github-pages` environment.

- [ ] **Step 4: Run the complete local gate**

  Run: `node --test`

  Expected: all tests PASS.

  Run generators twice and compare hashes, run `git diff --check`, verify `git status --short` contains only the task files before commit, and inspect that no external resources were introduced.

- [ ] **Step 5: Perform desktop, mobile, keyboard, and reduced-motion browser QA**

  Verify at desktop and 390 CSS pixels:

  - the complete image remains visible;
  - selection 01–06 produces visibly distinct local illumination;
  - non-selected regions stay dim;
  - there is no selection ring or pulsing layer glow;
  - click, tap-equivalent click, number keys, and focused arrow keys update the same state;
  - repository hrefs exactly match config;
  - first human input freezes auto-advance;
  - reduced motion disables auto-advance and moving route packets;
  - focus indicators and 44-pixel targets remain usable;
  - console is clean.

- [ ] **Step 6: Commit**

  ```bash
  git add .github/workflows/deploy-pages.yml backplane/.nojekyll tests/pages-deployment.test.mjs
  git commit -m "ci: deploy the interactive backplane to Pages"
  ```

- [ ] **Step 7: Stop before external publication**

  Prepare the exact merge/push and Pages-enablement commands plus expected live URL, but do not merge, push, or change repository settings inside the task. The controller performs publication only after the complete review gate.
