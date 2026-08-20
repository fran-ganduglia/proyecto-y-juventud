import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { contentSlug, getNews } from '../lib/content';

export const GET: APIRoute = async ({ site }) => {
  const cases = await getCollection('cases');
  const news = await getNews();
  const urls = site ? [
    new URL('/', site).href,
    new URL('/casos/', site).href,
    new URL('/novedades/', site).href,
    ...cases.map((entry) => new URL(`/casos/${contentSlug(entry)}/`, site).href),
    ...news.map((entry) => new URL(`/novedades/${contentSlug(entry)}/`, site).href),
  ] : [];
  const entries = urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
