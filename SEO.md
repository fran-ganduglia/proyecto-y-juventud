# Puesta en marcha de SEO

Antes de publicar, configurá `SITE_URL` con la URL pública y definitiva del sitio. En Netlify se agrega en **Site configuration → Environment variables**; luego hay que hacer un nuevo deploy. En desarrollo, copiá `.env.example` a `.env` y completá el valor.

Al desplegar, verificá que estén disponibles estas dos URLs:

- `/robots.txt`
- `/sitemap.xml`

Luego, en [Google Search Console](https://search.google.com/search-console/about), agregá y verificá la propiedad del dominio. En **Sitemaps**, enviá `https://tu-dominio/sitemap.xml`. Por último, inspeccioná la URL principal y solicitá la indexación.

No uses la URL de vista previa del proveedor como `SITE_URL`: debe ser siempre el dominio que las personas usan para entrar al sitio. Si el dominio cambia, actualizá este valor, volvé a desplegar y configurá una redirección permanente desde el dominio anterior.
