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
];
