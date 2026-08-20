import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const httpsUrl = z.string().url().refine((value) => new URL(value).protocol === 'https:', {
  message: 'La URL debe usar https.',
});

const documents = z.array(z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  file: z.string().regex(/^\/uploads\/casos\/[a-z0-9]+(?:-[a-z0-9]+)*\/documentos\/[a-z0-9]+(?:-[a-z0-9]+)*\.pdf$/, 'El PDF debe estar dentro de la carpeta de documentos del caso.'),
  date: z.coerce.date(),
})).default([]);

const pressLinks = z.array(z.object({
  title: z.string().min(1),
  outlet: z.string().min(1),
  kind: z.enum(['Nota web', 'Facebook', 'Instagram']),
  url: httpsUrl,
})).default([]);

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    location: z.string().min(1),
    status: z.enum(['Recibido', 'Presentado', 'En seguimiento', 'Respondido', 'Resuelto']),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    image: z.string().regex(/^\/uploads\/casos\//).optional(),
    documents,
    pressLinks,
  }),
});

const novedades = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/novedades' }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    date: z.coerce.date(),
    case: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    image: z.string().regex(/^\/uploads\/novedades\//).optional(),
  }),
});

export const collections = { cases, novedades };
