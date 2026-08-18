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
    id: 'caso-demo-01',
    title: 'Problemática barrial',
    location: 'Barrio / localidad a confirmar',
    status: 'Recibido',
    summary: 'Contenido de demostración. Próximamente se incorporarán casos verificados por la organización.',
    isDemo: true,
  },
  {
    id: 'caso-demo-02',
    title: 'Presentación ciudadana',
    location: 'Barrio / localidad a confirmar',
    status: 'En seguimiento',
    summary: 'Contenido de demostración. La información publicada se revisará antes de ser visible.',
    isDemo: true,
  },
  {
    id: 'caso-demo-03',
    title: 'Reclamo comunitario',
    location: 'Barrio / localidad a confirmar',
    status: 'Presentado',
    summary: 'Contenido de demostración. Cada caso podrá vincularse a su documentación correspondiente.',
    isDemo: true,
  },
];
