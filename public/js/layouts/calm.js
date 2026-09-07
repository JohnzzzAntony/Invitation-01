/* ==========================================================================
   Ever RSVP — layout: calm  (Muhibbi "Korean Wedding Home", index-5.html)
   --------------------------------------------------------------------------
   Quiet, paper-like design: "Save the date" hero with three stacked photos
   and a big date, a circular countdown band, a two-up story slider, a mosaic
   gallery with captioned tiles, detail tiles, an RSVP panel over a photo and
   a photo strip.
   ========================================================================== */
(function () {
  'use strict';
  var E = window, M = window.MU;
  var ID = 'calm';

  var NAV = [
    ['countdown', 'Countdown'], ['story', 'Our story'], ['gallery', 'Gallery'],
    ['event', 'Details'], ['rsvp', 'RSVP'], ['photos', 'Photos']
  ];

  function body(d, tpl) {
    var B = d.basics;

    return M.build(d, ID, function (id, s) {
      if (id === 'hero') {
        var dt = E.EVER_dateObj(B.date);
        var dd = s.day || (dt ? String(dt.getDate()) : '25');
        var mm = s.month || (dt ? String(dt.getMonth() + 1) : '02');
        var yy = s.year || (dt ? String(dt.getFullYear()).slice(2) : '27');
        return M.sec(id, 'wpo-hero-static-s5',
          '<div class="container-fluid"><div class="wpo-hero-wrap"><div class="row">' +
            '<div class="col-lg-12 col-12"><div class="hero-item">' +
              '<div class="hero-contet"><h1>' + M.esc(s.headline) + '</h1></div>' +
              '<div class="hero-image">' +
                (s.items || []).map(function (p) {
                  return '<div class="image">' + M.img(p.src, '') + '</div>';
                }).join('') +
              '</div>' +
              '<div class="hero-date"><ul>' +
                '<li>' + M.esc(('0' + dd).slice(-2)) + '</li>' +
                '<li>' + M.esc(('0' + mm).slice(-2)) + '</li>' +
                '<li>' + M.esc(yy) + '</li>' +
              '</ul></div>' +
              '<div class="hero-bottom-item">' +
                '<h2>' + M.esc(B.nameA) + ' <span>&amp;</span> ' + M.esc(B.nameB) + '</h2>' +
                (s.meta ? '<p>' + M.esc(s.meta) + '</p>' : '') +
              '</div>' +
            '</div></div>' +
          '</div></div></div>', s);
      }

      if (id === 'countdown') {
        return M.sec(id, 'wpo-wedding-date',
          '<div class="container"><div class="wedding-date-wrap">' +
            (s.title ? M.title(s.title) : '') +
            '<div class="clock-grids">' + M.clock(s.date || B.date) + '</div>' +
          '</div></div>', s);
      }

      if (id === 'story') {
        var slides = (s.items || []).map(function (m) {
          return '<div class="wpo-story-all-item"><div class="row">' +
            '<div class="col-lg-7 col-md-6 col-12"><div class="wpo-story-left">' +
              '<div class="wpo-section-title-s2"><h2>' + M.esc(m.heading || s.title) + '</h2></div>' +
              '<div class="image">' + M.img(m.photoBig, m.title) + '</div>' +
            '</div></div>' +
            '<div class="col-lg-5 col-md-6 col-12"><div class="wpo-story-right">' +
              '<div class="story-item">' +
                '<div class="left-image inner-image">' + M.img(m.photoA, m.title) + '</div>' +
                '<div class="right-image inner-image">' + M.img(m.photoB, m.title) +
                  '<div class="story-content"><h3>' + M.esc(m.title) + '</h3><p>' + M.esc(m.text) + '</p></div>' +
                '</div>' +
              '</div>' +
            '</div></div>' +
          '</div></div>';
        });
        return M.sec(id, 'wpo-story-section-s4 section-padding',
          '<div class="container"><div class="wpo-story-wrap">' +
            M.slider(slides, { per: 1 }) +
          '</div></div>', s);
      }

      if (id === 'gallery') {
        return M.sec(id, 'wpo-gallery-section-s2 pt-0 section-padding',
          '<div class="container-fluid"><div class="sortable-gallery"><div class="row"><div class="col-lg-12">' +
            '<div class="gallery-grids gallery-container clearfix">' +
              (s.items || []).map(function (p) {
                if (p.caption) {
                  return '<div class="grid"><div class="middle-content">' + M.img(p.src, '') +
                    '<div class="title"><h2>' + M.esc(p.caption) + '</h2></div>' +
                  '</div></div>';
                }
                return '<div class="grid"><div class="img-holder">' +
                  '<a href="' + M.esc(M.photo(p.src)) + '" data-mu-zoom>' +
                    M.img(p.src, 'Gallery photo', 'img img-responsive') +
                    '<div class="hover-content">' + M.ti('plus') + '</div>' +
                  '</a></div></div>';
              }).join('') +
            '</div>' +
          '</div></div></div></div>', s);
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

      if (id === 'rsvp') {
        return M.sec(id, 'wpo-contact-section-s4 section-padding',
          '<div class="container-fluid"><div class="contact-wrap"><div class="row align-items-center">' +
            '<div class="col-lg-12 col-md-12"><div class="contact-image-bg">' +
              '<div class="bg-image">' + M.img(s.photo || 'mu-rsvp-2', '') + '</div>' +
              '<div class="contact-title"><h2>' + M.esc(s.title) + '</h2>' +
                (s.note ? '<p>' + M.esc(s.note) +
                  (s.deadline ? ' <b>' + M.esc(E.EVER_fmtLongDate(s.deadline)) + '</b>' : '') + '</p>' : '') +
              '</div>' +
              '<div class="wpo-contact-section-wrapper">' + M.rsvpForm(s) + '</div>' +
            '</div></div>' +
          '</div></div></div>', s);
      }

      if (id === 'photos') {
        return M.sec(id, 'wpo-portfolio-section-s4',
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
    label: 'Calm',
    events: ['wedding', 'baby'],

    basics: [
      { k: 'nameA', label: 'First host / guest of honour', type: 'text', ph: 'Sofia' },
      { k: 'nameB', label: 'Second host (optional)', type: 'text', ph: 'Michael' },
      { k: 'brand', label: 'Wordmark in the header', type: 'text', ph: 'S & M' },
      { k: 'date',  label: 'Date', type: 'date' },
      { k: 'time',  label: 'Time', type: 'text', ph: '11:00 AM' },
      { k: 'venue', label: 'Venue', type: 'text', ph: 'Hanok House' },
      { k: 'city',  label: 'City / region', type: 'text', ph: 'Seoul' },
      { k: 'dress', label: 'Dress code', type: 'text', ph: 'Soft neutrals' }
    ],

    sections: M.withStyleFields([
      { id: 'hero', label: 'Hero',
        fields: [
          { k: 'headline', label: 'Headline', type: 'text', ph: 'Save the date' },
          { k: 'meta',     label: 'Line under the names', type: 'text', ph: 'We are getting married' },
          { k: 'day',      label: 'Day (empty = from date)', type: 'text', ph: '25' },
          { k: 'month',    label: 'Month (empty = from date)', type: 'text', ph: '02' },
          { k: 'year',     label: 'Year, two digits (empty = from date)', type: 'text', ph: '27' }
        ],
        list: { k: 'items', label: 'Photo',
          blank: function () { return { src: 'mu-hero-9' }; },
          fields: [{ k: 'src', label: 'Photo', type: 'photo' }] } },
      { id: 'countdown', label: 'Countdown',
        fields: [
          { k: 'title', label: 'Section title (empty = hide)', type: 'text' },
          { k: 'date',  label: 'Count down to (empty = event date)', type: 'date' }
        ] },
      { id: 'story', label: 'Our story',
        fields: [{ k: 'title', label: 'Default heading', type: 'text', ph: 'Our journey together' }],
        list: { k: 'items', label: 'Chapter',
          blank: function () { return { heading: '', photoBig: 'mu-story-10', photoA: 'mu-story-11', photoB: 'mu-story-12', title: 'New chapter', text: '' }; },
          fields: [
            { k: 'heading',  label: 'Heading (empty = default)', type: 'text' },
            { k: 'photoBig', label: 'Large photo', type: 'photo' },
            { k: 'photoA',   label: 'Small photo', type: 'photo' },
            { k: 'photoB',   label: 'Photo behind the text', type: 'photo' },
            { k: 'title',    label: 'Title', type: 'text' },
            { k: 'text',     label: 'Text', type: 'textarea' }
          ] } },
      { id: 'gallery', label: 'Gallery mosaic',
        fields: [],
        list: { k: 'items', label: 'Tile',
          blank: function () { return { src: 'mu-gallery-7', caption: '' }; },
          fields: [
            { k: 'src',     label: 'Photo', type: 'photo' },
            { k: 'caption', label: 'Caption (turns the tile into a title card)', type: 'text' }
          ] } },
      { id: 'event', label: 'Detail tiles',
        fields: [{ k: 'title', label: 'Section title', type: 'text', ph: 'Happy to have you with us' }],
        list: { k: 'items', label: 'Tile',
          blank: function () { return { icon: 'icon-1.svg', title: 'New tile', text: '' }; },
          fields: [
            { k: 'icon',  label: 'Icon', type: 'select',
              options: [['icon-1.svg', 'Location'], ['icon-2.svg', 'Rings'], ['icon-3.svg', 'Ceremony'],
                        ['icon-4.svg', 'Dining'], ['icon-5.svg', 'Music'], ['icon-6.svg', 'Gift']] },
            { k: 'title', label: 'Title', type: 'text' },
            { k: 'text',  label: 'Text', type: 'textarea' }
          ] } },
      M.rsvpSpec('RSVP'),
      { id: 'photos', label: 'Photo strip',
        fields: [],
        list: { k: 'items', label: 'Photo',
          blank: function () { return { src: 'mu-portfolio-1' }; },
          fields: [{ k: 'src', label: 'Photo', type: 'photo' }] } },
      M.contactSection('Footer & contact')
    ]),

    defaults: function () {
      return {
        basics: {
          nameA: 'Sofia', nameB: 'Michael', brand: 'S & M',
          date: E.EVER_futureISO(6), time: '11:00 AM',
          venue: 'Hanok House', city: 'Seoul', dress: 'Soft neutrals'
        },
        sections: {
          hero: { on: true, headline: 'Save the date', meta: 'We are getting married',
            day: '', month: '', year: '',
            items: [{ src: 'mu-hero-9' }, { src: 'mu-hero-10' }, { src: 'mu-hero-11' }] },
          countdown: { on: true, title: '', date: '' },
          story: { on: true, title: 'Our journey together', items: [
            { heading: '', photoBig: 'mu-story-10', photoA: 'mu-story-11', photoB: 'mu-story-12',
              title: 'How we met', text: 'A coffee shop on a rainy afternoon, and the last free seat in the house.' },
            { heading: '', photoBig: 'mu-story-13', photoA: 'mu-story-14', photoB: 'mu-story-15',
              title: 'Our first date', text: 'Casual conversation that turned into hours of laughter neither of us expected.' }
          ] },
          gallery: { on: true, items: [
            { src: 'mu-gallery-7' }, { src: 'mu-gallery-8' }, { src: 'mu-gallery-9' },
            { src: 'mu-gallery-31', caption: 'Our lovely memories' },
            { src: 'mu-gallery-12' },
            { src: 'mu-gallery-11', caption: 'Our lovely memories' },
            { src: 'mu-gallery-13' }, { src: 'mu-gallery-14' }
          ] },
          event: { on: true, title: 'Happy to have you with us', items: [
            { icon: 'icon-1.svg', title: 'Location', text: 'Hanok House, Seoul — a short walk from the station.' },
            { icon: 'icon-2.svg', title: 'Ceremony', text: 'Eleven in the morning in the courtyard.' },
            { icon: 'icon-3.svg', title: 'Lunch', text: 'A long table under the eaves, straight after.' }
          ] },
          rsvp: M.rsvpDefaults({ photo: 'mu-rsvp-2' }),
          photos: { on: true, items: [
            { src: 'mu-portfolio-1' }, { src: 'mu-portfolio-2' }, { src: 'mu-portfolio-3' },
            { src: 'mu-portfolio-4' }, { src: 'mu-portfolio-5' }, { src: 'mu-portfolio-6' },
            { src: 'mu-portfolio-7' }
          ] },
          contact: M.contactDefaults()
        }
      };
    },

    render: render,
    mini: function (d, tpl, opts) { return M.miniWrap(d, tpl, opts, render); }
  });
})();
