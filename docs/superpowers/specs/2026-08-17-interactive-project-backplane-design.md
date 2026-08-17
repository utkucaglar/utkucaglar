# Interactive Project Backplane Design

## Purpose

Turn the profile's static patent-assembly hero into a credible gateway to six repositories without pretending GitHub README markup can hold interactive state. The README supplies an autonomous visual preview; a dedicated GitHub Pages experience supplies the real click and keyboard interaction.

## Platform boundary

GitHub strips custom state attributes from rendered README HTML, does not run repository JavaScript in a README, and renders the current hero as one linked image. Therefore selection state must not depend on README DOM, JavaScript, image maps, or inline SVG markup.

The solution has two surfaces:

1. **README preview:** a self-contained animated SVG asset cycles through ports 01–06. During each state, the selected component returns to full exposure with a restrained phosphor lift while the rest of the assembly remains dim. A routed data trace moves toward the selected component. The entire preview is one link to the interactive page.
2. **Interactive backplane:** a static GitHub Pages site owns persistent selection, direct component hotspots, keyboard controls, repository details, and outbound repository links.

## Visual direction

The subject is an engineer's project graph expressed as a patent drawing of a computer assembly. Its single job is to make repository discovery feel like inspecting a real system rather than reading a portfolio grid.

### Tokens

- `carbon`: `#020805` — page and unpowered hardware field
- `board`: `#06160d` — panel surface
- `phosphor`: `#75ff9b` — selected signal and focus indication
- `trace`: `#39d86f` — routes, dividers, and active circuitry
- `paper`: `#e6e2bd` — technical labels and drawing lines
- `muted`: `#718879` — secondary instrumentation

Typography uses the system monospace stack for technical labels and a narrow system sans-serif stack for the active repository name. No remote font dependency is required. The existing drawing remains the hero thesis; surrounding chrome stays quiet and square-edged.

### Signature interaction

The memorable gesture is a **power-domain handoff**. Selecting a numbered component reduces the rest of the assembly to standby exposure, restores only the component's clipped region, and sends a short packet route from the graphics-card core to it. It uses light as information, not a pulsing decorative halo.

## Interactive experience

The stage keeps the original drawing's aspect ratio. Six semantic buttons sit over the printed 01–06 markers and their associated components. Each button has a generous invisible hit area but no decorative circle beyond the number already present in the drawing.

On selection:

- exactly one port becomes active;
- the base drawing remains visible at reduced brightness;
- only the selected component is restored through an SVG clip path and receives a narrow phosphor exposure lift;
- the previous highlight fades out while the new highlight fades in;
- the data route redraws toward the new component;
- the adjacent instrument panel updates role, repository name, technologies, and repository URL;
- focus remains on the activating control.

Inputs:

- click or tap a numbered hotspot;
- press `1`–`6` anywhere outside editable controls;
- use left/right arrows while a hotspot is focused;
- activate the explicit `OPEN REPOSITORY` link to navigate.

The page auto-advances every five seconds only until the visitor first interacts. After interaction, the chosen port stays selected. Under `prefers-reduced-motion: reduce`, auto-advance and route motion are disabled, transitions are near-instant, and port 01 is the initial stable state.

## Responsive layout

Desktop uses a wide drawing stage with a slim instrument strip beneath it. The repository name and signal list occupy the left side; the outbound action occupies the right side. Mobile preserves the full drawing rather than cropping it, keeps hotspot targets at least 44 CSS pixels, and stacks the instrument strip beneath the stage. Repository text must remain readable at 390 CSS pixels.

## README integration

`profile.config.json` gains the public Pages URL and the animated preview asset path. `scripts/generate-readme.mjs` wraps the hero image in that URL and emits concise alternative text that explains it is an animated six-port preview. The six compact Modular Backplane cards remain direct repository links and keep their 2×3 desktop / single-column mobile behavior.

The animated preview is generated deterministically from the base WebP and the same six region definitions used by the interactive page. It contains no script or external resources. Its animation loops through 01–06 without rapid flashing, and the frame/state timing leaves each selection readable.

## File boundaries

- `backplane/index.html` — semantic page shell, stage controls, and instrument panel
- `backplane/backplane.css` — responsive visual system, selected/dim states, focus, and reduced motion
- `backplane/backplane.js` — selection state, keyboard input, auto-advance, and panel updates
- `backplane/ports.js` — the six port records plus hotspot and clip-path geometry
- `backplane/assets/assembly.webp` — copy of the canonical drawing used by the deployed page
- `assets/project-backplane-cycle.svg` — script-free animated README preview
- `scripts/generate-backplane-preview.mjs` — deterministic preview generator using canonical config/geometry
- `scripts/generate-readme.mjs` — hero link and preview source
- `.github/workflows/deploy-pages.yml` — static GitHub Pages deployment for `backplane/`
- tests verify config integrity, README linking, SVG animation states, page semantics, keyboard/state behavior, reduced-motion hooks, and deployment configuration.

## Deployment

The repository remains the single source of truth. A GitHub Pages workflow deploys only `backplane/`, so planning documents and generator sources are not exposed as site content. The expected public URL is `https://utkucaglar.github.io/utkucaglar/`.

Publishing is complete only when:

- the local test suite passes;
- the interactive page passes desktop and 390-pixel mobile browser checks;
- every port selects independently and every repository URL is correct;
- the README preview animates on the live GitHub profile;
- clicking the live hero opens the Pages experience;
- the Pages deployment completes and its live DOM matches the tested build;
- local `HEAD`, `origin/main`, and the deployed revision agree.

## Non-goals

- No claim that GitHub README clicks can hold selection state.
- No embedded iframe, JavaScript, or HTML image-map workaround inside GitHub.
- No duplication of the portfolio site's narrative copy or visual layout.
- No analytics, database, framework, build tool, or runtime dependency.
- No automatic navigation to a repository when a port is merely selected.
