// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://boardofdirectors.company',
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Performance budget: ≤150 KB gzip JS initial load
      rollupOptions: {
        output: {
          manualChunks: {
            gsap: ['gsap'],
          },
        },
      },
    },
  },
});
