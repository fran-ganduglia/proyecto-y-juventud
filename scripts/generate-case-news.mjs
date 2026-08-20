import { execFileSync } from 'node:child_process';
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { parse, stringify } from 'yaml';

const root = process.cwd();
const casesDirectory = 'src/content/cases';
const newsDirectory = path.join(root, 'src/content/novedades');
const [beforeInput, after, mode] = process.argv.slice(2);
const dryRun = mode === '--dry-run';

if (!beforeInput || !after) {
  throw new Error('Uso: node scripts/generate-case-news.mjs <commit-anterior> <commit-actual> [--dry-run]');
}

function git(args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function contentAt(commit, file) {
  return git(['show', `${commit}:${file}`]);
}

function readFrontmatter(source, label) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) throw new Error(`${label}: falta un frontmatter YAML válido.`);
  return { data: parse(match[1]) ?? {}, body: match[2].trim() };
}

function changedCaseFiles(before, afterCommit) {
  const base = /^0+$/.test(before) ? `${afterCommit}^` : before;
  const output = git(['diff', '--name-status', '--diff-filter=AM', base, afterCommit, '--', `${casesDirectory}/`]);
  if (!output) return [];
  return output.split('\n').map((line) => line.split('\t')[1]).filter(Boolean);
}

function keyForPress(link) {
  return [link?.kind, link?.outlet, link?.title, link?.url].join('|');
}

function keyForDocument(document) {
  return [document?.file, document?.title, document?.date].join('|');
}

function addedItems(previous = [], current = [], key) {
  const previousKeys = new Set(previous.map(key));
  return current.filter((item) => !previousKeys.has(key(item)));
}

function newsCopy(previous, current, isNew) {
  const caseTitle = current.title || 'el caso';
  if (isNew) {
    return {
      title: `Nuevo caso documentado: ${caseTitle}`,
      summary: `Se incorporó el caso de ${current.location || 'la comunidad'} al registro público.`,
      body: current.summary || 'Se creó un nuevo caso documentado.',
    };
  }

  const newPress = addedItems(previous.pressLinks, current.pressLinks, keyForPress);
  const newDocuments = addedItems(previous.documents, current.documents, keyForDocument);
  if (newPress.length === 1 && newDocuments.length === 0) {
    const source = newPress[0];
    return {
      title: `Nueva fuente de prensa sobre ${caseTitle}`,
      summary: `Se agregó una publicación de ${source.outlet}: ${source.title}.`,
      body: `Se incorporó una nueva fuente de prensa: [${source.title}](${source.url}).`,
    };
  }
  if (newDocuments.length === 1 && newPress.length === 0) {
    const document = newDocuments[0];
    return {
      title: `Nuevo documento incorporado al caso`,
      summary: `Se agregó el documento “${document.title}” a ${caseTitle}.`,
      body: document.summary || `Se incorporó el documento “${document.title}”.`,
    };
  }
  if (previous.status !== current.status) {
    return {
      title: `Estado actualizado: ${caseTitle}`,
      summary: `El caso pasó de “${previous.status || 'sin estado'}” a “${current.status || 'sin estado'}”.`,
      body: 'Se actualizó el estado público del caso.',
    };
  }
  if (newPress.length || newDocuments.length) {
    return {
      title: `Documentación actualizada: ${caseTitle}`,
      summary: `Se incorporaron ${newDocuments.length ? 'documentos' : ''}${newDocuments.length && newPress.length ? ' y ' : ''}${newPress.length ? 'fuentes de prensa' : ''} al caso.`,
      body: 'Se actualizó la documentación y la difusión pública disponibles para este caso.',
    };
  }
  return {
    title: `Actualización del caso: ${caseTitle}`,
    summary: `Se actualizó la información pública disponible sobre ${caseTitle}.`,
    body: 'Se actualizó la información pública de este caso.',
  };
}

function dateInArgentina(commit) {
  const date = new Date(git(['show', '-s', '--format=%cI', commit]));
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const value = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

const files = changedCaseFiles(beforeInput, after);
const created = [];
for (const file of files) {
  const slug = path.basename(file, '.md');
  const current = readFrontmatter(contentAt(after, file), file).data;
  let previous = {};
  let isNew = false;
  try {
    previous = readFrontmatter(contentAt(beforeInput, file), file).data;
  } catch {
    isNew = true;
  }

  const copy = newsCopy(previous, current, isNew);
  const filename = `${slug}-${after.slice(0, 7)}.md`;
  const destination = path.join(newsDirectory, filename);
  if (await exists(destination)) continue;
  const frontmatter = stringify({
    title: copy.title,
    summary: copy.summary,
    date: dateInArgentina(after),
    case: slug,
  }, { defaultStringType: 'QUOTE_DOUBLE', lineWidth: 0 }).trim();
  const source = `---\n${frontmatter}\n---\n\n${copy.body}\n`;

  if (!dryRun) {
    await mkdir(newsDirectory, { recursive: true });
    await writeFile(destination, source, 'utf8');
  }
  created.push(path.relative(root, destination));
}

console.log(created.length ? `Novedades generadas:\n${created.join('\n')}` : 'No hay novedades para generar.');
