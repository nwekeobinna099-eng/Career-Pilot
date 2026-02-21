---
name: spline
description: Use when integrating interactive 3D designs from Spline into web applications, handling scene loading, and interactive events.
---

# Spline 3D Integration

## Overview
Spline is a 3D design tool that allows for real-time collaboration and the creation of interactive 3D web experiences. This skill provides the patterns for integrating Spline scenes into React/Next.js and Vanilla JS projects.

## When to Apply
Reference this skill when:
- Adding 3D elements (heroes, interactive objects) to a website.
- Implementing `@splinetool/react-spline` or `@splinetool/runtime`.
- Handling events between the 3D scene and the UI.
- Optimizing 3D performance and loading states.

## Core Pattern (React/Next.js)

### 1. Installation
Install the necessary packages:
```bash
npm install @splinetool/react-spline @splinetool/runtime
```

### 2. Basic Implementation
```tsx
import Spline from '@splinetool/react-spline';

export default function App() {
  return (
    <main>
      <Spline scene="https://prod.spline.design/your-scene-id/scene.splinecode" />
    </main>
  );
}
```

### 3. Next.js Client Component (Recommended)
Since Spline uses browser APIs, ensure it runs on the client:
```tsx
'use client';

import Spline from '@splinetool/react-spline';

export default function SplineScene() {
  return (
    <div className="w-full h-[500px]">
      <Spline scene="https://prod.spline.design/your-scene-id/scene.splinecode" />
    </div>
  );
}
```

### 4. Event Handling & Runtime API
```tsx
import { Application } from '@splinetool/runtime';

function onLoad(splineApp: Application) {
  // Access specific objects by name
  const obj = splineApp.findObjectByName('Cube');
  // Trigger events
  splineApp.emitEvent('onStart', 'Cube');
}

<Spline 
  scene="..."
  onLoad={onLoad}
/>
```

## Quick Reference

| Prop / Method | Description |
|---------------|-------------|
| `scene` | URL to the .splinecode file (exported from Spline app) |
| `onLoad` | Callback function receiving the `Application` instance |
| `onMouseDown` | Event triggered when an object is clicked |
| `onSplineEvent`| General event listener for custom Spline events |

## Common Mistakes
- **Heavy Scenes**: Oversized scenes causing slow loads. Use texture compression and simplify geometry in Spline.
- **SSR Errors**: Loading Spline on the server in Next.js. Use `'use client'` or `next/dynamic`.
- **Z-Index Issues**: 3D scenes can sometimes overlay UI. Ensure proper CSS stacking context.
