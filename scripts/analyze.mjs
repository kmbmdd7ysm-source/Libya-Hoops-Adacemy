import { build } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
await build({
  build: {
    rollupOptions: {
      plugins: [
        visualizer({
          filename: 'reports/bundle.html',
          template: 'treemap',
          gzipSize: true,
          brotliSize: true,
        }),
        visualizer({
          filename: 'reports/bundle-stats.json',
          template: 'raw-data',
          gzipSize: true,
          brotliSize: true,
        }),
      ],
    },
  },
});
console.log('Bundle reports written to reports/');
