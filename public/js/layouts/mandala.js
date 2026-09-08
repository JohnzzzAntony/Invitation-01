/* ==========================================================================
   Invitara — layout: mandala  (Muhibbi "Indian Wedding Home", index-8.html)
   --------------------------------------------------------------------------
   Festive, multi-day design: cross-fading hero photographs behind a floral
   frame, a circular countdown, cut-out host portraits, a masonry gallery, a
   full programme with per-event timelines, a framed RSVP card and a photo
   strip. The programme repeater is what makes this the layout for events
   that run over several days.
   ========================================================================== */
(function () {
  'use strict';
  var E = window, M = window.MU;
  var ID = 'mandala';

  var NAV = [
    ['countdown', 'Countdown'], ['couple', 'Hosts'], ['gallery', 'Gallery'],
    ['event', 'Programme'], ['rsvp', 'RSVP'], ['photos', 'Photos']
  ];

  function body(d, tpl) {
    var B = d.basics;

    return M.build(d, ID, function (id, s) {
      if (id === 'hero') {
        var bgs = (s.items || []).map(function (p) {
          return '<div class="image">' + M.img(p.src, '') + '</div>';
        });
        return M.sec(id, 'wpo-hero-static-s8',
          '<div class="wpo-hero-wrap">' +
            '<div class="hero-bg-image">' + M.slider(bgs, { per: 1, nav: false, cls: 'mu-hero-slider' }) + '</div>' +
            '<div class="hero-item"><div class="hero-content"><div class="hero-text">' +
              (s.kicker ? '<h2>' + M.esc(s.kicker) + '</h2>' : '') +
              '<h1>' + M.esc(s.nameA || B.nameA) + ' <span>&amp;</span> ' +
                M.esc(s.nameB || B.nameB) + '</h1>' +
              (s.meta ? '<p>' + M.esc(s.meta) + '</p>' : '') +
            '</div></div>' +
              '<div class="shape shape-1"><img src="mu/images/hero/flower-2.png" alt=""/></div>' +
              '<div class="shape shape-2"><img src="mu/images/hero/flower-3.png" alt=""/></div>' +
            '</div>' +
          '</div>', s);
      }

      if (id === 'countdown') {
        return M.sec(id, 'wpo-wedding-date-s2 pb-0',
          '<div class="container"><div class="wedding-date-wrap">' +
            (s.title ? M.title(s.title) : '') +
            '<div class="clock-grids">' + M.clock(s.date || B.date) + '</div>' +
          '</div></div>', s);
      }

      if (id === 'couple') {
        function card(name, text, photo) {
          return '<div class="col col-lg-4 col-md-12 col-12"><div class="couple-card">' +
            '<div class="couple-text"><h2>' + M.esc(name) + '</h2><p>' + M.esc(text) + '</p></div>' +
            '<div class="couple-image">' + M.img(photo, name) + '</div>' +
          '</div></div>';
        }
        return M.sec(id, 'wpo-couple-section-s6 section-padding',
          '<div class="container-fluid"><div class="wpo-couple-wrap"><div class="row align-items-center">' +
            card(s.nameA || B.nameA, s.textA, s.photoA) +
            '<div class="col col-lg-4 col-md-12 col-12"><div class="couple-middle">' +
              '<div class="image">' + M.img(s.photoMid, '') + '</div>' +
              '<div class="shape shape-1"><img src="mu/images/couple/shape-4.png" alt=""/></div>' +
              '<div class="shape shape-2"><img src="mu/images/couple/shape-5.png" alt=""/></div>' +
            '</div></div>' +
            card(s.nameB || B.nameB, s.textB, s.photoB) +
          '</div></div></div>', s);
      }

      if (id === 'gallery') {
        function tile(p) {
          if (!p) return '';
          return '<div class="grid"><div class="img-holder">' +
            '<a href="' + M.esc(M.photo(p.src)) + '" data-mu-zoom>' +
              M.img(p.src, 'Gallery photo', 'img img-responsive') +
              '<div class="hover-content">' + M.ti('plus') + '</div>' +
            '</a></div></div>';
        }
        var it = s.items || [];
        return M.sec(id, 'wpo-gallery-section-s5 pt-0',
          '<div class="container-fluid"><div class="sortable-gallery"><div class="row"><div class="col-lg-12">' +
            '<div class="gallery-grids gallery-container clearfix">' +
              '<div class="item-1 flx-item">' + it.slice(0, 3).map(tile).join('') + '</div>' +
              '<div class="item-2">' + it.slice(3, 4).map(tile).join('') + '</div>' +
              '<div class="item-3 flx-item">' + it.slice(4, 7).map(tile).join('') + '</div>' +
            '</div>' +
          '</div></div></div></div>', s);
      }

      if (id === 'event') {
        return M.sec(id, 'wpo-event-section-s5',
          '<div class="wpo-event-wrap"><div class="container-fluid"><div class="row align-items-center">' +
            '<div class="col col-lg-6 col-12"><div class="event-left-image">' +
              M.img(s.photo, s.title) + '</div></div>' +
            '<div class="col col-lg-6 col-12"><div class="event-right-content">' +
              (s.title ? '<div class="event-title"><h2>' + M.esc(s.title) + '</h2></div>' : '') +
              (s.items || []).map(function (ev) {
                return '<div class="event-item">' +
                  '<div class="image inner-image">' + M.img(ev.photo, ev.name) + '</div>' +
                  '<div class="event-text"><h3>' + M.esc(ev.name) + '</h3>' +
                    [['l1', 't1'], ['l2', 't2'], ['l3', 't3']].map(function (p) {
                      if (!ev[p[0]] && !ev[p[1]]) return '';
                      return '<div class="event-timeline"><span>' + M.esc(ev[p[0]]) + '</span>' +
                        '<span class="line"></span><span>' + M.esc(ev[p[1]]) + '</span></div>';
                    }).join('') +
                  '</div>' +
                '</div>';
              }).join('') +
            '</div></div>' +
          '</div></div></div>', s);
      }

      if (id === 'rsvp') {
        return M.sec(id, 'wpo-contact-section-s7 section-padding',
          '<div class="container-fluid"><div class="contact-wrap"><div class="row align-items-center">' +
            (s.photo === '' ? '' :
            '<div class="col-lg-6"><div class="contact-left-image">' + M.img(s.photo || 'mu-rsvp-4', '') +
              '<div class="shape shape-left"><img src="mu/images/rsvp/shape-left-3.png" alt=""/></div>' +
              '<div class="shape shape-right"><img src="mu/images/rsvp/shape-right-3.png" alt=""/></div>' +
            '</div></div>') +
            '<div class="col-lg-' + (s.photo === '' ? '12' : '6') + ' col-md-12">' +
              '<div class="wpo-contact-card"><div class="contact-all-item">' +
                '<div class="contact-title">' +
                  '<div class="title-shape"><img src="mu/images/rsvp/shape-1.svg" alt=""/></div>' +
                  '<h2>' + M.esc(s.title) + '</h2>' +
                  (s.note ? '<p>' + M.esc(s.note) +
                    (s.deadline ? ' <b>' + M.esc(E.EVER_fmtLongDate(s.deadline)) + '</b>' : '') + '</p>' : '') +
                '</div>' +
                '<div class="wpo-contact-section-wrapper">' + M.rsvpForm(s) + '</div>' +
              '</div></div>' +
            '</div>' +
          '</div></div></div>', s);
      }

      if (id === 'photos') {
        var tiles = (s.items || []).map(function (p, i) {
          return '<div class="portfolio-image' + (i % 2 ? ' s1' : '') + '">' +
            '<a href="' + M.esc(M.photo(p.src)) + '" data-mu-zoom>' +
              M.img(p.src, 'Photo', (i % 2 ? 'even ' : '') + 'img img-responsive') +
              '<div class="hover-content">' + M.ti('plus') + '</div>' +
            '</a></div>';
        });
        return M.sec(id, 'wpo-portfolio-section-s3 pt-0',
          '<div class="container-fluid"><div class="portfolio-all-items">' +
            '<div class="portfolio-wrap">' + M.slider(tiles, { per: 4 }) + '</div>' +
          '</div></div>', s);
      }

      if (id === 'contact') return M.foot(d, tpl, s);
      return '';
    });
  }

  function render(d, tpl, opts) {
    var el = E.EVER_siteRoot(d, tpl, opts);
    el.innerHTML = M.head(d, tpl, { links: NAV }) + body(d, tpl);
    return el;
  }

  E.EVER_registerLayout({
    id: ID,
    label: 'Mandala',
    events: ['wedding', 'birthday'],

    basics: [
      { k: 'nameA', label: 'First host / guest of honour', type: 'text', ph: 'Yash' },
      { k: 'nameB', label: 'Second host (optional)', type: 'text', ph: 'Dipika' },
      { k: 'brand', label: 'Wordmark in the header', type: 'text', ph: 'Y & D' },
      { k: 'date',  label: 'Date', type: 'date' },
      { k: 'time',  label: 'Time', type: 'text', ph: '03:00 PM onwards' },
      { k: 'venue', label: 'Venue', type: 'text', ph: 'The Grand Palms' },
      { k: 'city',  label: 'City / region', type: 'text', ph: 'Jaipur' },
      { k: 'dress', label: 'Dress code', type: 'text', ph: 'Traditional' }
    ],

    sections: M.withStyleFields([
      { id: 'hero', label: 'Hero',
        fields: [
          { k: 'kicker', label: 'Line above the names', type: 'text', ph: 'Save the date' },
          { k: 'nameA',  label: 'First name (empty = basics)', type: 'text' },
          { k: 'nameB',  label: 'Second name (empty = basics)', type: 'text' },
          { k: 'meta',   label: 'Line under the names', type: 'text' }
        ],
        list: { k: 'items', label: 'Background photo',
          blank: function () { return { src: 'mu-hero-17' }; },
          fields: [{ k: 'src', label: 'Photo', type: 'photo' }] } },
      { id: 'countdown', label: 'Countdown',
        fields: [
          { k: 'title', label: 'Section title (empty = hide)', type: 'text' },
          { k: 'date',  label: 'Count down to (empty = event date)', type: 'date' }
        ] },
      { id: 'couple', label: 'Hosts',
        fields: [
          { k: 'nameA',    label: 'Left name (empty = basics)', type: 'text' },
          { k: 'textA',    label: 'Left message', type: 'textarea' },
          { k: 'photoA',   label: 'Left photo (cut-out)', type: 'photo' },
          { k: 'photoMid', label: 'Centre photo', type: 'photo' },
          { k: 'nameB',    label: 'Right name (empty = basics)', type: 'text' },
          { k: 'textB',    label: 'Right message', type: 'textarea' },
          { k: 'photoB',   label: 'Right photo (cut-out)', type: 'photo' }
        ] },
      { id: 'gallery', label: 'Gallery mosaic',
        fields: [],
        list: { k: 'items', label: 'Photo',
          blank: function () { return { src: 'mu-gallery-38' }; },
          fields: [{ k: 'src', label: 'Photo', type: 'photo' }] } },
      { id: 'event', label: 'Programme',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'The programme' },
          { k: 'photo', label: 'Side photo', type: 'photo' }
        ],
        list: { k: 'items', label: 'Day / event',
          blank: function () { return { photo: 'mu-event-5', name: 'New event', l1: '', t1: '', l2: '', t2: '', l3: '', t3: '' }; },
          fields: [
            { k: 'photo', label: 'Photo', type: 'photo' },
            { k: 'name',  label: 'Name', type: 'text', ph: 'The Haldi' },
            { k: 'l1',    label: 'Row 1 label', type: 'text', ph: 'Welcome' },
            { k: 't1',    label: 'Row 1 time', type: 'text', ph: '03:00 PM' },
            { k: 'l2',    label: 'Row 2 label', type: 'text' },
            { k: 't2',    label: 'Row 2 time', type: 'text' },
            { k: 'l3',    label: 'Row 3 label', type: 'text' },
            { k: 't3',    label: 'Row 3 time', type: 'text' }
          ] } },
      M.rsvpSpec('RSVP'),
      { id: 'photos', label: 'Photo strip',
        fields: [],
        list: { k: 'items', label: 'Photo',
          blank: function () { return { src: 'mu-portfolio-14' }; },
          fields: [{ k: 'src', label: 'Photo', type: 'photo' }] } },
      M.contactSection('Footer & contact')
    ]),

    defaults: function () {
      return {
        basics: {
          nameA: 'Yash', nameB: 'Dipika', brand: 'Y & D',
          date: E.EVER_futureISO(6), time: '03:00 PM onwards',
          venue: 'The Grand Palms', city: 'Jaipur', dress: 'Traditional'
        },
        sections: {
          hero: { on: true, kicker: 'Save the date',
            nameA: '', nameB: '',
            meta: '25 Feb 2027 · The Grand Palms, Jaipur',
            items: [{ src: 'mu-hero-17' }, { src: 'mu-hero-18' }] },
          countdown: { on: true, title: '', date: '' },
          couple: { on: true,
            nameA: 'Yash Gupta', photoA: 'mu-couple-10',
            textA: 'A heart full of love and a soul full of hope — I can’t wait to begin this journey with you by my side.',
            photoMid: 'mu-couple-12',
            nameB: 'Dipika Sinha', photoB: 'mu-couple-11',
            textB: 'Today I marry my best friend. With joy in my heart and love in my eyes, I’m ready for forever.' },
          gallery: { on: true, items: [
            { src: 'mu-gallery-38' }, { src: 'mu-gallery-39' }, { src: 'mu-gallery-40' },
            { src: 'mu-gallery-44' },
            { src: 'mu-gallery-41' }, { src: 'mu-gallery-42' }, { src: 'mu-gallery-43' }
          ] },
          event: { on: true, title: 'The programme', photo: 'mu-event-4', items: [
            { photo: 'mu-event-5', name: 'The Haldi',
              l1: 'Welcome', t1: '03:00 PM', l2: 'Ceremony', t2: '05:00 PM', l3: 'Supper', t3: '08:00 PM' },
            { photo: 'mu-event-6', name: 'The Wedding',
              l1: 'Ceremony', t1: '03:00 PM', l2: 'Vows', t2: '05:00 PM', l3: 'Farewell', t3: '08:00 PM' },
            { photo: 'mu-event-7', name: 'The Reception',
              l1: 'Drinks', t1: '06:00 PM', l2: 'Dinner', t2: '08:00 PM', l3: 'Dancing', t3: '10:00 PM' }
          ] },
          rsvp: M.rsvpDefaults({ title: 'Will you attend?', photo: 'mu-rsvp-4' }),
          photos: { on: true, items: [
            { src: 'mu-portfolio-14' }, { src: 'mu-portfolio-15' }, { src: 'mu-portfolio-16' },
            { src: 'mu-portfolio-17' }, { src: 'mu-portfolio-18' }, { src: 'mu-portfolio-19' }
          ] },
          contact: M.contactDefaults()
        }
      };
    },

    render: render,
    mini: function (d, tpl, opts) { return M.miniWrap(d, tpl, opts, render); }
  });
})();
