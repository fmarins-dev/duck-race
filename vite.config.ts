import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'docs',
  },
  server: {
    open: true,
    watch: {
      usePolling: true,
    },
  },
});
