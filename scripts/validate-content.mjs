import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { parse } from 'yaml';

const root = process.cwd();
const contentRoot = path.join(root, 'src/content');
const uploadRoot = path.join(root, 'public/uploads');
const maxBytes = 10 * 1024 * 1024;
const statuses = new Set(['Recibido', 'Presentado', 'En seguimiento', 'Respondido', 'Resuelto']);
const errors = [];

const fail = (message) => errors.push(message);
const isSlug = (value) => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const startsWithBytes = (value, bytes) => bytes.every((byte, index) => value[index] === byte);
const validDate = (value) => Boolean(value) && !Number.isNaN(new Date(value).getTime());

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(target) : [target];
  }));
  return files.flat();
}

async function readEntry(file) {
  const source = await readFile(file, 'utf8');
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    fail(`${path.relative(root, file)}: falta un frontmatter YAML válido.`);
    return { data: {}, body: '' };
  }
  try {
    return { data: parse(match[1]) ?? {}, body: match[2] };
  } catch (error) {
    fail(`${path.relative(root, file)}: YAML inválido (${error.message}).`);
    return { data: {}, body: '' };
  }
}

function containsUnsafeMarkup(value) {
  return /<\s*\/?\s*(?:[a-z]|!)/i.test(value) || /\]\s*\(\s*(?:javascript|data|vbscript):/i.test(value);
}

function inspectStrings(value, label) {
  if (typeof value === 'string' && containsUnsafeMarkup(value)) fail(`${label}: no se permite HTML, scripts ni enlaces con protocolos inseguros.`);
  if (Array.isArray(value)) value.forEach((item, index) => inspectStrings(item, `${label}[${index}]`));
  if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => inspectStrings(item, `${label}.${key}`));
}

function validHttps(value, label) {
  try {
    if (new URL(value).protocol !== 'https:') throw new Error();
  } catch {
    fail(`${label}: debe ser una URL https válida.`);
  }
}

async function validateAsset(publicPath, label, expected = undefined) {
  if (typeof publicPath !== 'string' || !publicPath.startsWith('/uploads/')) {
    fail(`${label}: debe referenciar un archivo dentro de /uploads/.`);
    return;
  }
  const file = path.resolve(root, `public${publicPath}`);
  if (!file.startsWith(`${uploadRoot}${path.sep}`)) {
    fail(`${label}: la ruta del archivo no es válida.`);
    return;
  }
  try {
    const info = await stat(file);
    if (info.size > maxBytes) fail(`${label}: supera el máximo de 10 MB.`);
    const buffer = await readFile(file);
    const extension = path.extname(file).toLowerCase();
    const type = extension === '.pdf' && buffer.subarray(0, 5).toString() === '%PDF-' ? 'pdf'
      : ['.jpg', '.jpeg'].includes(extension) && buffer[0] === 0xff && buffer[1] === 0xd8 ? 'image'
      : extension === '.png' && startsWithBytes(buffer, [137, 80, 78, 71, 13, 10, 26, 10]) ? 'image'
      : extension === '.webp' && buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP' ? 'image'
      : undefined;
    if (!type) fail(`${label}: solo se admiten PDF, JPG, PNG y WebP válidos.`);
    if (expected && type !== expected) fail(`${label}: debe ser un archivo ${expected === 'pdf' ? 'PDF' : 'de imagen'}.`);
  } catch {
    fail(`${label}: el archivo referenciado no existe.`);
  }
}

const caseFiles = await filesIn(path.join(contentRoot, 'cases'));
const newsFiles = await filesIn(path.join(contentRoot, 'novedades'));
const cases = [];
const news = [];

for (const file of caseFiles.filter((entry) => entry.endsWith('.md'))) {
  const slug = path.basename(file, '.md');
  const { data, body } = await readEntry(file);
  inspectStrings(data, path.relative(root, file));
  if (path.relative(path.join(contentRoot, 'cases'), file).includes(path.sep)) fail(`${path.relative(root, file)}: los casos no pueden estar anidados en carpetas.`);
  if (!isSlug(slug)) fail(`${path.relative(root, file)}: el nombre de archivo debe ser un slug estable en minúsculas.`);
  for (const field of ['title', 'summary', 'location']) if (!isText(data[field])) fail(`${path.relative(root, file)}: falta el campo obligatorio ${field}.`);
  if (!statuses.has(data.status)) fail(`${path.relative(root, file)}: estado no permitido.`);
  if (!validDate(data.publishedAt) || !validDate(data.updatedAt)) fail(`${path.relative(root, file)}: publishedAt y updatedAt deben ser fechas válidas.`);
  if (containsUnsafeMarkup(body)) fail(`${path.relative(root, file)}: el cuerpo contiene HTML, scripts o un enlace inseguro.`);
  if (data.image) await validateAsset(data.image, `${path.relative(root, file)}.image`, 'image');
  if (!Array.isArray(data.documents)) fail(`${path.relative(root, file)}: documents debe ser una lista.`);
  for (const [index, document] of (data.documents ?? []).entries()) {
    if (!isText(document?.title) || !isText(document?.summary) || !document?.date) fail(`${path.relative(root, file)}.documents[${index}]: faltan campos obligatorios.`);
    if (!document?.file?.startsWith(`/uploads/casos/${slug}/documentos/`)) fail(`${path.relative(root, file)}.documents[${index}]: el PDF debe quedar dentro del caso.`);
    await validateAsset(document?.file, `${path.relative(root, file)}.documents[${index}].file`, 'pdf');
  }
  if (!Array.isArray(data.pressLinks)) fail(`${path.relative(root, file)}: pressLinks debe ser una lista.`);
  for (const [index, link] of (data.pressLinks ?? []).entries()) {
    if (!isText(link?.title) || !isText(link?.outlet) || !['Nota web', 'Facebook', 'Instagram'].includes(link?.kind)) fail(`${path.relative(root, file)}.pressLinks[${index}]: enlace de prensa inválido.`);
    validHttps(link?.url, `${path.relative(root, file)}.pressLinks[${index}].url`);
  }
  cases.push(slug);
}

for (const file of newsFiles.filter((entry) => entry.endsWith('.md'))) {
  const slug = path.basename(file, '.md');
  const { data, body } = await readEntry(file);
  inspectStrings(data, path.relative(root, file));
  if (path.relative(path.join(contentRoot, 'novedades'), file).includes(path.sep)) fail(`${path.relative(root, file)}: las novedades no pueden estar anidadas en carpetas.`);
  if (!isSlug(slug)) fail(`${path.relative(root, file)}: el nombre de archivo debe ser un slug estable en minúsculas.`);
  for (const field of ['title', 'summary', 'case']) if (!data[field]) fail(`${path.relative(root, file)}: falta el campo obligatorio ${field}.`);
  if (!validDate(data.date)) fail(`${path.relative(root, file)}: date debe ser una fecha válida.`);
  if (!cases.includes(data.case)) fail(`${path.relative(root, file)}: el caso vinculado no existe.`);
  if (containsUnsafeMarkup(body)) fail(`${path.relative(root, file)}: el cuerpo contiene HTML, scripts o un enlace inseguro.`);
  if (data.image) {
    if (!data.image.startsWith(`/uploads/novedades/${slug}/`)) fail(`${path.relative(root, file)}.image: debe quedar dentro de la carpeta de la novedad.`);
    await validateAsset(data.image, `${path.relative(root, file)}.image`, 'image');
  }
  news.push(slug);
}

const uploadedFiles = await filesIn(uploadRoot);
for (const file of uploadedFiles) {
  const relative = path.relative(uploadRoot, file).replaceAll(path.sep, '/');
  if (!/^casos\/[a-z0-9]+(?:-[a-z0-9]+)*\/(?:documentos\/[a-z0-9]+(?:-[a-z0-9]+)*\.pdf|imagenes\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|jpeg|png|webp))$/.test(relative)
    && !/^novedades\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|jpeg|png|webp)$/.test(relative)) {
    fail(`public/uploads/${relative}: debe guardarse por tipo y slug, con un nombre seguro.`);
  }
  await validateAsset(`/uploads/${relative}`, `public/uploads/${relative}`);
}

if (new Set(cases).size !== cases.length) fail('Hay slugs de casos duplicados.');
if (new Set(news).size !== news.length) fail('Hay slugs de novedades duplicados.');
if (errors.length) {
  console.error(`Validación de contenido fallida:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Contenido validado: ${cases.length} caso(s) y ${newsFiles.length} novedad(es).`);
