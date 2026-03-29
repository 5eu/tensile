# Tensile — Interactive Cloth Physics Lab

A real-time cloth physics simulator built with **Verlet Integration** and **Gauss-Seidel relaxation**. Drag, tear, and experiment with different fabric materials in the browser.

## Features

- 🧵 **5 Materials**: Silk, Canvas, Denim, Rubber, Chain — each with unique physics properties
- ✂️ **Tear Mode**: Cut through fabric with mouse/touch
- 💨 **Wind Simulation**: Oscillating wind field
- 🔥 **Stress Visualization**: See tension distribution in real-time
- 📌 **Pin System**: Every other top point pinned, copper pin rendering
- 📊 **Stats HUD**: FPS, point count, constraint count, broken count
- ⌨️ **Keyboard Shortcuts**: T (tear), Space (pause), R (reset), W (wind)
- 📱 **Touch Support**: Full touch interaction for mobile

## Tech Stack

- React 19 + TypeScript + Vite
- Custom Verlet Integration engine (no physics library)
- Canvas 2D multi-layer rendering with DPR adaptation
- Zustand state management
- Framer Motion UI animations

## Physics

- **Verlet Integration**: Position-based dynamics, implicit velocity
- **Gauss-Seidel Relaxation**: 5-12 constraint iterations per frame
- **Cross-bracing**: Diagonal constraints for shear resistance
- **Material Presets**: Gravity, damping, stiffness, tear threshold, iterations

## TODO

- [ ] Pin/unpin individual points on click
- [ ] PNG export of cloth state
- [ ] Color gradient based on velocity
- [ ] Multiple cloth instances
- [ ] Collision with obstacles
- [ ] WebGL renderer for larger grids

## Preview

🌐 https://preview.b0th.com
