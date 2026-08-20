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
      h('div', { className: 'preview-canvas preview-canvas--' + component.state.device }, content)
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
          image && h('img', { className: 'preview-image', src: image, alt: '' }),
          h('div', { className: 'preview-prose' }, body),
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

  CMS.registerPreviewTemplate('cases', CasePreview);
  CMS.registerPreviewTemplate('novedades', NewsPreview);
}());
