import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL?.replace(/\/$/, '') || 'https://ongopj.com.ar';

export default defineConfig({
  output: 'static',
  // Override SITE_URL only when the public canonical domain changes.
  site,
});
