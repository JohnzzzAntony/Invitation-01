/* ==========================================================================
   Invitara — layout: herald  (Muhibbi "Announcement Home 1", index-2.html)
   --------------------------------------------------------------------------
   Announcement-style invitation: full-bleed hero slider, a pull quote, two
   host portraits either side of a crest, a story slider, the RSVP panel,
   illustrated detail tiles and a photo strip.
   ========================================================================== */
(function () {
  'use strict';
  var E = window, M = window.MU;
  var ID = 'herald';

  var NAV = [
    ['quote', 'Welcome'], ['couple', 'Hosts'], ['story', 'Our story'],
    ['rsvp', 'RSVP'], ['event', 'Details'], ['photos', 'Photos']
  ];

  function body(d, tpl) {
    var B = d.basics;

    return M.build(d, ID, function (id, s) {
      if (id === 'hero') {
        var slides = (s.items || []).map(function (sl) {
          return '<div class="slide-inner slide-bg-image" style="background-image:url(' +
              M.esc(M.photo(sl.photo)) + ')">' +
              '<div class="container"><div class="slide-content"><div class="slide-title">' +
                (sl.kicker ? '<p>' + M.esc(sl.kicker) + '</p>' : '') +
                '<h1>' + M.esc(sl.line1 || B.nameA) + ' &amp;<br/><span>' +
                  M.esc(sl.line2 || B.nameB) + '</span></h1>' +
                (sl.meta ? '<p>' + M.esc(sl.meta) + '</p>' : '') +
              '</div></div></div>' +
            '</div>';
        });
        return M.sec(id, 'wpo-hero-static-s2',
          '<div class="swiper-container">' +
            M.slider(slides, { per: 1, nav: false, cls: 'mu-hero-slider', slideCls: 'swiper-slide' }) +
          '</div>', s);
      }

      if (id === 'quote') {
        return M.sec(id, 'wpo-quote-section',
          '<div class="container-fluid"><div class="quote-wrap">' +
            '<div class="row text-center align-items-center"><div class="col-lg-12 col-12">' +
              '<div class="quote-title">' +
                '<h2>“' + M.esc(s.title) + '”</h2>' +
                (s.text ? '<p>' + M.esc(s.text) + '</p>' : '') +
                (s.btn ? '<div class="quote-btn">' + M.btn(s.btn, 'rsvp') + '</div>' : '') +
              '</div>' +
            '</div></div>' +
            '<div class="shape-1"><img src="mu/images/quote/shape-1.svg" alt=""/></div>' +
            '<div class="shape-2"><img src="mu/images/quote/shape-2.svg" alt=""/></div>' +
          '</div></div>', s);
      }

      if (id === 'couple') {
        function card(name, text, photo) {
          return '<div class="col col-lg-4 col-md-12 col-12"><div class="couple-card">' +
            '<div class="couple-items">' +
              '<div class="couple-image inner-image">' + M.img(photo, name) + '</div>' +
              '<div class="couple-text"><h2>' + M.esc(name) + '</h2><p>' + M.esc(text) + '</p></div>' +
            '</div></div></div>';
        }
        return M.sec(id, 'wpo-couple-section-s2 pt-0',
          '<div class="container"><div class="wpo-couple-wrap"><div class="row">' +
            card(s.nameA || B.nameA, s.textA, s.photoA) +
            '<div class="col col-lg-4 col-md-12 col-12"><div class="couple-card">' +
              '<div class="couple-middle-title">' +
                '<div class="birds-icon"><img src="mu/images/couple/love-birds.svg" alt=""/></div>' +
                '<div class="couple-middle-content">' +
                  '<div class="image-love-birds"><img src="mu/images/couple/love.svg" alt=""/></div>' +
                  '<div class="image-love-birds"><img src="mu/images/couple/birds.svg" alt=""/></div>' +
                '</div>' +
              '</div>' +
            '</div></div>' +
            card(s.nameB || B.nameB, s.textB, s.photoB) +
          '</div></div></div>', s);
      }

      if (id === 'story') {
        var cards = (s.items || []).map(function (m) {
          return '<div class="wpo-story-right">' +
            '<div class="left-image inner-image">' + M.img(m.photoA, m.title) + '</div>' +
            '<div class="story-item">' +
              '<div class="right-image inner-image">' + M.img(m.photoB, m.title) +
                (m.year ? '<div class="date"><span>' + M.esc(m.year) + '</span></div>' : '') +
              '</div>' +
              '<div class="story-content"><h3>' + M.esc(m.title) + '</h3><p>' + M.esc(m.text) + '</p></div>' +
            '</div>' +
          '</div>';
        });
        return M.sec(id, 'wpo-story-section section-padding',
          '<div class="container"><div class="wpo-story-wrap"><div class="row">' +
            '<div class="col-lg-4 col-md-12 col-12"><div class="wpo-section-title-s2">' +
              '<div class="section-image"><img src="mu/images/section-title-icon-2.svg" alt=""/></div>' +
              '<h2>' + M.esc(s.title) + '</h2>' +
              (s.btn ? '<div class="title-btn"><a class="theme-btn-s2" href="#ws-sec-rsvp" data-goto="rsvp">' +
                M.esc(s.btn) + '</a></div>' : '') +
            '</div></div>' +
            '<div class="col-lg-8 col-md-12 col-12">' +
              M.slider(cards, { per: 1 }) +
            '</div>' +
          '</div></div></div>', s);
      }

      if (id === 'event') {
        return M.sec(id, 'wpo-event-section-s2',
          '<div class="wpo-event-wrap"><div class="container"><div class="row justify-content-center">' +
            (s.items || []).map(function (it) {
              return '<div class="col-lg-4 col-md-6 col-sm-6 col-12"><div class="event-item">' +
                '<div class="icon"><img src="mu/images/event/' + M.esc(it.icon || 'icon-1.svg') + '" alt=""/></div>' +
                '<div class="event-text"><h3>' + M.esc(it.title) + '</h3><p>' + M.esc(it.text) + '</p></div>' +
                (it.photo ? '<div class="event-img inner-image">' + M.img(it.photo, it.title) + '</div>' : '') +
              '</div></div>';
            }).join('') +
          '</div></div></div>', s);
      }

      if (id === 'photos') {
        return M.sec(id, 'wpo-portfolio-section style-1',
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

      if (id === 'countdown') {
        return M.sec(id, 'mu-count-band section-padding',
          '<div class="container">' + M.title(s.title) +
            M.timer(s.date || B.date, s.label) +
            (s.quote ? '<p class="mu-count-quote">“' + M.esc(s.quote) + '”</p>' : '') +
          '</div>', s);
      }

      if (id === 'rsvp') return M.rsvpSection(s, B);
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
    label: 'Herald',
    events: ['wedding', 'gala'],

    basics: [
      { k: 'nameA',  label: 'First host / guest of honour', type: 'text', ph: 'Sofia' },
      { k: 'nameB',  label: 'Second host (optional)', type: 'text', ph: 'Alexander' },
      { k: 'brand',  label: 'Wordmark in the header', type: 'text', ph: 'S & A' },
      { k: 'date',   label: 'Date', type: 'date' },
      { k: 'time',   label: 'Time', type: 'text', ph: '06:00 PM onwards' },
      { k: 'venue',  label: 'Venue', type: 'text', ph: 'The Richardson' },
      { k: 'city',   label: 'City / region', type: 'text', ph: 'California' },
      { k: 'dress',  label: 'Dress code', type: 'text', ph: 'Black tie' }
    ],

    sections: M.withStyleFields([
      { id: 'hero', label: 'Hero slider',
        fields: [],
        list: { k: 'items', label: 'Slide',
          blank: function () { return { photo: 'mu-hero-4', kicker: '', line1: '', line2: '', meta: '' }; },
          fields: [
            { k: 'photo',  label: 'Background photo', type: 'photo' },
            { k: 'kicker', label: 'Line above the names', type: 'text', ph: 'We’re getting married' },
            { k: 'line1',  label: 'First name (empty = basics)', type: 'text' },
            { k: 'line2',  label: 'Second name (empty = basics)', type: 'text' },
            { k: 'meta',   label: 'Line below the names', type: 'text', ph: '25 Feb 2027, Richardson' }
          ] } },
      { id: 'quote', label: 'Pull quote',
        fields: [
          { k: 'title', label: 'Quote', type: 'textarea' },
          { k: 'text',  label: 'Paragraph', type: 'textarea' },
          { k: 'btn',   label: 'Button text (empty = hide)', type: 'text', ph: 'Let’s celebrate' }
        ] },
      { id: 'couple', label: 'Hosts',
        fields: [
          { k: 'nameA',  label: 'Left name (empty = basics)', type: 'text' },
          { k: 'photoA', label: 'Left photo', type: 'photo' },
          { k: 'textA',  label: 'Left message', type: 'textarea' },
          { k: 'nameB',  label: 'Right name (empty = basics)', type: 'text' },
          { k: 'photoB', label: 'Right photo', type: 'photo' },
          { k: 'textB',  label: 'Right message', type: 'textarea' }
        ] },
      { id: 'story', label: 'Our story',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Our journey together' },
          { k: 'btn',   label: 'Button text (empty = hide)', type: 'text', ph: 'RSVP' }
        ],
        list: { k: 'items', label: 'Chapter',
          blank: function () { return { photoA: 'mu-story-1', photoB: 'mu-story-2', year: '', title: 'New chapter', text: '' }; },
          fields: [
            { k: 'photoA', label: 'Tall photo', type: 'photo' },
            { k: 'photoB', label: 'Second photo', type: 'photo' },
            { k: 'year',   label: 'Year badge', type: 'text', ph: '2026' },
            { k: 'title',  label: 'Title', type: 'text', ph: 'How we met' },
            { k: 'text',   label: 'Text', type: 'textarea' }
          ] } },
      M.rsvpSpec('RSVP'),
      { id: 'event', label: 'Detail tiles',
        fields: [],
        list: { k: 'items', label: 'Tile',
          blank: function () { return { icon: 'icon-1.svg', title: 'New tile', text: '', photo: 'mu-event-1' }; },
          fields: [
            { k: 'icon',  label: 'Icon', type: 'select',
              options: [['icon-1.svg', 'Location'], ['icon-2.svg', 'Rings'], ['icon-3.svg', 'Ceremony'],
                        ['icon-4.svg', 'Dining'], ['icon-5.svg', 'Music'], ['icon-6.svg', 'Gift']] },
            { k: 'title', label: 'Title', type: 'text' },
            { k: 'text',  label: 'Text', type: 'textarea' },
            { k: 'photo', label: 'Photo', type: 'photo' }
          ] } },
      { id: 'countdown', label: 'Countdown',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Counting the days' },
          { k: 'label', label: 'Label above the timer', type: 'text' },
          { k: 'date',  label: 'Count down to (empty = event date)', type: 'date' },
          { k: 'quote', label: 'Quote under the timer', type: 'textarea' }
        ] },
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
          nameA: 'Sofia', nameB: 'Alexander', brand: 'S & A',
          date: E.EVER_futureISO(5), time: '06:00 PM onwards',
          venue: 'The Richardson', city: 'California',
          dress: 'Black tie'
        },
        sections: {
          hero: { on: true, items: [
            { photo: 'mu-hero-4', kicker: 'We’re getting married', line1: '', line2: '',
              meta: '25 Feb 2027 · Richardson, California' },
            { photo: 'mu-hero-5', kicker: 'Save the date', line1: '', line2: '',
              meta: 'Ceremony at six, dinner at eight' }
          ] },
          quote: { on: true,
            title: 'Every time I look at you, I fall in love all over again.',
            text: 'It’s not just the way your eyes catch the light, or the curve of your smile — it’s the way you make the world feel softer, warmer and more alive.',
            btn: 'Let’s celebrate our love' },
          couple: { on: true,
            nameA: 'Max Alexander', photoA: 'mu-couple-2',
            textA: 'A heart full of love and a soul full of hope — I can’t wait to begin this journey with you by my side.',
            nameB: 'Amanda Sofia', photoB: 'mu-couple-3',
            textB: 'Today I marry my best friend. With joy in my heart and love in my eyes, I’m ready for forever.' },
          story: { on: true,
            title: 'Our journey together, from first meeting to forever',
            btn: 'RSVP',
            items: [
              { photoA: 'mu-story-1', photoB: 'mu-story-2', year: '2021', title: 'How we met',
                text: 'A coffee shop on a rainy afternoon, one last free seat and a conversation that ran for hours.' },
              { photoA: 'mu-story-3', photoB: 'mu-story-4', year: '2023', title: 'Our first trip',
                text: 'Two weeks, one small car and a map we never once managed to fold correctly.' }
            ] },
          rsvp: M.rsvpDefaults({ photo: 'mu-rsvp-1' }),
          event: { on: true, items: [
            { icon: 'icon-1.svg', title: 'Location', text: 'The Richardson, California — parking on site.', photo: 'mu-event-1' },
            { icon: 'icon-2.svg', title: 'Ceremony', text: 'Six in the evening in the walled garden.', photo: 'mu-event-2' },
            { icon: 'icon-3.svg', title: 'Reception', text: 'Dinner and dancing in the long hall.', photo: 'mu-event-3' }
          ] },
          countdown: { on: true, title: 'Counting the days', label: 'Until we celebrate', date: '',
            quote: 'Every love story is beautiful, but ours is my favourite.' },
          photos: { on: true, items: [
            { src: 'mu-portfolio-1' }, { src: 'mu-portfolio-2' }, { src: 'mu-portfolio-3' }, { src: 'mu-portfolio-4' },
            { src: 'mu-portfolio-5' }, { src: 'mu-portfolio-6' }
          ] },
          contact: M.contactDefaults()
        }
      };
    },

    render: render,
    mini: function (d, tpl, opts) { return M.miniWrap(d, tpl, opts, render); }
  });
})();
