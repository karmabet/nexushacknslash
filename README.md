# Nexus HacknSlash

Nexus HacknSlash is a browser based first person cyber shooter. The actual app entry is `index.html`, which loads `src/game.js`; `src/main.tsx` and the React app are an unused prototype.

## Run and build

```sh
npm install
npm run dev
```

Build for the repository's normal GitHub Pages path (`/nexushacknslash/`):

```sh
npm run build
```

For a portable build served from any path, including a local folder, use:

```sh
npm run build -- --base=./
```

The game scripts, icons, styles, and fonts are bundled or served from local project files. The built game does not need a CDN or network access to load those assets.

## Controls

- **PC default:** FPS pointer lock; click the start button and allow pointer lock.
- **Pointer lock unavailable:** the game falls back to free mouse mode. Hold the right mouse button and drag to look.
- **Move:** WASD or arrow keys.
- **Jump:** Space.
- **Fire:** hold the left mouse button (or the on-screen fire button on touch devices).
- **Pause/resume:** Escape pauses; use Resume Protocol to continue. Losing focus also pauses and clears held input.
- **Mobile/touch:** touch controls are selected automatically using touch capability, coarse-pointer, and mobile-device detection. Use the on-screen joystick to move, swipe the right side to look, and use the action buttons.
- **Mouse sensitivity:** adjust the sensitivity slider on the start/pause screen; the value is saved locally.

## Difficulty

The run starts with 7 enemies. Every 45 active seconds or 15 score points raises the threat tier (whichever is higher), adding two enemies per tier up to 19. Reinforcements enter at most once per three active seconds; speed and pursuit range rise moderately. Pauses do not advance difficulty. The HUD shows actual hostiles and the target count.
