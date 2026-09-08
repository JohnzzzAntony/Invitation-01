/* ==========================================================================
   Invitara — layout: heritage  (Muhibbi "Senior Wedding Home", index-10.html)
   --------------------------------------------------------------------------
   Generous, unhurried design for milestone celebrations: a hero slider with
   flourishes around the headline, a wide pull quote flanked by two photos, a
   horizontal story slider, a gallery slider, detail tiles, a centred RSVP
   card with corner flourishes and a photo strip.
   ========================================================================== */
(function () {
  'use strict';
  var E = window, M = window.MU;
  var ID = 'heritage';

  var NAV = [
    ['quote', 'Welcome'], ['story', 'Our story'], ['gallery', 'Gallery'],
    ['event', 'Details'], ['countdown', 'Countdown'], ['rsvp', 'RSVP']
  ];

  function body(d, tpl) {
    var B = d.basics;

    return M.build(d, ID, function (id, s) {
      if (id === 'hero') {
        var slides = (s.items || []).map(function (sl) {
          return '<div class="slide-inner slide-bg-image" style="background-image:url(' +
              M.esc(M.photo(sl.photo)) + ')">' +
              '<div class="container-fluid"><div class="wpo-hero-wrapper"><div class="slide-content">' +
                '<div class="slide-title">' +
                  '<img src="mu/images/hero/text-shape-2.svg" alt="" class="text-shape"/>' +
                  '<h1>' + M.esc(sl.headline || s.headline) + '</h1>' +
                  '<img src="mu/images/hero/text-shape-1.svg" alt=""/>' +
                '</div>' +
                '<div class="hero-item">' +
                  (sl.meta ? '<p>' + M.esc(sl.meta) + '</p>' : '') +
                  '<h2>' + M.esc(B.nameA) + ' <img src="mu/images/hero/and.svg" alt="and"/>' +
                    M.esc(B.nameB) + '</h2>' +
                '</div>' +
              '</div></div></div>' +
            '</div>';
        });
        return M.sec(id, 'wpo-hero-static-s10',
          '<div class="swiper-container">' +
            M.slider(slides, { per: 1, nav: false, cls: 'mu-hero-slider', slideCls: 'swiper-slide' }) +
          '</div>', s);
      }

      if (id === 'quote') {
        return M.sec(id, 'wpo-quote-section-s3',
          '<div class="container-fluid"><div class="quote-wrap">' +
            '<div class="row text-center align-items-center"><div class="col-lg-12 col-12">' +
              '<div class="quote-all-content">' +
                (s.photoL ? '<div class="image">' + M.img(s.photoL, '') + '</div>' : '') +
                '<div class="quote-title">' +
                  '<div class="quote-title-shape"><img src="mu/images/quote/shape-3.svg" alt=""/></div>' +
                  '<h2>' + M.esc(s.title) + '</h2>' +
                  '<div class="line"></div>' +
                  (s.text ? '<p>' + M.esc(s.text) + '</p>' : '') +
                '</div>' +
                (s.photoR ? '<div class="image">' + M.img(s.photoR, '') + '</div>' : '') +
              '</div>' +
            '</div></div>' +
          '</div></div>', s);
      }

      if (id === 'story') {
        var items = (s.items || []).map(function (m) {
          return '<div class="item">' + M.img(m.photo, m.title) +
            '<div class="content">' +
              (m.year ? '<span>' + M.esc(m.year) + '</span>' : '') +
              '<h3>' + M.esc(m.title) + '</h3>' +
              '<div class="text"><p>' + M.esc(m.text) + '</p></div>' +
            '</div>' +
          '</div>';
        });
        return M.sec(id, 'wpo-story-section-s8 section-padding',
          '<div class="container-fliud"><div class="wpo-story-wrap">' +
            '<div class="row"><div class="col-lg-12 col-12">' +
              (s.title ? '<div class="wpo-section-title"><h2>' + M.esc(s.title) + '</h2></div>' : '') +
            '</div></div>' +
            M.slider(items, { per: 3, cls: 'slider' }) +
          '</div></div>', s);
      }

      if (id === 'gallery') {
        var tiles = (s.items || []).map(function (p) {
          return '<div class="grid"><div class="img-holder">' +
            '<a href="' + M.esc(M.photo(p.src)) + '" data-mu-zoom>' +
              M.img(p.src, 'Gallery photo', 'img img-responsive') +
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

      if (id === 'event') {
        return M.sec(id, 'wpo-event-section-s7',
          '<div class="wpo-event-wrap"><div class="container"><div class="row justify-content-center">' +
            (s.items || []).map(function (it) {
              return '<div class="col-lg-4 col-md-6 col-sm-6 col-12"><div class="event-item">' +
                '<div class="icon"><img src="mu/images/event/' + M.esc(it.icon || 'icon-4.svg') + '" alt=""/></div>' +
                '<div class="event-text"><h3>' + M.esc(it.title) + '</h3><p>' + M.esc(it.text) + '</p></div>' +
              '</div></div>';
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

      if (id === 'rsvp') {
        return M.sec(id, 'wpo-contact-section-s9 section-padding',
          '<div class="container"><div class="contact-wrap"><div class="row align-items-center">' +
            '<div class="col-lg-12 col-md-12"><div class="contact-all-item">' +
              '<div class="contact-title">' +
                '<div class="title-shape"><img src="mu/images/rsvp/shape-1.svg" alt=""/></div>' +
                '<h2>' + M.esc(s.title) + '</h2>' +
                (s.note ? '<p>' + M.esc(s.note) +
                  (s.deadline ? ' <b>' + M.esc(E.EVER_fmtLongDate(s.deadline)) + '</b>' : '') + '</p>' : '') +
              '</div>' +
              '<div class="wpo-contact-section-wrapper">' + M.rsvpForm(s) + '</div>' +
            '</div></div>' +
          '</div></div></div>' +
          '<div class="shape shape-left"><img src="mu/images/rsvp/shape-left-4.png" alt=""/></div>' +
          '<div class="shape shape-left-2"><img src="mu/images/rsvp/shape-left-5.png" alt=""/></div>' +
          '<div class="shape shape-right"><img src="mu/images/rsvp/shape-right-4.png" alt=""/></div>' +
          '<div class="shape shape-right-2"><img src="mu/images/rsvp/shape-right-5.png" alt=""/></div>', s);
      }

      if (id === 'photos') {
        var strip = (s.items || []).map(function (p, i) {
          return '<div class="portfolio-image' + (i % 2 ? ' s1' : '') + '">' +
            '<a href="' + M.esc(M.photo(p.src)) + '" data-mu-zoom>' +
              M.img(p.src, 'Photo', (i % 2 ? 'even ' : '') + 'img img-responsive') +
              '<div class="hover-content">' + M.ti('plus') + '</div>' +
            '</a></div>';
        });
        return M.sec(id, 'wpo-portfolio-section-s3 pt-0',
          '<div class="container-fluid"><div class="portfolio-all-items">' +
            '<div class="portfolio-wrap">' + M.slider(strip, { per: 4 }) + '</div>' +
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
    label: 'Heritage',
    events: ['anniversary', 'gala', 'wedding'],

    basics: [
      { k: 'nameA', label: 'First host / guest of honour', type: 'text', ph: 'Lily' },
      { k: 'nameB', label: 'Second host (optional)', type: 'text', ph: 'Mark' },
      { k: 'brand', label: 'Wordmark in the header', type: 'text', ph: 'L & M' },
      { k: 'date',  label: 'Date', type: 'date' },
      { k: 'time',  label: 'Time', type: 'text', ph: '06:00 PM onwards' },
      { k: 'venue', label: 'Venue', type: 'text', ph: 'The Assembly Rooms' },
      { k: 'city',  label: 'City / region', type: 'text', ph: 'Richardson' },
      { k: 'dress', label: 'Dress code', type: 'text', ph: 'Evening dress' }
    ],

    sections: M.withStyleFields([
      { id: 'hero', label: 'Hero slider',
        fields: [{ k: 'headline', label: 'Default headline', type: 'text', ph: 'We’re getting married' }],
        list: { k: 'items', label: 'Slide',
          blank: function () { return { photo: 'mu-hero-19', headline: '', meta: '' }; },
          fields: [
            { k: 'photo',    label: 'Background photo', type: 'photo' },
            { k: 'headline', label: 'Headline (empty = default)', type: 'text' },
            { k: 'meta',     label: 'Line above the names', type: 'text' }
          ] } },
      { id: 'quote', label: 'Pull quote',
        fields: [
          { k: 'photoL', label: 'Left photo', type: 'photo' },
          { k: 'title',  label: 'Quote', type: 'textarea' },
          { k: 'text',   label: 'Paragraph', type: 'textarea' },
          { k: 'photoR', label: 'Right photo', type: 'photo' }
        ] },
      { id: 'story', label: 'Our story',
        fields: [{ k: 'title', label: 'Section title', type: 'text', ph: 'Our journey together' }],
        list: { k: 'items', label: 'Chapter',
          blank: function () { return { photo: 'mu-story-30', year: '', title: 'New chapter', text: '' }; },
          fields: [
            { k: 'photo', label: 'Photo', type: 'photo' },
            { k: 'year',  label: 'Year', type: 'text' },
            { k: 'title', label: 'Title', type: 'text' },
            { k: 'text',  label: 'Text', type: 'textarea' }
          ] } },
      { id: 'gallery', label: 'Gallery',
        fields: [{ k: 'title', label: 'Section title', type: 'text', ph: 'Our awesome gallery' }],
        list: { k: 'items', label: 'Photo',
          blank: function () { return { src: 'mu-gallery-32' }; },
          fields: [{ k: 'src', label: 'Photo', type: 'photo' }] } },
      { id: 'event', label: 'Detail tiles',
        fields: [],
        list: { k: 'items', label: 'Tile',
          blank: function () { return { icon: 'icon-4.svg', title: 'New tile', text: '' }; },
          fields: [
            { k: 'icon',  label: 'Icon', type: 'select',
              options: [['icon-4.svg', 'Location'], ['icon-5.svg', 'Rings'], ['icon-6.svg', 'Ceremony'],
                        ['icon-1.svg', 'Map pin'], ['icon-2.svg', 'Register'], ['icon-3.svg', 'Vows']] },
            { k: 'title', label: 'Title', type: 'text' },
            { k: 'text',  label: 'Text', type: 'textarea' }
          ] } },
      { id: 'countdown', label: 'Countdown',
        fields: [
          { k: 'title', label: 'Section title', type: 'text' },
          { k: 'label', label: 'Label above the timer', type: 'text' },
          { k: 'date',  label: 'Count down to (empty = event date)', type: 'date' },
          { k: 'quote', label: 'Quote under the timer', type: 'textarea' }
        ] },
      M.rsvpSpec('RSVP'),
      { id: 'photos', label: 'Photo strip',
        fields: [],
        list: { k: 'items', label: 'Photo',
          blank: function () { return { src: 'mu-portfolio-8' }; },
          fields: [{ k: 'src', label: 'Photo', type: 'photo' }] } },
      M.contactSection('Footer & contact')
    ]),

    defaults: function () {
      return {
        basics: {
          nameA: 'Lily', nameB: 'Mark', brand: 'L & M',
          date: E.EVER_futureISO(4), time: '06:00 PM onwards',
          venue: 'The Assembly Rooms', city: 'Richardson', dress: 'Evening dress'
        },
        sections: {
          hero: { on: true, headline: 'We’re getting married', items: [
            { photo: 'mu-hero-19', headline: '', meta: '25 Feb 2027 · Richardson, California' },
            { photo: 'mu-hero-20', headline: '', meta: 'Drinks from six, dinner at eight' }
          ] },
          quote: { on: true,
            photoL: 'mu-quote-1', photoR: 'mu-quote-2',
            title: 'After a lifetime of journeys, we found forever in each other’s hearts.',
            text: 'Each glance reminds us of every reason we chose one another the first time — and somehow there are new reasons every day.' },
          story: { on: true, title: 'Our journey together', items: [
            { photo: 'mu-story-30', year: '1975', title: 'How we met',
              text: 'A dance hall, a borrowed jacket and a song neither of us can name any more.' },
            { photo: 'mu-story-31', year: '1978', title: 'Our first home',
              text: 'Two rooms, one kettle, and a view of somebody else’s garden.' },
            { photo: 'mu-story-32', year: 'Today', title: 'Still here',
              text: 'Children, grandchildren, and the same argument about the thermostat.' }
          ] },
          gallery: { on: true, title: 'Our awesome gallery', items: [
            { src: 'mu-gallery-32' }, { src: 'mu-gallery-33' }, { src: 'mu-gallery-34' },
            { src: 'mu-gallery-35' }, { src: 'mu-gallery-36' }, { src: 'mu-gallery-37' }
          ] },
          event: { on: true, items: [
            { icon: 'icon-4.svg', title: 'Location', text: 'The Assembly Rooms, Richardson — lift to the first floor.' },
            { icon: 'icon-5.svg', title: 'Reception', text: 'Drinks from six in the long gallery.' },
            { icon: 'icon-6.svg', title: 'Dinner', text: 'Served at eight, with speeches to follow.' }
          ] },
          countdown: { on: true, title: 'Counting the days', label: 'Until we celebrate', date: '',
            quote: 'After all these years, still the best company in the room.' },
          rsvp: M.rsvpDefaults({ title: 'Will you attend?', photo: '' }),
          photos: { on: true, items: [
            { src: 'mu-portfolio-8' }, { src: 'mu-portfolio-9' }, { src: 'mu-portfolio-10' },
            { src: 'mu-portfolio-11' }, { src: 'mu-portfolio-12' }, { src: 'mu-portfolio-13' }
          ] },
          contact: M.contactDefaults()
        }
      };
    },

    render: render,
    mini: function (d, tpl, opts) { return M.miniWrap(d, tpl, opts, render); }
  });
})();
