import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL?.replace(/\/$/, '');

export default defineConfig({
  output: 'static',
  // Set SITE_URL to the single, public production URL (including https://).
  // Astro uses it to create canonical URLs and the sitemap.
  ...(site ? { site } : {}),
});
