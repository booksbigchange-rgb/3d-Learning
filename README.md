# PC Hardware Atlas — Phase 1

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
- On phones, the index scrolls horizontally and details follow the scene.
- If WebGL cannot start, the component guide remains usable.

## Scope and reference

Inspired by the technical exploration pattern of [Ashe's Human Atlas](https://github.com/ashemag/human-atlas): a central 3D object, orbit controls, selection and concise contextual information. No source code, models or branding from that project were copied.

This is a simplified educational layout, not an exact commercial PC, assembly instruction or compatibility checker. The side panel is intentionally absent and component proportions are illustrative. The CPU package sits under its cooler and is selected as one hardware group. There is no exploded view, search, compatibility simulation, live telemetry or photorealistic asset pipeline in Phase 1.

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the complete phased development plan.
