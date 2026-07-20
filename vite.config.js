import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          helmet: ['react-helmet-async'],
        },
      },
    },
  },
  server: { port: 3000, open: true },
  preview: { allowedHosts: ['127.0.0.1', 'localhost'] },
});
