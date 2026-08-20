# Panel editorial seguro

El código del CMS está en `public/admin/`. Publicalo como un segundo sitio de Netlify desde este mismo repositorio: base directory `public/admin`, publish directory `.` y dominio `admin.ongopj.com.ar`. El sitio público conserva su configuración de build normal (`npm run build`, publish `dist`). El dominio canónico público configurado por defecto es `https://ongopj.com.ar`; si difiere, definí `SITE_URL` en Netlify.

## Configuración obligatoria de la cuenta propietaria

1. Conservá una sola cuenta propietaria de GitHub y Netlify. Activá 2FA, usá un gestor de contraseñas y guardá los códigos de recuperación fuera del equipo principal.
2. No concedas acceso al repositorio de GitHub ni al equipo de Netlify a editores y no subas secretos al repositorio.
3. En el segundo sitio, activá Netlify Identity; configurá **Registration: Invite only**, habilitá Google y Git Gateway. Restringí Git Gateway a los roles de contenido disponibles en Identity.
4. Invitá únicamente las direcciones Google autorizadas. Cada editor debe utilizar una cuenta personal con verificación en dos pasos; revocá su invitación al finalizar la colaboración.
5. Asociá `admin.ongopj.com.ar` en Netlify DNS, verificá el certificado HTTPS y configurá avisos de deploy fallido al correo de la cuenta propietaria.

El panel no admite borradores: cada guardado escribe en `main` y dispara un deploy. Git conserva el historial y permite recuperar contenido. El nombre de archivo se crea con el slug inicial y no se renombra al editar el título, por lo que la URL pública se mantiene estable.

## Regla editorial de archivos

Todo lo subido se hace público tras el deploy. No cargar DNI, teléfonos, domicilios, datos de denunciantes, información médica ni material sin autorización.

Antes de guardar, organizá los archivos así (en el selector de medios se puede crear/navegar carpetas):

- `public/uploads/casos/<slug-del-caso>/documentos/<archivo>.pdf`
- `public/uploads/casos/<slug-del-caso>/imagenes/<archivo>.jpg|png|webp`
- `public/uploads/novedades/<slug-de-la-novedad>/<archivo>.jpg|png|webp`

Los nombres y slugs deben ser minúsculos, sin espacios ni acentos. La validación previa al build rechaza archivos fuera de esas rutas, mayores de 10 MB o que no sean PDF, JPG, PNG o WebP reales; también bloquea slugs/referencias inválidas, URLs que no sean HTTPS y HTML o scripts en el contenido. Un fallo conserva publicado el deploy anterior de Netlify.

La versión de Decap está fijada en `3.7.0`. Antes de alterar la CSP de `public/_headers`, comprobá inicio de sesión Google, subida de archivos y guardado desde el panel de producción.
