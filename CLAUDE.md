# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # Vite dev server (http://localhost:5173)
npm run build     # production build into dist/
npm run preview   # serve the built dist/
npm run lint      # ESLint over the repo (dist/ is ignored)
```

There is no test suite in this project — no test runner or test files are configured.

`dist/` is **committed to git** (it is not in `.gitignore`) and is used to deploy the live demo, so a change to `src/` usually needs `npm run build` plus committing the regenerated `dist/` output. Vite `base` is `/`.

## Architecture

Single-page React 19 + Vite app rendering a 6-axis robotic arm with React Three Fiber. All app state lives in `src/App.jsx`; there is no router, store, or backend.

**Mode switch is a component swap.** `App.jsx` holds `mode` (`'IK'` | `'FK'`) and two independent target arrays, and renders *either* `RobotArmIKCCD` *or* `RobotArmCustom` inside a single `<Canvas>`. The two components never coexist, but both call `useGLTF('models/arm.glb')`, so they share the same cached GLTF scene graph — bone rotations left behind by one mode persist into the other, and each mount imperatively `scene.add()`s a new green target sphere that is never removed on unmount.

**The rig comes from Blender and drives everything.** `public/models/arm.glb` contains a bone chain named in Spanish: `Hueso1` → `Hueso2` → … → `Hueso6` nested parent-to-child (each found via `current.children.find(...)`, not a flat lookup), plus `Hueso007` / `Hueso008` for the two gripper claws and `HuesoIK` as an IK helper. Renaming or reparenting bones in the .glb breaks both arm components. Per-joint rotation axes are hardcoded in each component and must stay in sync: `y, x, x, y, x, y` for `Hueso1..Hueso6`.

- `src/components/RobotArmCustom.jsx` (FK) — `useFrame` writes `target[i]` directly into `bone.rotation[axis]` for the 6 joints; `target[6]` opens/closes the claws with mirrored `rotation.z`.
- `src/components/RobotArmIKCCD.jsx` (IK) — CCD solver, 6 iterations per frame, rotating each joint about a **global** axis via `rotateOnWorldAxis` and then clamping the corresponding local Euler component against `jointLimits`. The green sphere is both the visual marker and the solver's target object. Note this component renders `<primitive ... scale={0.75} />` while the FK one does not, so world units differ between modes.

**Slider ranges are inferred from array length, not passed in.** `src/components/inputSlider.jsx` uses `-100..100` when the target array has exactly 3 entries (IK world coordinates) and `-π..π` otherwise (FK joint angles in radians). Adding a 4th IK axis or changing the FK joint count silently changes the slider range. `ControlPanel.jsx` picks which target/axis-label pair to feed it based on `mode`.

Comments and some identifiers are in Spanish; match the surrounding language when editing a file. Styling is Tailwind v4 via the `@tailwindcss/vite` plugin — `src/index.css` is just `@import "tailwindcss"`, with no config file.
