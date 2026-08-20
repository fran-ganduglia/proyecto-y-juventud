import { getCollection } from 'astro:content';

export const formatDate = (date: Date) => new Intl.DateTimeFormat('es-AR', {
  day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(date);

export const contentSlug = (entry: { id: string }) => entry.id.replace(/\.md$/, '');

export async function getCases() {
  const cases = await getCollection('cases');
  return cases.sort((a, b) => b.data.updatedAt.getTime() - a.data.updatedAt.getTime());
}

export async function getNews() {
  if (!Object.keys(import.meta.glob('../content/novedades/*.md')).length) return [];
  try {
    const news = await getCollection('novedades');
    return news.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  } catch {
    // Astro no registra una colección de archivos aún vacía.
    return [];
  }
}
