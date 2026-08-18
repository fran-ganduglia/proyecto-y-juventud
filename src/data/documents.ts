export interface CaseDocument {
  id: string;
  caseId: string;
  title: string;
  summary: string;
  file: string;
}

export const documents: CaseDocument[] = [
  {
    id: 'programa-cementerio-365',
    caseId: 'cementerio-lanus',
    title: 'Programa “Cementerio — 365 días”',
    summary: 'Propuesta técnica sobre la situación del Cementerio de Lanús y posibles líneas de acción.',
    file: '/PROBLEMATICA%20CEMENTERIO%20Y%20PROPUESTAS.pdf',
  },
  {
    id: 'nota-concejo-cementerio',
    caseId: 'cementerio-lanus',
    title: 'Nota presentada ante el Concejo Deliberante',
    summary: 'Solicitud de información pública sobre el estado y el mantenimiento del Cementerio Municipal de Lanús.',
    file: '/NOTA%20AL%20CONCEJO%20DELIBERANTE.pdf',
  },
];
