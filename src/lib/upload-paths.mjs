// Decap con slug.encoding: ascii admite letras, números, guiones, _ y ~.
// Los nombres de archivos no son slugs de casos: pueden terminar en guion.
const filename = '[a-z0-9_~-]+';
const slug = '[a-z0-9]+(?:-[a-z0-9]+)*';
const image = `${filename}\\.(?:jpg|jpeg|png|webp)`;
const pdf = `${filename}\\.pdf`;

export const imagePath = new RegExp(`^/uploads/(?:${image}|casos/${slug}/imagenes/${image}|novedades/${slug}/${image})$`, 'i');
export const documentPath = new RegExp(`^/uploads/(?:${pdf}|casos/${slug}/documentos/${pdf})$`, 'i');
export const uploadPath = new RegExp(`^/uploads/(?:${image}|${pdf}|casos/${slug}/(?:documentos/${pdf}|imagenes/${image})|novedades/${slug}/${image})$`, 'i');
