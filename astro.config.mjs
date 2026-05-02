// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: import.meta.env.PUBLIC_SITE_URL ?? 'https://example.com',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [sitemap()]
});
