import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: "https://optidigi.nl",
  output: 'static',
  server: {
    allowedHosts: ["2.optidigi.nl"],
  },
});
