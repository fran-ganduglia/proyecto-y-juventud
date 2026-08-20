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

Antes de guardar, subí todo directamente a `public/uploads/`. Usá nombres descriptivos y únicos, en minúsculas, sin espacios ni acentos; por ejemplo: `cementerio-lanus-foto-frente.jpg` o `cementerio-lanus-nota-concejo.pdf`. El selector estándar de Decap no admite organizar las cargas en subcarpetas.

La validación previa al build rechaza archivos fuera de esa carpeta, mayores de 10 MB o que no sean PDF, JPG, PNG o WebP reales; también bloquea nombres inseguros, slugs/referencias inválidas, URLs que no sean HTTPS y HTML o scripts en el contenido. Los archivos ya existentes en la estructura anterior siguen siendo válidos. Un fallo conserva publicado el deploy anterior de Netlify.

La versión de Decap está fijada en `3.7.0`. Antes de alterar la CSP de `public/_headers`, comprobá inicio de sesión Google, subida de archivos y guardado desde el panel de producción.
