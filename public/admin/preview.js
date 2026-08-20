(function () {
  var CMS = window.CMS;
  var h = window.h;
  var createClass = window.createClass;

  if (!CMS || !h || !createClass) return;

  CMS.registerPreviewStyle('/admin/preview.css');

  function text(value, fallback) {
    return value === undefined || value === null || value === '' ? fallback : String(value);
  }

  function data(entry, key, fallback) {
    return text(entry.getIn(['data', key]), fallback);
  }

  function list(entry, key) {
    var value = entry.getIn(['data', key]);
    if (!value) return [];
    return typeof value.toJS === 'function' ? value.toJS() : value;
  }

  function object(entry, key) {
    var value = entry.getIn(['data', key]);
    if (!value) return {};
    return typeof value.toJS === 'function' ? value.toJS() : value;
  }

  function date(value) {
    if (!value) return 'Sin fecha';
    var stringValue = String(value);
    var parsed = new Date(stringValue.length === 10 ? stringValue + 'T00:00:00Z' : stringValue);
    if (Number.isNaN(parsed.getTime())) return stringValue;
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(parsed);
  }

  function asset(props, path) {
    if (!path) return undefined;
    try {
      var resolved = props.getAsset(path);
      return resolved ? resolved.toString() : undefined;
    } catch (error) {
      return undefined;
    }
  }

  function deviceSelector(component) {
    var device = component.state.device;
    return h('div', { className: 'preview-device-selector', role: 'group', 'aria-label': 'Tamaño de vista previa' },
      h('span', {}, 'Vista previa'),
      h('button', {
        type: 'button',
        className: device === 'desktop' ? 'is-active' : '',
        onClick: function () { component.setState({ device: 'desktop' }); },
      }, 'Escritorio'),
      h('button', {
        type: 'button',
        className: device === 'mobile' ? 'is-active' : '',
        onClick: function () { component.setState({ device: 'mobile' }); },
      }, 'Móvil')
    );
  }

  function previewFrame(component, content) {
    return h('div', { className: 'preview-root' },
      deviceSelector(component),
      h('p', { className: 'preview-live-note' }, 'Los cambios se actualizan mientras escribís.'),
      h('div', { className: 'preview-canvas preview-canvas--' + component.state.device },
        h('div', { className: 'preview-browser-bar', 'aria-hidden': 'true' },
          h('span', {}, '●'), h('span', {}, '●'), h('span', {}, '●'),
          h('span', { className: 'preview-browser-url' }, 'proyectoyjuventud.org.ar')
        ),
        content
      )
    );
  }

  function siteHeader() {
    return h('header', { className: 'preview-site-header' },
      h('span', { className: 'preview-brand' }, 'PROYECTO', h('small', {}, 'Y JUVENTUD')),
      h('nav', { 'aria-label': 'Navegación de muestra' },
        h('span', {}, 'INICIO'), h('span', {}, 'CASOS'), h('span', {}, 'NOVEDADES')
      ),
      h('span', { className: 'preview-header-cta' }, 'CONTANOS')
    );
  }

  function statusClass(status) {
    return String(status).toLowerCase().replaceAll(' ', '-');
  }

  var CasePreview = createClass({
    getInitialState: function () { return { device: 'desktop' }; },
    render: function () {
      var entry = this.props.entry;
      var props = this.props;
      var title = data(entry, 'title', 'Título del caso');
      var summary = data(entry, 'summary', 'El resumen del caso aparecerá aquí.');
      var location = data(entry, 'location', 'Localidad');
      var status = data(entry, 'status', 'Estado');
      var publishedAt = entry.getIn(['data', 'publishedAt']);
      var updatedAt = entry.getIn(['data', 'updatedAt']);
      var image = asset(props, entry.getIn(['data', 'image']));
      var documents = list(entry, 'documents');
      var pressLinks = list(entry, 'pressLinks');
      var body = props.widgetFor('body');

      var documentCards = documents.length ? documents.map(function (document, index) {
        return h('article', { className: 'preview-document', key: index },
          h('span', { className: 'preview-pdf', 'aria-hidden': 'true' }, 'PDF'),
          h('div', {},
            h('h3', {}, text(document.title, 'Documento sin título')),
            h('p', {}, text(document.summary, 'Resumen del documento.')),
            h('p', { className: 'preview-small-meta' }, date(document.date)),
            h('div', { className: 'preview-document-actions' },
              h('span', { className: 'preview-button' }, 'Ver documento'),
              h('span', { className: 'preview-text-link' }, 'Descargar PDF ↓')
            )
          )
        );
      }) : h('p', { className: 'preview-empty' }, 'Todavía no hay documentos para este caso.');

      var pressCards = pressLinks.length ? pressLinks.map(function (link, index) {
        return h('article', { className: 'preview-press-link', key: index },
          h('span', {}, text(link.kind, 'Nota web') + ' · ' + text(link.outlet, 'Medio')),
          h('strong', {}, text(link.title, 'Enlace de prensa')),
          h('span', { 'aria-hidden': 'true' }, '↗')
        );
      }) : h('p', { className: 'preview-empty' }, 'Todavía no hay enlaces de prensa.');

      return previewFrame(this, h('article', { className: 'preview-site preview-case' },
        siteHeader(),
        h('header', { className: 'preview-hero' },
          h('div', { className: 'preview-container' },
            h('p', { className: 'preview-kicker' }, 'Caso · ' + location),
            h('h1', {}, title),
            h('p', { className: 'preview-summary' }, summary),
            h('div', { className: 'preview-meta-row' },
              h('span', { className: 'preview-status ' + statusClass(status) }, status),
              h('span', {}, 'Publicado ' + date(publishedAt) + ' · Actualizado ' + date(updatedAt))
            )
          )
        ),
        h('div', { className: 'preview-container preview-content' },
          h('div', { className: 'preview-prose' }, body),
          image && h('img', { className: 'preview-image', src: image, alt: '' }),
          h('section', {},
            h('p', { className: 'preview-kicker' }, 'Documentación'),
            h('h2', {}, 'Documentos del caso'),
            h('div', { className: 'preview-document-list' }, documentCards)
          ),
          h('section', {},
            h('p', { className: 'preview-kicker' }, 'Seguimiento'),
            h('h2', {}, 'Línea de tiempo'),
            h('div', { className: 'preview-timeline' },
              h('article', { className: 'preview-timeline-item' },
                h('time', {}, date(publishedAt)),
                h('h3', {}, 'Publicación del caso'),
                h('p', {}, summary)
              )
            )
          ),
          h('section', {},
            h('p', { className: 'preview-kicker' }, 'Difusión pública'),
            h('h2', {}, 'Enlaces de prensa'),
            h('div', { className: 'preview-press-list' }, pressCards)
          )
        )
      ));
    },
  });

  var NewsPreview = createClass({
    getInitialState: function () { return { device: 'desktop' }; },
    render: function () {
      var entry = this.props.entry;
      var title = data(entry, 'title', 'Título de la novedad');
      var summary = data(entry, 'summary', 'El resumen de la novedad aparecerá aquí.');
      var linkedCase = data(entry, 'case', 'Sin seleccionar');
      var image = asset(this.props, entry.getIn(['data', 'image']));

      return previewFrame(this, h('article', { className: 'preview-site preview-news' },
        siteHeader(),
        h('header', { className: 'preview-hero' },
          h('div', { className: 'preview-container' },
            h('p', { className: 'preview-kicker' }, 'Novedad · ' + date(entry.getIn(['data', 'date']))),
            h('h1', {}, title),
            h('p', { className: 'preview-summary' }, summary)
          )
        ),
        h('div', { className: 'preview-container preview-content' },
          image && h('img', { className: 'preview-image', src: image, alt: '' }),
          h('div', { className: 'preview-prose' }, this.props.widgetFor('body')),
          h('p', { className: 'preview-related-case' }, 'Caso vinculado: ', h('strong', {}, linkedCase))
        )
      ));
    },
  });

  var HomePreview = createClass({
    getInitialState: function () { return { device: 'desktop' }; },
    render: function () {
      var entry = this.props.entry;
      var hero = object(entry, 'hero');
      var process = object(entry, 'process');
      var featured = object(entry, 'featuredCases');
      var steps = Array.isArray(process.steps) ? process.steps : [];

      return previewFrame(this, h('article', { className: 'preview-site preview-home' },
        siteHeader(),
        h('section', { className: 'preview-home-hero' },
          h('div', { className: 'preview-container' },
            h('p', { className: 'preview-kicker preview-kicker--light' }, text(hero.eyebrow, 'Antetítulo')),
            h('h1', {}, text(hero.title, 'Título principal'), h('br'), h('em', {}, text(hero.highlight, 'destacado.'))),
            h('p', { className: 'preview-summary preview-summary--light' }, text(hero.description, 'La descripción aparecerá aquí.')),
            h('div', { className: 'preview-home-actions' },
              h('span', { className: 'preview-button' }, text(hero.primaryCta, 'Acción principal')),
              h('span', { className: 'preview-text-link preview-text-link--light' }, text(hero.secondaryCta, 'Acción secundaria') + ' →')
            )
          ),
          h('span', { className: 'preview-home-orbit', 'aria-hidden': 'true' })
        ),
        h('section', { className: 'preview-home-process' },
          h('div', { className: 'preview-container' },
            h('p', { className: 'preview-kicker' }, text(process.eyebrow, 'Proceso')),
            h('h2', {}, text(process.title, 'Así trabajamos')),
            h('div', { className: 'preview-home-steps' }, steps.map(function (step, index) {
              return h('article', { key: index },
                h('span', {}, '0' + (index + 1)),
                h('h3', {}, text(step.title, 'Paso')),
                h('p', {}, text(step.description, 'Descripción del paso.'))
              );
            }))
          )
        ),
        h('section', { className: 'preview-home-featured' },
          h('div', { className: 'preview-container' },
            h('p', { className: 'preview-kicker' }, text(featured.eyebrow, 'Casos')),
            h('h2', {}, text(featured.title, 'Casos destacados')),
            h('p', { className: 'preview-home-copy' }, text(featured.intro, 'El texto introductorio aparecerá aquí.')),
            h('div', { className: 'preview-case-placeholder' },
              h('strong', {}, 'Casos publicados'),
              h('span', {}, 'Las tarjetas se cargan automáticamente desde la colección Casos.'),
              h('span', { className: 'preview-button preview-button--dark' }, text(featured.buttonLabel, 'Ver todos los casos'))
            )
          )
        )
      ));
    },
  });

  CMS.registerPreviewTemplate('cases', CasePreview);
  CMS.registerPreviewTemplate('novedades', NewsPreview);
  CMS.registerPreviewTemplate('home', HomePreview);
}());
