// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

import react from '@astrojs/react';
// import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  // Halaman tetap statis (prerender default); adapter Node diperlukan agar
  // route API di src/pages/api/ (prerender = false) dilayani server.
  // adapter: node({ mode: 'standalone' }),
  adapter: netlify(),

  // API contoh ini sengaja bisa dicoba dari curl/Postman (tanpa header Origin).
  security: { checkOrigin: false },

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()]
});
