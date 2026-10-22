import test from 'node:test';
import assert from 'node:assert/strict';
import { imagePath, documentPath, uploadPath } from '../src/lib/upload-paths.mjs';

test('acepta el PDF que bloqueaba la publicación y nombres ASCII de Decap', () => {
  for (const file of [
    'investigacion-n-4-sistema-de-emergencias-de-lanus-sel-.pdf',
    'Informe--Final_2026~.PDF',
    'casos/cementerio-lanus/documentos/nota-concejo.pdf',
  ]) {
    assert.ok(documentPath.test(`/uploads/${file}`), file);
    assert.ok(uploadPath.test(`/uploads/${file}`), file);
  }
  for (const file of ['Foto--Frente_.JPG', 'casos/cementerio-lanus/imagenes/frente-.webp', 'novedades/caso-demo/foto~.png']) {
    assert.ok(imagePath.test(`/uploads/${file}`), file);
    assert.ok(uploadPath.test(`/uploads/${file}`), file);
  }
});

test('rechaza rutas fuera de uploads, traversal y archivos ejecutables', () => {
  for (const file of [
    '/archivo.pdf', '/uploads/../archivo.pdf', '/uploads/%2e%2e/archivo.pdf',
    '/uploads/informe.pdf/../script.js', '/uploads/informe.pdf.html',
    '/uploads/script.js', '/uploads/imagen.svg', '/uploads/.pdf',
    '/uploads/archivo con espacios.pdf', '/uploads/informe.pdf?x=1',
    '/uploads/otra-carpeta/archivo.pdf', '/uploads/archivo\\.pdf',
  ]) {
    assert.equal(uploadPath.test(file), false, file);
    assert.equal(documentPath.test(file), false, file);
    assert.equal(imagePath.test(file), false, file);
  }
  assert.equal(documentPath.test('/uploads/foto.png'), false);
  assert.equal(imagePath.test('/uploads/nota.pdf'), false);
});
