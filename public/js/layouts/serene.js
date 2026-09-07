/* ==========================================================================
   Ever RSVP — layout: serene  (Muhibbi "Indo & Malay Wedding Home", index-7.html)
   --------------------------------------------------------------------------
   Three-panel hero with arched photos, a masonry gallery with a captioned
   centre tile, a wide video band, a three-column story slider, detail tiles,
   a framed RSVP card and a sliding photo strip.
   ========================================================================== */
(function () {
  'use strict';
  var E = window, M = window.MU;
  var ID = 'serene';

  var NAV = [
    ['gallery', 'Gallery'], ['story', 'Our story'], ['event', 'Details'],
    ['countdown', 'Countdown'], ['rsvp', 'RSVP'], ['photos', 'Photos']
  ];

  function body(d, tpl) {
    var B = d.basics;

    return M.build(d, ID, function (id, s) {
      if (id === 'hero') {
        function panel(photo, inner) {
          return '<div class="col col-lg-4 col-md-4 col-sm-6 col-12"><div class="hero-item">' +
            '<div class="image-wrap"><div class="image">' + M.img(photo, '') + '</div></div>' +
            '<div class="hero-text">' + inner + '</div>' +
          '</div></div>';
        }
        return M.sec(id, 'wpo-hero-static-s7',
          '<div class="container-fluid"><div class="wpo-hero-wrapper"><div class="row">' +
            panel(s.photo1, '<h1>' + M.esc(s.nameA || B.nameA) + ' <span>&amp;</span> ' +
              M.esc(s.nameB || B.nameB) + '</h1>') +
            panel(s.photo2, '<h2>' + M.esc(s.headline) + '</h2>') +
            panel(s.photo3, '<p>' + M.esc(s.meta) + '</p>') +
          '</div></div></div>', s);
      }

      if (id === 'gallery') {
        function tile(p) {
          if (!p) return '';
          if (p.caption) {
            return '<div class="grid"><div class="middle-content">' + M.img(p.src, '') +
              '<div class="title"><h2>' + M.esc(p.caption) + '</h2></div></div></div>';
          }
          return '<div class="grid"><div class="img-holder">' +
            '<a href="' + M.esc(M.photo(p.src)) + '" data-mu-zoom>' +
              M.img(p.src, 'Gallery photo', 'img img-responsive') +
              '<div class="hover-content">' + M.ti('plus') + '</div>' +
            '</a></div></div>';
        }
        var it = s.items || [];
        return M.sec(id, 'wpo-gallery-section-s4',
          '<div class="container"><div class="sortable-gallery"><div class="row"><div class="col-lg-12">' +
            '<div class="gallery-grids gallery-container clearfix">' +
              '<div class="item-1 flx-item">' + it.slice(0, 2).map(tile).join('') + '</div>' +
              '<div class="item-2">' + it.slice(2, 5).map(tile).join('') + '</div>' +
              '<div class="item-3 flx-item">' + it.slice(5, 7).map(tile).join('') + '</div>' +
            '</div>' +
          '</div></div></div></div>', s);
      }

      if (id === 'video') {
        var url = M.safe(s.url);
        return M.sec(id, 'wpo-video-section-s2',
          '<div class="container-fluid"><div class="video-image"><div class="bottom-image">' +
            M.img(s.photo, 'Video') +
            (url ? '<div class="video-wrap"><a class="video-btn" href="' + M.esc(url) +
              '" target="_blank" rel="noopener noreferrer" aria-label="Play video">' +
              '<i class="fi flaticon-play"></i></a></div>' : '') +
          '</div></div></div>', s);
      }

      if (id === 'story') {
        var slides = (s.items || []).map(function (m) {
          return '<div class="wpo-story-all-item"><div class="row align-items-center">' +
            '<div class="col col-xl-4 col-lg-3 col-12"><div class="wpo-image-item">' +
              '<div class="image inner-image">' + M.img(m.photoA, m.title) + '</div>' +
            '</div></div>' +
            '<div class="col col-xl-4 col-lg-6 col-12"><div class="wpo-story-right">' +
              '<div class="story-item"><div class="story-content">' +
                '<h3>' + M.esc(m.title) + '</h3><p>' + M.esc(m.text) + '</p>' +
              '</div></div>' +
            '</div></div>' +
            '<div class="col col-xl-4 col-lg-3 col-12"><div class="wpo-image-item">' +
              '<div class="image inner-image">' + M.img(m.photoB, m.title) + '</div>' +
            '</div></div>' +
          '</div></div>';
        });
        return M.sec(id, 'wpo-story-section-s6 section-padding',
          '<div class="container"><div class="wpo-story-wrap">' +
            (s.title ? '<div class="wpo-section-title"><h2>' + M.esc(s.title) + '</h2></div>' : '') +
            M.slider(slides, { per: 1 }) +
          '</div></div>', s);
      }

      if (id === 'event') {
        return M.sec(id, 'wpo-event-section',
          '<div class="wpo-event-wrap"><div class="container"><div class="row justify-content-center">' +
            (s.items || []).map(function (i2) {
              return '<div class="col-lg-4 col-md-6 col-sm-6 col-12"><div class="event-item">' +
                '<div class="icon"><img src="mu/images/event/' + M.esc(i2.icon || 'icon-1.svg') + '" alt=""/></div>' +
                '<div class="event-text"><h3>' + M.esc(i2.title) + '</h3><p>' + M.esc(i2.text) + '</p></div>' +
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
        return M.sec(id, 'wpo-contact-section-s6 section-padding',
          '<div class="container"><div class="contact-wrap"><div class="row align-items-center">' +
            '<div class="col-lg-12 col-md-12"><div class="wpo-contact-card"><div class="contact-all-item">' +
              '<div class="contact-title">' +
                '<div class="title-shape"><img src="mu/images/rsvp/shape-1.svg" alt=""/></div>' +
                '<h2>' + M.esc(s.title) + '</h2>' +
                (s.note ? '<p>' + M.esc(s.note) +
                  (s.deadline ? ' <b>' + M.esc(E.EVER_fmtLongDate(s.deadline)) + '</b>' : '') + '</p>' : '') +
              '</div>' +
              '<div class="wpo-contact-section-wrapper">' + M.rsvpForm(s) + '</div>' +
            '</div></div></div>' +
          '</div></div></div>' +
          '<div class="shape shape-left"><img src="mu/images/rsvp/shape-left-2.png" alt=""/></div>' +
          '<div class="shape shape-right"><img src="mu/images/rsvp/shape-right-2.png" alt=""/></div>', s);
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
    label: 'Serene',
    events: ['wedding', 'birthday', 'housewarming'],

    basics: [
      { k: 'nameA', label: 'First host / guest of honour', type: 'text', ph: 'Yusuf' },
      { k: 'nameB', label: 'Second host (optional)', type: 'text', ph: 'Fauziah' },
      { k: 'brand', label: 'Wordmark in the header', type: 'text', ph: 'Y & F' },
      { k: 'date',  label: 'Date', type: 'date' },
      { k: 'time',  label: 'Time', type: 'text', ph: '05:00 PM onwards' },
      { k: 'venue', label: 'Venue', type: 'text', ph: 'Taman Sari' },
      { k: 'city',  label: 'City / region', type: 'text', ph: 'Kuala Lumpur' },
      { k: 'dress', label: 'Dress code', type: 'text', ph: 'Traditional or formal' }
    ],

    sections: M.withStyleFields([
      { id: 'hero', label: 'Hero',
        fields: [
          { k: 'photo1',   label: 'Left photo', type: 'photo' },
          { k: 'nameA',    label: 'First name (empty = basics)', type: 'text' },
          { k: 'nameB',    label: 'Second name (empty = basics)', type: 'text' },
          { k: 'photo2',   label: 'Centre photo', type: 'photo' },
          { k: 'headline', label: 'Centre line', type: 'text', ph: 'Save the date' },
          { k: 'photo3',   label: 'Right photo', type: 'photo' },
          { k: 'meta',     label: 'Right line', type: 'text', ph: '25 Feb 2027, Kuala Lumpur' }
        ] },
      { id: 'gallery', label: 'Gallery mosaic',
        fields: [],
        list: { k: 'items', label: 'Tile',
          blank: function () { return { src: 'mu-gallery-25', caption: '' }; },
          fields: [
            { k: 'src',     label: 'Photo', type: 'photo' },
            { k: 'caption', label: 'Caption (turns the tile into a title card)', type: 'text' }
          ] } },
      { id: 'video', label: 'Video band',
        fields: [
          { k: 'photo', label: 'Still image', type: 'photo' },
          { k: 'url',   label: 'Video link', type: 'text', ph: 'https://youtube.com/…' }
        ] },
      { id: 'story', label: 'Our story',
        fields: [{ k: 'title', label: 'Section title', type: 'text', ph: 'Our journey together' }],
        list: { k: 'items', label: 'Chapter',
          blank: function () { return { photoA: 'mu-story-20', photoB: 'mu-story-21', title: 'New chapter', text: '' }; },
          fields: [
            { k: 'photoA', label: 'Left photo', type: 'photo' },
            { k: 'title',  label: 'Title', type: 'text' },
            { k: 'text',   label: 'Text', type: 'textarea' },
            { k: 'photoB', label: 'Right photo', type: 'photo' }
          ] } },
      { id: 'event', label: 'Detail tiles',
        fields: [],
        list: { k: 'items', label: 'Tile',
          blank: function () { return { icon: 'icon-1.svg', title: 'New tile', text: '' }; },
          fields: [
            { k: 'icon',  label: 'Icon', type: 'select',
              options: [['icon-1.svg', 'Location'], ['icon-2.svg', 'Rings'], ['icon-3.svg', 'Ceremony'],
                        ['icon-4.svg', 'Dining'], ['icon-5.svg', 'Music'], ['icon-6.svg', 'Gift']] },
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
          nameA: 'Yusuf', nameB: 'Fauziah', brand: 'Y & F',
          date: E.EVER_futureISO(5), time: '05:00 PM onwards',
          venue: 'Taman Sari', city: 'Kuala Lumpur', dress: 'Traditional or formal'
        },
        sections: {
          hero: { on: true,
            photo1: 'mu-hero-14', photo2: 'mu-hero-15', photo3: 'mu-hero-16',
            nameA: '', nameB: '',
            headline: 'Save the date',
            meta: '25 Feb 2027 · Taman Sari, Kuala Lumpur' },
          gallery: { on: true, items: [
            { src: 'mu-gallery-25' }, { src: 'mu-gallery-26' }, { src: 'mu-gallery-27' },
            { src: 'mu-gallery-31', caption: 'Our lovely memories' }, { src: 'mu-gallery-28' },
            { src: 'mu-gallery-29' }, { src: 'mu-gallery-30' }
          ] },
          video: { on: true, photo: 'mu-video-2', url: 'https://www.youtube.com/watch?v=IvBToRiExbk' },
          story: { on: true, title: 'Our journey together', items: [
            { photoA: 'mu-story-20', photoB: 'mu-story-21', title: 'How we met',
              text: 'A coffee shop on a rainy afternoon, and the last free seat in the house.' },
            { photoA: 'mu-story-22', photoB: 'mu-story-23', title: 'Our first date',
              text: 'Casual conversation that turned into hours of laughter neither of us expected.' }
          ] },
          event: { on: true, items: [
            { icon: 'icon-1.svg', title: 'Location', text: 'Taman Sari, Kuala Lumpur — parking on the east side.' },
            { icon: 'icon-2.svg', title: 'Ceremony', text: 'Five in the evening in the garden pavilion.' },
            { icon: 'icon-3.svg', title: 'Reception', text: 'Dinner at seven, with music until late.' }
          ] },
          countdown: { on: true, title: 'Counting the days', label: 'Until we celebrate', date: '',
            quote: 'A thousand small moments led us here.' },
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
