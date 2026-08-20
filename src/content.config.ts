import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const httpsUrl = z.string().url().refine((value) => new URL(value).protocol === 'https:', {
  message: 'La URL debe usar https.',
});

const documents = z.array(z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  file: z.string().regex(/^\/uploads\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\.pdf|casos\/[a-z0-9]+(?:-[a-z0-9]+)*\/documentos\/[a-z0-9]+(?:-[a-z0-9]+)*\.pdf)$/, 'El PDF debe estar en /uploads/ con un nombre seguro.'),
  date: z.coerce.date(),
})).default([]);

const pressLinks = z.array(z.object({
  title: z.string().min(1),
  outlet: z.string().min(1),
  kind: z.enum(['Nota web', 'Facebook', 'Instagram']),
  url: httpsUrl,
})).default([]);

// Decap CMS conserva los campos de imagen opcionales como una cadena vacía o
// `null` cuando se elimina un archivo ya publicado. Astro debe tratarlos igual
// que un campo ausente, sin relajar la validación de rutas que sí existen.
const optionalImage = (pattern: RegExp) => z.preprocess(
  (value) => value === '' || value === null ? undefined : value,
  z.string().regex(pattern, 'La imagen debe estar en /uploads/ con un nombre seguro.').optional(),
);

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    location: z.string().min(1),
    status: z.enum(['Recibido', 'Presentado', 'En seguimiento', 'Respondido', 'Resuelto']),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    image: optionalImage(/^\/uploads\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|jpeg|png|webp)|casos\/[a-z0-9]+(?:-[a-z0-9]+)*\/imagenes\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|jpeg|png|webp))$/),
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
    image: optionalImage(/^\/uploads\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|jpeg|png|webp)|novedades\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|jpeg|png|webp))$/),
  }),
});

const home = defineCollection({
  loader: glob({ pattern: 'home.md', base: './src/content' }),
  schema: z.object({
    hero: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      highlight: z.string().min(1),
      description: z.string().min(1),
      primaryCta: z.string().min(1),
      secondaryCta: z.string().min(1),
    }),
    process: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      steps: z.array(z.object({
        title: z.string().min(1),
        description: z.string().min(1),
      })).length(3, 'El proceso debe tener exactamente tres pasos.'),
    }),
    featuredCases: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      intro: z.string().min(1),
      buttonLabel: z.string().min(1),
    }),
  }),
});

export const collections = { cases, novedades, home };
