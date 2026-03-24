import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    fs: {
      allow: ['..'],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        sandbox: 'src/sandbox/index.html',
        roguelike: 'src/roguelike/index.html',
        design: 'src/design/index.html',
        'design-combinations': 'src/design/combinations.html',
        'design-counters': 'src/design/counters.html',
        'design-effects': 'src/design/effects.html',
        'design-effect-matrix': 'src/design/effect-matrix.html',
        'design-effect-combos': 'src/design/effect-combos.html',
        'design-schools': 'src/design/schools.html',
        'design-scientists': 'src/design/scientists.html',
        'design-equipment': 'src/design/equipment.html',
        'design-progression': 'src/design/progression.html',
        'design-roguelike-progression': 'src/design/roguelike-progression.html',
        'design-skill-tree': 'src/design/skill-tree.html',
        'design-skill-tree-3d': 'src/design/skill-tree-3d.html',
        'design-prototype': 'src/design/prototype.html',
      },
    },
  },
});
