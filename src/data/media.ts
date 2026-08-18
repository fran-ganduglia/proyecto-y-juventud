export interface MediaItem {
  id: string;
  title: string;
  outlet: string;
  isDemo: boolean;
}

export const mediaItems: MediaItem[] = [
  { id: 'medio-demo-01', title: 'Espacio para una repercusión en medios', outlet: 'Medio local — demo', isDemo: true },
  { id: 'medio-demo-02', title: 'Espacio para una entrevista o nota web', outlet: 'Canal o sitio web — demo', isDemo: true },
  { id: 'medio-demo-03', title: 'Espacio para un video de YouTube', outlet: 'YouTube — demo', isDemo: true },
];
