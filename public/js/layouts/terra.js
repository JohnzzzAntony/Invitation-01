/* ==========================================================================
   Invitara — layout: terra  (Muhibbi "African Wedding Home", index-6.html)
   --------------------------------------------------------------------------
   Warm, bold design: full-bleed hero slider with the names set against a
   flourish, two tall portraits framing a shared message card, a wide gallery
   with side panels, an offset story slider, the RSVP panel and detail tiles.
   ========================================================================== */
(function () {
  'use strict';
  var E = window, M = window.MU;
  var ID = 'terra';

  var NAV = [
    ['couple', 'Hosts'], ['gallery', 'Gallery'], ['story', 'Our story'],
    ['countdown', 'Countdown'], ['rsvp', 'RSVP'], ['event', 'Details']
  ];

  function body(d, tpl) {
    var B = d.basics;

    return M.build(d, ID, function (id, s) {
      if (id === 'hero') {
        var slides = (s.items || []).map(function (sl) {
          return '<div class="slide-inner slide-bg-image" style="background-image:url(' +
              M.esc(M.photo(sl.photo)) + ')">' +
              '<div class="container-fluid"><div class="slide-content"><div class="slide-title">' +
                '<div class="hero-left">' +
                  '<div class="shape"><img src="mu/images/hero/text-shape-2.svg" alt=""/></div>' +
                  (sl.kicker ? '<p>' + M.esc(sl.kicker) + '</p>' : '') +
                  '<h1>' + M.esc(sl.line1 || B.nameA) +
                    ' <img src="mu/images/hero/and.svg" alt="and" class="shape-text"/> ' +
                    M.esc(sl.line2 || B.nameB) + '</h1>' +
                '</div>' +
                (sl.meta ? '<div class="hero-right"><h2>' + M.esc(sl.meta) + '</h2></div>' : '') +
              '</div></div></div>' +
            '</div>';
        });
        return M.sec(id, 'wpo-hero-static-s6',
          '<div class="swiper-container">' +
            M.slider(slides, { per: 1, nav: false, cls: 'mu-hero-slider', slideCls: 'swiper-slide' }) +
          '</div>', s);
      }

      if (id === 'couple') {
        return M.sec(id, 'wpo-couple-section-s5 section-padding pb-0',
          '<div class="container-fluid"><div class="wpo-couple-wrap"><div class="row align-items-center">' +
            '<div class="col col-lg-4 col-md-12 col-12"><div class="couple-card">' +
              '<div class="image inner-image">' + M.img(s.photoA, s.nameA || B.nameA) + '</div>' +
            '</div></div>' +
            '<div class="col col-lg-4 col-md-12 col-12"><div class="couple-middle"><div class="couple-item">' +
              '<div class="couple-middle-content">' +
                '<div class="shape"><img src="mu/images/couple/shape-3.svg" alt=""/></div>' +
                '<div class="couple-text"><h2>' + M.esc(s.nameA || B.nameA) + '</h2><p>' + M.esc(s.textA) + '</p></div>' +
                '<div class="line"></div>' +
                '<div class="couple-text"><h2>' + M.esc(s.nameB || B.nameB) + '</h2><p>' + M.esc(s.textB) + '</p></div>' +
              '</div>' +
            '</div></div></div>' +
            '<div class="col col-lg-4 col-md-12 col-12"><div class="couple-card">' +
              '<div class="image inner-image">' + M.img(s.photoB, s.nameB || B.nameB) + '</div>' +
            '</div></div>' +
          '</div></div></div>', s);
      }

      if (id === 'gallery') {
        function tile(p) {
          return '<div class="img-holder"><a href="' + M.esc(M.photo(p.src)) + '" data-mu-zoom>' +
            M.img(p.src, 'Gallery photo', 'img img-responsive') +
            '<div class="hover-content">' + M.ti('plus') + '</div></a></div>';
        }
        var items = s.items || [];
        var left = items[0], right = items[items.length - 1];
        var mid = items.slice(1, -1);
        return M.sec(id, 'wpo-gallery-section-s3 section-padding',
          '<div class="container-fluid"><div class="gallery-main-wrap"><div class="row align-items-center">' +
            '<div class="col-lg-2 col-md-6 col-sm-6 order-lg-1 order-2">' +
              '<div class="gallery-side-img">' + (left ? tile(left) : '') + '</div>' +
            '</div>' +
            '<div class="col-lg-8 order-lg-2 col-sm-12 order-3"><div class="sortable-gallery">' +
              '<div class="gallery-grids clearfix">' +
                mid.map(function (p) { return '<div class="grid">' + tile(p) + '</div>'; }).join('') +
              '</div>' +
            '</div></div>' +
            '<div class="col-lg-2 col-md-6 col-sm-6 order-lg-3 order-2">' +
              '<div class="gallery-side-img">' + (right && right !== left ? tile(right) : '') + '</div>' +
            '</div>' +
          '</div></div></div>', s);
      }

      if (id === 'story') {
        var slides = (s.items || []).map(function (m) {
          return '<div class="wpo-story-all-item"><div class="row">' +
            '<div class="col col-lg-7 col-md-6 col-12 order-lg-2"><div class="wpo-story-left">' +
              '<div class="image inner-image">' + M.img(m.photoBig, m.title) + '</div>' +
            '</div></div>' +
            '<div class="col col-lg-5 col-md-6 col-12 order-lg-1"><div class="wpo-story-right">' +
              '<div class="story-item">' +
                '<div class="left-image inner-image">' + M.img(m.photoSmall, m.title) + '</div>' +
                '<div class="right-image"><div class="story-content">' +
                  '<h3>' + M.esc(m.title) + '</h3><p>' + M.esc(m.text) + '</p>' +
                '</div></div>' +
              '</div>' +
            '</div></div>' +
          '</div></div>';
        });
        return M.sec(id, 'wpo-story-section-s5 section-padding pt-0',
          '<div class="container"><div class="wpo-story-wrap">' + M.title(s.title) +
            M.slider(slides, { per: 1 }) +
          '</div></div>', s);
      }

      if (id === 'countdown') {
        return M.sec(id, 'wpo-wedding-date',
          '<div class="container"><div class="wedding-date-wrap">' +
            (s.title ? M.title(s.title) : '') +
            '<div class="clock-grids">' + M.clock(s.date || B.date) + '</div>' +
          '</div></div>', s);
      }

      if (id === 'rsvp') {
        return M.sec(id, 'wpo-contact-section-s5 section-padding',
          '<div class="container-fluid"><div class="contact-wrap"><div class="row align-items-center">' +
            (s.photo === '' ? '' :
            '<div class="col-lg-5"><div class="contact-left">' +
              '<div class="image inner-image">' + M.img(s.photo || 'mu-rsvp-3', '') + '</div>' +
            '</div></div>') +
            '<div class="col-lg-' + (s.photo === '' ? '12' : '7') + ' col-md-12">' +
              '<div class="wpo-contact-section-wrapper"><div class="contact-title">' +
                '<div class="title-image"><img src="mu/images/section-title-icon-2.svg" alt=""/></div>' +
                '<h2>' + M.esc(s.title) + '</h2>' +
                (s.note ? '<p>' + M.esc(s.note) +
                  (s.deadline ? ' <b>' + M.esc(E.EVER_fmtLongDate(s.deadline)) + '</b>' : '') + '</p>' : '') +
              '</div>' + M.rsvpForm(s) + '</div>' +
            '</div>' +
          '</div></div></div>', s);
      }

      if (id === 'event') {
        return M.sec(id, 'wpo-event-section-s4',
          '<div class="wpo-event-wrap"><div class="container">' +
            (s.title ? '<div class="wpo-section-title"><h2>' + M.esc(s.title) + '</h2></div>' : '') +
            '<div class="row justify-content-center">' +
              (s.items || []).map(function (it) {
                return '<div class="col-lg-4 col-md-6 col-sm-6 col-12"><div class="event-item">' +
                  '<div class="icon"><img src="mu/images/event/' + M.esc(it.icon || 'icon-1.svg') + '" alt=""/></div>' +
                  '<div class="event-text"><h3>' + M.esc(it.title) + '</h3><p>' + M.esc(it.text) + '</p></div>' +
                '</div></div>';
              }).join('') +
            '</div>' +
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
    label: 'Terra',
    events: ['wedding', 'birthday'],

    basics: [
      { k: 'nameA', label: 'First host / guest of honour', type: 'text', ph: 'Zola' },
      { k: 'nameB', label: 'Second host (optional)', type: 'text', ph: 'Kwame' },
      { k: 'brand', label: 'Wordmark in the header', type: 'text', ph: 'Z & K' },
      { k: 'date',  label: 'Date', type: 'date' },
      { k: 'time',  label: 'Time', type: 'text', ph: '03:00 PM onwards' },
      { k: 'venue', label: 'Venue', type: 'text', ph: 'The Courtyard' },
      { k: 'city',  label: 'City / region', type: 'text', ph: 'Accra' },
      { k: 'dress', label: 'Dress code', type: 'text', ph: 'Bright colours welcome' }
    ],

    sections: M.withStyleFields([
      { id: 'hero', label: 'Hero slider',
        fields: [],
        list: { k: 'items', label: 'Slide',
          blank: function () { return { photo: 'mu-hero-12', kicker: '', line1: '', line2: '', meta: '' }; },
          fields: [
            { k: 'photo',  label: 'Background photo', type: 'photo' },
            { k: 'kicker', label: 'Line above the names', type: 'text' },
            { k: 'line1',  label: 'First name (empty = basics)', type: 'text' },
            { k: 'line2',  label: 'Second name (empty = basics)', type: 'text' },
            { k: 'meta',   label: 'Line on the right', type: 'text' }
          ] } },
      { id: 'couple', label: 'Hosts',
        fields: [
          { k: 'photoA', label: 'Left photo', type: 'photo' },
          { k: 'nameA',  label: 'First name (empty = basics)', type: 'text' },
          { k: 'textA',  label: 'First message', type: 'textarea' },
          { k: 'nameB',  label: 'Second name (empty = basics)', type: 'text' },
          { k: 'textB',  label: 'Second message', type: 'textarea' },
          { k: 'photoB', label: 'Right photo', type: 'photo' }
        ] },
      { id: 'gallery', label: 'Gallery',
        fields: [],
        list: { k: 'items', label: 'Photo',
          blank: function () { return { src: 'mu-gallery-16' }; },
          fields: [{ k: 'src', label: 'Photo', type: 'photo' }] } },
      { id: 'story', label: 'Our story',
        fields: [{ k: 'title', label: 'Section title', type: 'text', ph: 'Our journey together' }],
        list: { k: 'items', label: 'Chapter',
          blank: function () { return { photoBig: 'mu-story-17', photoSmall: 'mu-story-16', title: 'New chapter', text: '' }; },
          fields: [
            { k: 'photoBig',   label: 'Large photo', type: 'photo' },
            { k: 'photoSmall', label: 'Small photo', type: 'photo' },
            { k: 'title',      label: 'Title', type: 'text' },
            { k: 'text',       label: 'Text', type: 'textarea' }
          ] } },
      { id: 'countdown', label: 'Countdown',
        fields: [
          { k: 'title', label: 'Section title (empty = hide)', type: 'text' },
          { k: 'date',  label: 'Count down to (empty = event date)', type: 'date' }
        ] },
      M.rsvpSpec('RSVP'),
      { id: 'event', label: 'Detail tiles',
        fields: [{ k: 'title', label: 'Section title', type: 'text' }],
        list: { k: 'items', label: 'Tile',
          blank: function () { return { icon: 'icon-1.svg', title: 'New tile', text: '' }; },
          fields: [
            { k: 'icon',  label: 'Icon', type: 'select',
              options: [['icon-1.svg', 'Location'], ['icon-2.svg', 'Rings'], ['icon-3.svg', 'Ceremony'],
                        ['icon-4.svg', 'Dining'], ['icon-5.svg', 'Music'], ['icon-6.svg', 'Gift']] },
            { k: 'title', label: 'Title', type: 'text' },
            { k: 'text',  label: 'Text', type: 'textarea' }
          ] } },
      M.contactSection('Footer & contact')
    ]),

    defaults: function () {
      return {
        basics: {
          nameA: 'Zola', nameB: 'Kwame', brand: 'Z & K',
          date: E.EVER_futureISO(5), time: '03:00 PM onwards',
          venue: 'The Courtyard', city: 'Accra', dress: 'Bright colours welcome'
        },
        sections: {
          hero: { on: true, items: [
            { photo: 'mu-hero-12', kicker: 'We are getting married', line1: '', line2: '',
              meta: '25 Feb 2027 · The Courtyard, Accra' },
            { photo: 'mu-hero-13', kicker: 'Save the date', line1: '', line2: '',
              meta: 'Come early, stay late' }
          ] },
          couple: { on: true,
            photoA: 'mu-couple-8', photoB: 'mu-couple-9',
            nameA: 'Michael Henry',
            textA: 'A heart full of love and a soul full of hope — I can’t wait to begin this journey with you by my side.',
            nameB: 'Amanda Sofia',
            textB: 'Today I marry my best friend. With joy in my heart and love in my eyes, I’m ready for forever.' },
          gallery: { on: true, items: [
            { src: 'mu-gallery-15' }, { src: 'mu-gallery-16' }, { src: 'mu-gallery-17' },
            { src: 'mu-gallery-18' }, { src: 'mu-gallery-19' }, { src: 'mu-gallery-20' },
            { src: 'mu-gallery-21' }, { src: 'mu-gallery-22' }, { src: 'mu-gallery-23' },
            { src: 'mu-gallery-24' }
          ] },
          story: { on: true, title: 'Our journey together', items: [
            { photoBig: 'mu-story-17', photoSmall: 'mu-story-16', title: 'How we met',
              text: 'A coffee shop on a rainy afternoon, and the last free seat in the house.' },
            { photoBig: 'mu-story-19', photoSmall: 'mu-story-18', title: 'Our first date',
              text: 'Casual conversation that turned into hours of laughter neither of us expected.' }
          ] },
          countdown: { on: true, title: '', date: '' },
          rsvp: M.rsvpDefaults({ photo: 'mu-rsvp-3' }),
          event: { on: true, title: '', items: [
            { icon: 'icon-1.svg', title: 'Location', text: 'The Courtyard, Accra — gates open at two.' },
            { icon: 'icon-2.svg', title: 'Ceremony', text: 'Three in the afternoon, under the mango tree.' },
            { icon: 'icon-3.svg', title: 'The party', text: 'Food, drums and dancing until the small hours.' }
          ] },
          contact: M.contactDefaults()
        }
      };
    },

    render: render,
    mini: function (d, tpl, opts) { return M.miniWrap(d, tpl, opts, render); }
  });
})();
