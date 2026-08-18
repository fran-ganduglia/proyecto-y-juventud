export type CaseStatus = 'Recibido' | 'Presentado' | 'En seguimiento' | 'Respondido' | 'Resuelto';

export interface CommunityCase {
  id: string;
  title: string;
  location: string;
  status: CaseStatus;
  summary: string;
  isDemo: boolean;
}

export const cases: CommunityCase[] = [
  {
    id: 'cementerio-lanus',
    title: 'Estado de abandono del Cementerio de Lanús',
    location: 'Lanús',
    status: 'Presentado',
    summary: 'Primer reclamo difundido públicamente por la organización sobre la situación del cementerio. El caso reúne una propuesta técnica y repercusiones en medios y redes.',
    isDemo: false,
  },
];
