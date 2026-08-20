import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const urls = site ? [new URL('/', site).href] : [];
  const entries = urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
