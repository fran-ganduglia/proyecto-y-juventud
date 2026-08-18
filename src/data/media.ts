export interface MediaItem {
  id: string;
  title: string;
  outlet: string;
  kind: 'Nota web' | 'Facebook' | 'Instagram';
  href: string;
  caseId: string;
}

export const mediaItems: MediaItem[] = [
  { id: 'dataconurbano-cementerio', title: 'Denuncian estado de abandono y restos humanos expuestos en el Cementerio de Lanús', outlet: 'Data Conurbano', kind: 'Nota web', href: 'https://dataconurbano.net/sociedad/denuncian-estado-de-abandono-y-presencia-de-restos-humanos-expuestos-en-el-cementerio-de-lanus/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZnRzaATwZ21wZG9mAmZkaWQWUMrsnE-6l4eFv_hDHPqEr9uX_Mon2GV4dG4DYWVtAjExAHNydGMGYXBwX2lkDzEyNDAyNDU3NDI4NzQxNAABp_LTjv5U5xkDvBrCxtVg2JeD7rlMSLlguXVUysoivYW5zTPG-shJXE4F6mPM_aem_vlr66l1x6HE6ZS0aWF8bpw', caseId: 'cementerio-lanus' },
  { id: 'facebook-cementerio', title: 'Publicación de difusión del reclamo', outlet: 'Facebook', kind: 'Facebook', href: 'https://www.facebook.com/share/p/1BYpHLnMaW/?mibextid=wwXIfr', caseId: 'cementerio-lanus' },
  { id: 'instagram-cementerio', title: 'Reel sobre el reclamo del cementerio', outlet: 'Instagram', kind: 'Instagram', href: 'https://www.instagram.com/reel/DcCRlSqP_HR/?igsh=dmFrejdhcm0wa3k1', caseId: 'cementerio-lanus' },
];
