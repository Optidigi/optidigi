// @ts-check
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://optidigi.nl',
  adapter: node({ mode: 'standalone', bodySizeLimit: 32 * 1024 }),
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});
