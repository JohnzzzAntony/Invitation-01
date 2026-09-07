/* ==========================================================================
   Ever RSVP — layout: poetic  (Muhibbi "Main Wedding Home", index.html)
   --------------------------------------------------------------------------
   Full-length invitation: cinematic hero with two floating portraits, host
   cards, detail tiles, countdown, gallery slider, wishes slider, video band,
   registry, milestones in numbers, invitation band, updates and a photo strip.
   Styling comes from css/mu.css (sections 3.1–3.11 of the template).
   Reference for the layout contract: docs/LAYOUT-SPEC.md.
   ========================================================================== */
(function () {
  'use strict';
  var E = window, M = window.MU;
  var ID = 'poetic';

  var NAV = [
    ['couple', 'Hosts'], ['event', 'Details'], ['countdown', 'Countdown'],
    ['gallery', 'Gallery'], ['registry', 'Registry'], ['updates', 'Updates'],
    ['rsvp', 'RSVP']
  ];

  /* ---------------------------------------------------------------- render */
  function body(d, tpl, opts) {
    var B = d.basics;

    return M.build(d, ID, function (id, s) {
      if (id === 'hero') {
        return '<section class="ws-sec ws-hero wpo-hero-static" id="ws-sec-hero"' +
            (s.photo ? ' style="background-image:url(' + M.esc(M.photo(s.photo)) + ')"' : '') + '>' +
            '<div class="container-fluid">' +
              '<div class="hero-wrapper"><div class="content">' +
                (s.kicker ? '<div><span>' + M.esc(s.kicker) + '</span></div>' : '') +
                '<h1>' + M.esc(s.headline || (B.nameA + ' & ' + B.nameB)) + '</h1>' +
              '</div></div>' +
              (s.photoL ? '<div class="image-1 inner-image">' + M.img(s.photoL, '') + '</div>' : '') +
              (s.photoR ? '<div class="image-2 inner-image">' + M.img(s.photoR, '') + '</div>' : '') +
            '</div>' +
          '</section>';
      }

      if (id === 'couple') {
        function card(name, text, shape) {
          return '<div class="couple-card"><div class="couple-items">' +
              '<div class="couple-text"><h2>' + M.esc(name) + '</h2><p>' + M.esc(text) + '</p></div>' +
              '<div class="couple-shape"><img src="mu/images/couple/' + shape + '" alt=""/></div>' +
            '</div></div>';
        }
        return M.sec(id, 'wpo-couple-section',
          '<div class="container-fluid"><div class="wpo-couple-wrap">' +
            card(s.nameA || B.nameA, s.textA, 'shape-1.svg') +
            '<div class="couple-card"><div class="couple-image inner-image">' +
              M.img(s.photo, s.nameA || B.nameA) + '</div></div>' +
            card(s.nameB || B.nameB, s.textB, 'shape-2.svg') +
          '</div></div>', s);
      }

      if (id === 'event') {
        return M.sec(id, 'wpo-event-section',
          '<div class="wpo-event-wrap"><div class="container"><div class="row justify-content-center">' +
            (s.items || []).map(function (it) {
              return '<div class="col-lg-4 col-md-6 col-sm-6 col-12"><div class="event-item">' +
                '<div class="icon"><img src="mu/images/event/' + M.esc(it.icon || 'icon-1.svg') + '" alt=""/></div>' +
                '<div class="event-text"><h3>' + M.esc(it.title) + '</h3><p>' + M.esc(it.text) + '</p>' +
                (it.link ? '<a class="mu-inline-link" href="' + M.esc(M.safe(it.link)) +
                  '" target="_blank" rel="noopener noreferrer">' + M.esc(it.linkText || 'Open') + '</a>' : '') +
                '</div></div></div>';
            }).join('') +
          '</div></div></div>', s);
      }

      if (id === 'countdown') {
        return M.sec(id, 'mu-count-band section-padding',
          '<div class="container">' + M.title(s.title) +
            M.timer(s.date || B.date, s.label) +
            (s.quote ? '<p class="mu-count-quote">“' + M.esc(s.quote) + '”</p>' : '') +
          '</div>', s);
      }

      if (id === 'gallery') {
        var tiles = (s.items || []).map(function (p) {
          return '<div class="grid"><div class="img-holder">' +
            '<a href="' + M.esc(M.photo(p.src)) + '" data-mu-zoom>' +
              M.img(p.src, p.alt || 'Gallery photo', 'img img-responsive') +
              '<div class="hover-content">' + M.ti('plus') + '</div>' +
            '</a></div></div>';
        });
        return M.sec(id, 'wpo-gallery-section section-padding',
          '<div class="container-fluid">' + M.title(s.title) +
            '<div class="row"><div class="col-lg-12"><div class="gallery-grids">' +
              M.slider(tiles, { per: 3 }) +
            '</div></div></div>' +
          '</div>', s);
      }

      if (id === 'wishes') {
        var quotes = (s.items || []).map(function (q) {
          return '<div class="testimonial-item"><div class="testimonial-content">' +
            '<div class="icon"><img src="mu/images/testimonial/quote.svg" alt="quote"/></div>' +
            '<h3>“' + M.esc(q.text) + '”</h3>' +
            '<div class="testimonial-text"><ul>' +
              '<li>' + M.esc(q.name) + '</li>' +
              (q.meta ? '<li>' + M.esc(q.meta) + '</li>' : '') +
            '</ul></div>' +
          '</div></div>';
        });
        return M.sec(id, 'wpo-testimonial-section section-padding',
          '<div class="container-fluid"><div class="testimonial-wrap">' +
            M.slider(quotes, { per: 1, nav: false }) +
          '</div></div>', s);
      }

      if (id === 'video') {
        var url = M.safe(s.url);
        return M.sec(id, 'wpo-video-section',
          '<div class="video-image"><div class="bottom-image">' +
            M.img(s.photo, s.title || 'Video') +
            (url ? '<div class="video-wrap"><a class="video-btn" href="' + M.esc(url) +
              '" target="_blank" rel="noopener noreferrer" aria-label="Play video">' +
              '<i class="fi flaticon-play"></i></a></div>' : '') +
          '</div></div>', s);
      }

      if (id === 'registry') {
        return M.sec(id, 'wpo-product-section section-padding',
          '<div class="container">' + M.title(s.title) +
            '<div class="wpo-product-wrap"><div class="row">' +
              (s.items || []).map(function (it) {
                var href = M.safe(it.url);
                return '<div class="col col-lg-3 col-md-6 col-sm-6 col-12"><div class="wpo-product-item">' +
                  '<div class="wpo-product-img">' + M.img(it.photo, it.name) +
                    (href ? '<ul><li><a href="' + M.esc(href) + '" target="_blank" rel="noopener noreferrer">' +
                      M.esc(it.btn || 'View gift') + '</a></li></ul>' : '') +
                  '</div>' +
                  '<div class="wpo-product-text"><h3>' + M.esc(it.name) + '</h3>' +
                    (it.note ? '<ul class="bottom-text"><li>' + M.esc(it.note) + '</li></ul>' : '') +
                  '</div>' +
                '</div></div>';
              }).join('') +
            '</div></div>' +
          '</div>', s);
      }

      if (id === 'facts') {
        return M.sec(id, 'wpo-fun-fact-section section-padding',
          '<div class="container"><div class="row"><div class="col col-xs-12">' +
            (s.title ? M.title(s.title) : '') +
            '<div class="wpo-fun-fact-grids clearfix">' +
              (s.items || []).map(function (f) {
                return '<div class="grid"><div class="info">' +
                  '<h3><span>' + M.esc(f.value) + '</span>' + M.esc(f.suffix || '') + '</h3>' +
                  '<p>' + M.esc(f.label) + '</p></div></div>';
              }).join('') +
            '</div>' +
          '</div></div></div>', s);
      }

      if (id === 'cta') {
        return M.sec(id, 'wpo-cta-section',
          '<div class="container-fluid"><div class="wpo-cta-wrap"><div class="cta-item">' +
            '<h2>' + M.esc(s.title) + '</h2>' +
            (s.text ? '<p>' + M.esc(s.text) + '</p>' : '') +
            (s.btn ? '<div class="cta-btn">' + M.btn(s.btn, 'rsvp') + '</div>' : '') +
          '</div></div></div>', s);
      }

      if (id === 'updates') {
        return M.sec(id, 'wpo-blog-section section-padding',
          '<div class="container">' + M.title(s.title) +
            '<div class="wpo-blog-wrap"><div class="row">' +
              (s.items || []).map(function (p) {
                return '<div class="col col-lg-4 col-md-6 col-12"><div class="wpo-blog-item">' +
                  '<div class="blog-img inner-image">' + M.img(p.photo, p.title) +
                    (p.date ? '<div class="blog-date"><span>' + M.esc(p.date) + '</span></div>' : '') +
                  '</div>' +
                  '<div class="blog-content">' +
                    (p.meta ? '<ul class="blog-text"><li>' + M.esc(p.meta) + '</li></ul>' : '') +
                    '<h3>' + M.esc(p.title) + '</h3><p>' + M.esc(p.text) + '</p>' +
                  '</div>' +
                '</div></div>';
              }).join('') +
            '</div></div>' +
          '</div>', s);
      }

      if (id === 'photos') {
        return M.sec(id, 'wpo-portfolio-section',
          '<div class="container-fluid"><div class="portfolio-all-items"><div class="portfolio-wrap">' +
            (s.items || []).map(function (p) {
              return '<div class="portfolio-items"><div class="portfolio-image">' +
                '<a href="' + M.esc(M.photo(p.src)) + '" data-mu-zoom>' +
                  M.img(p.src, 'Photo', 'img img-responsive') +
                  '<div class="hover-content">' + M.ti('plus') + '</div>' +
                '</a></div></div>';
            }).join('') +
          '</div></div></div>', s);
      }

      if (id === 'rsvp') return M.rsvpSection(s, B);
      if (id === 'contact') return M.foot(d, tpl, s);
      return '';
    });
  }

  function render(d, tpl, opts) {
    var el = E.EVER_siteRoot(d, tpl, opts);
    el.innerHTML = M.head(d, tpl, { links: NAV }) + body(d, tpl, opts || {});
    return el;
  }

  /* ------------------------------------------------------------ registration */
  E.EVER_registerLayout({
    id: ID,
    label: 'Poetic Portrait',
    events: ['wedding', 'anniversary'],

    basics: [
      { k: 'nameA',  label: 'First host / guest of honour', type: 'text', ph: 'Max' },
      { k: 'nameB',  label: 'Second host (optional)', type: 'text', ph: 'Amanda' },
      { k: 'brand',  label: 'Wordmark in the header', type: 'text', ph: 'M & A' },
      { k: 'date',   label: 'Date', type: 'date' },
      { k: 'time',   label: 'Time', type: 'text', ph: '05:00 PM onwards' },
      { k: 'venue',  label: 'Venue', type: 'text', ph: 'Rosewood Barn' },
      { k: 'city',   label: 'City / region', type: 'text', ph: 'Kent' },
      { k: 'dress',  label: 'Dress code', type: 'text', ph: 'Garden formal' }
    ],

    sections: M.withStyleFields([
      { id: 'hero', label: 'Hero',
        fields: [
          { k: 'kicker',   label: 'Date line above the title', type: 'text', ph: '25 Feb 2027' },
          { k: 'headline', label: 'Headline', type: 'text', ph: 'Let the party begin' },
          { k: 'photo',    label: 'Background photo', type: 'photo' },
          { k: 'photoL',   label: 'Floating photo (left)', type: 'photo' },
          { k: 'photoR',   label: 'Floating photo (right)', type: 'photo' }
        ] },
      { id: 'couple', label: 'Hosts',
        fields: [
          { k: 'nameA', label: 'Left name (empty = basics)', type: 'text', ph: 'Max Wilson' },
          { k: 'textA', label: 'Left message', type: 'textarea' },
          { k: 'photo', label: 'Centre photo', type: 'photo' },
          { k: 'nameB', label: 'Right name (empty = basics)', type: 'text', ph: 'Amanda Jenny' },
          { k: 'textB', label: 'Right message', type: 'textarea' }
        ] },
      { id: 'event', label: 'Detail tiles',
        fields: [],
        list: { k: 'items', label: 'Tile',
          blank: function () { return { icon: 'icon-1.svg', title: 'New tile', text: '' }; },
          fields: [
            { k: 'icon',  label: 'Icon', type: 'select',
              options: [['icon-1.svg', 'Location'], ['icon-2.svg', 'Rings'], ['icon-3.svg', 'Ceremony']] },
            { k: 'title', label: 'Title', type: 'text', ph: 'Location' },
            { k: 'text',  label: 'Text', type: 'textarea' },
            { k: 'link',  label: 'Link (optional)', type: 'text', ph: 'https://maps.google.com/…' },
            { k: 'linkText', label: 'Link text', type: 'text', ph: 'Open map' }
          ] } },
      { id: 'countdown', label: 'Countdown',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Counting the days' },
          { k: 'label', label: 'Label above the timer', type: 'text', ph: 'Until we celebrate' },
          { k: 'date',  label: 'Count down to (empty = event date)', type: 'date' },
          { k: 'quote', label: 'Quote under the timer', type: 'textarea' }
        ] },
      { id: 'gallery', label: 'Gallery',
        fields: [{ k: 'title', label: 'Section title', type: 'text', ph: 'Our awesome gallery' }],
        list: { k: 'items', label: 'Photo',
          blank: function () { return { src: 'mu-gallery-1' }; },
          fields: [
            { k: 'src', label: 'Photo', type: 'photo' },
            { k: 'alt', label: 'Caption / alt text', type: 'text' }
          ] } },
      { id: 'wishes', label: 'Wishes',
        fields: [],
        list: { k: 'items', label: 'Wish',
          blank: function () { return { text: 'A lovely message.', name: 'A friend', meta: '' }; },
          fields: [
            { k: 'text', label: 'Message', type: 'textarea' },
            { k: 'name', label: 'From', type: 'text', ph: 'Marlin & Williamson' },
            { k: 'meta', label: 'Sub-line', type: 'text', ph: 'Since 2016' }
          ] } },
      { id: 'video', label: 'Video band',
        fields: [
          { k: 'photo', label: 'Still image', type: 'photo' },
          { k: 'url',   label: 'Video link (YouTube / Vimeo)', type: 'text', ph: 'https://youtube.com/…' }
        ] },
      { id: 'registry', label: 'Gift registry',
        fields: [{ k: 'title', label: 'Section title', type: 'text', ph: 'A little something' }],
        list: { k: 'items', label: 'Gift',
          blank: function () { return { photo: 'mu-product-1', name: 'New gift', note: '', url: '', btn: 'View gift' }; },
          fields: [
            { k: 'photo', label: 'Photo', type: 'photo' },
            { k: 'name',  label: 'Name', type: 'text', ph: 'Wedding cake' },
            { k: 'note',  label: 'Note under the name', type: 'text', ph: 'From the bakery on Elm St.' },
            { k: 'url',   label: 'Link', type: 'text', ph: 'https://…' },
            { k: 'btn',   label: 'Button text', type: 'text', ph: 'View gift' }
          ] } },
      { id: 'facts', label: 'In numbers',
        fields: [{ k: 'title', label: 'Section title', type: 'text' }],
        list: { k: 'items', label: 'Number',
          blank: function () { return { value: '10', suffix: '+', label: 'New stat' }; },
          fields: [
            { k: 'value',  label: 'Number', type: 'text', ph: '3213' },
            { k: 'suffix', label: 'Suffix', type: 'text', ph: '+' },
            { k: 'label',  label: 'Label', type: 'text', ph: 'Happy years' }
          ] } },
      { id: 'cta', label: 'Invitation band',
        fields: [
          { k: 'title', label: 'Heading', type: 'text', ph: 'Can’t wait to see you with us!' },
          { k: 'text',  label: 'Text', type: 'textarea' },
          { k: 'btn',   label: 'Button text (empty = hide)', type: 'text', ph: 'RSVP' }
        ] },
      { id: 'updates', label: 'Updates',
        fields: [{ k: 'title', label: 'Section title', type: 'text', ph: 'Good things to know' }],
        list: { k: 'items', label: 'Update',
          blank: function () { return { photo: 'mu-blog-1', title: 'New update', text: '', date: '', meta: '' }; },
          fields: [
            { k: 'photo', label: 'Photo', type: 'photo' },
            { k: 'date',  label: 'Date badge', type: 'text', ph: 'September 25, 2026' },
            { k: 'meta',  label: 'Category', type: 'text', ph: 'Travel' },
            { k: 'title', label: 'Title', type: 'text', ph: 'Where to stay' },
            { k: 'text',  label: 'Text', type: 'textarea' }
          ] } },
      { id: 'photos', label: 'Photo strip',
        fields: [],
        list: { k: 'items', label: 'Photo',
          blank: function () { return { src: 'mu-portfolio-1' }; },
          fields: [{ k: 'src', label: 'Photo', type: 'photo' }] } },
      M.rsvpSpec('RSVP'),
      M.contactSection('Footer & contact')
    ]),

    defaults: function () {
      return {
        basics: {
          nameA: 'Max', nameB: 'Amanda', brand: 'M & A',
          date: E.EVER_futureISO(4), time: '05:00 PM onwards',
          venue: 'Rosewood Barn', city: 'Kent',
          dress: 'Garden formal'
        },
        sections: {
          hero: { on: true,
            kicker: E.EVER_fmtHeroDate(E.EVER_futureISO(4)),
            headline: 'Let the party begin',
            photo: 'mu-hero-1', photoL: 'mu-hero-2', photoR: 'mu-hero-3' },
          couple: { on: true,
            nameA: 'Max Wilson',
            textA: 'A heart full of love and a soul full of hope — I can’t wait to begin this journey with you by my side.',
            photo: 'mu-couple-1',
            nameB: 'Amanda Jenny',
            textB: 'Today I marry my best friend. With joy in my heart and love in my eyes, I’m ready for forever.' },
          event: { on: true, items: [
            { icon: 'icon-1.svg', title: 'Location', text: 'Rosewood Barn, Kent — five minutes from the village square.', link: '', linkText: 'Open map' },
            { icon: 'icon-2.svg', title: 'Registration', text: 'Confirm your presence so we can save you the best seat.', link: '', linkText: '' },
            { icon: 'icon-3.svg', title: 'The ceremony', text: 'Doors open at half past four; the ceremony begins at five.', link: '', linkText: '' }
          ] },
          countdown: { on: true,
            title: 'Counting the days',
            label: 'Until we celebrate',
            date: '',
            quote: 'Two hearts, one love, a lifetime together.' },
          gallery: { on: true, title: 'Our awesome gallery', items: [
            { src: 'mu-gallery-1' }, { src: 'mu-gallery-2' }, { src: 'mu-gallery-3' },
            { src: 'mu-gallery-4' }, { src: 'mu-gallery-5' }, { src: 'mu-gallery-6' }
          ] },
          wishes: { on: true, items: [
            { text: 'Watching these two find each other has been the joy of our decade. We cannot wait for the day.', name: 'Marlin & Williamson', meta: 'Friends since 2016' },
            { text: 'Every room they walk into gets warmer. Here is to a lifetime of that.', name: 'The Alvarez family', meta: 'Neighbours' }
          ] },
          video: { on: true, photo: 'mu-video', url: 'https://www.youtube.com/watch?v=IvBToRiExbk' },
          registry: { on: true, title: 'A little something', items: [
            { photo: 'mu-product-1', name: 'The cake fund', note: 'Sweetening the evening', url: '', btn: 'Contribute' },
            { photo: 'mu-product-2', name: 'Honeymoon jar', note: 'Two weeks in Kerala', url: '', btn: 'Contribute' },
            { photo: 'mu-product-3', name: 'Home & hearth', note: 'For the new kitchen', url: '', btn: 'Contribute' },
            { photo: 'mu-product-4', name: 'Give to charity', note: 'In place of a gift', url: '', btn: 'Donate' }
          ] },
          facts: { on: true, title: '', items: [
            { value: '9', suffix: '', label: 'Years together' },
            { value: '3', suffix: '', label: 'Cities lived in' },
            { value: '146', suffix: '', label: 'Guests invited' },
            { value: '1', suffix: '', label: 'Very big day' }
          ] },
          cta: { on: true,
            title: 'Can’t wait to see you with us!',
            text: 'Please be with us — your presence will make our day truly special.',
            btn: 'RSVP' },
          updates: { on: true, title: 'Good things to know', items: [
            { photo: 'mu-blog-1', date: 'September 25, 2026', meta: 'Travel', title: 'Getting to the barn', text: 'Trains run to Ashford every half hour; we have shuttles from the station.' },
            { photo: 'mu-blog-2', date: 'January 08, 2027', meta: 'Stay', title: 'Where to stay', text: 'We have held rooms at two inns in the village — mention our names.' },
            { photo: 'mu-blog-3', date: 'December 14, 2026', meta: 'Day of', title: 'What to expect', text: 'An outdoor ceremony, dinner under the beams and dancing until late.' }
          ] },
          photos: { on: true, items: [
            { src: 'mu-portfolio-1' }, { src: 'mu-portfolio-2' }, { src: 'mu-portfolio-3' }, { src: 'mu-portfolio-4' },
            { src: 'mu-portfolio-5' }, { src: 'mu-portfolio-6' }, { src: 'mu-portfolio-7' }
          ] },
          rsvp: M.rsvpDefaults(),
          contact: M.contactDefaults()
        }
      };
    },

    render: render,
    mini: function (d, tpl, opts) { return M.miniWrap(d, tpl, opts, render); }
  });
})();
