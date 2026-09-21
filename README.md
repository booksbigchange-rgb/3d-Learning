# PC Hardware Atlas — Phase 2

An original interactive technical guide to the inside of a generic desktop computer. A procedural Three.js cutaway shows the chassis, motherboard, CPU/cooler, RAM, GPU, M.2 storage, PSU and case fans.

## Run locally

Requires Node.js 22.15+ and npm. From this folder:

```powershell
npm ci
npm run dev
```

Open the local URL printed by Vite. Do not open index.html directly. Dependencies are installed locally; the app makes no CDN or asset requests at runtime.

```powershell
npm run check
npm run build
npm run preview
```

The production bundle is generated in `dist/`.

## Explore

- Drag the model to orbit; scroll or pinch to zoom.
- Zoom buttons and Reset view provide explicit camera controls.
- Click a visible part or choose a component in the keyboard-accessible index.
- Selection highlights only that hardware group and shows its function and connections.
- Explode separates components along curated paths; Assemble returns every part exactly to its original position.
- Isolate shows only the selected component. Switching selection updates the isolated part, and leaving isolate restores earlier visibility choices.
- Use each eye control to hide or show a component, or Show all to restore the complete system.
- Focus frames the selected part from the current viewing direction using its actual 3D bounds.
- Anchored labels follow the model while orbiting. On phones, only the selected label is shown to preserve space.
- With the 3D canvas focused, use `E` for explode, `I` for isolate, `F` for focus, `Esc` to leave isolate, and `+` / `-` to zoom.
- On phones, the component index scrolls horizontally and details follow the scene.
- If WebGL cannot start, the component guide remains usable.

## Scope and reference

Inspired by the technical exploration pattern of [Ashe's Human Atlas](https://github.com/ashemag/human-atlas): a central 3D object, orbit controls, selection and concise contextual information. No source code, models or branding from that project were copied.

This is a simplified educational layout, not an exact commercial PC, assembly instruction or compatibility checker. The side panel is intentionally absent and component proportions are illustrative. The CPU package sits under its cooler and is selected as one hardware group. Search, compatibility simulation, live telemetry and a photorealistic asset pipeline remain outside Phase 2.

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the complete phased development plan.
