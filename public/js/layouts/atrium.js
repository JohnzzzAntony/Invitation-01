/* ==========================================================================
   Ever RSVP — layout: atrium  (Muhibbi "Announcement Home 2", index-3.html)
   --------------------------------------------------------------------------
   Editorial three-column hero, a quote over three host cards, a story slider,
   illustrated detail tiles, an RSVP panel laid over a photograph, and a
   sliding photo strip.
   ========================================================================== */
(function () {
  'use strict';
  var E = window, M = window.MU;
  var ID = 'atrium';

  var NAV = [
    ['couple', 'Hosts'], ['story', 'Our story'], ['event', 'Details'],
    ['countdown', 'Countdown'], ['rsvp', 'RSVP'], ['photos', 'Photos']
  ];

  function body(d, tpl) {
    var B = d.basics;

    return M.build(d, ID, function (id, s) {
      if (id === 'hero') {
        return M.sec(id, 'wpo-hero-static-s3',
          '<div class="container-fluid"><div class="wpo-hero-wrap"><div class="row">' +
            '<div class="col-lg-4 col-md-6 col-sm-6 col-12"><div class="hero-left-item">' +
              '<div class="hero-contet">' +
                '<h1>' + M.esc(s.headline) + '</h1>' +
                (s.meta ? '<p>' + M.esc(s.meta) + '</p>' : '') +
              '</div>' +
            '</div></div>' +
            '<div class="col-lg-5 col-md-6 col-sm-6 col-12">' +
              '<div class="hero-middle-image inner-image">' + M.img(s.photoMid, '') + '</div>' +
            '</div>' +
            '<div class="col-lg-3 col-md-6 col-12"><div class="hero-right-item">' +
              '<div class="image inner-image">' + M.img(s.photoRight, '') + '</div>' +
              '<div class="hero-contet"><h2>' + M.esc(s.nameA || B.nameA) +
                ' <span>&amp;</span><br/>' + M.esc(s.nameB || B.nameB) + '</h2></div>' +
            '</div></div>' +
          '</div></div></div>' +
          '<div class="shape-1"><img src="mu/images/hero/shape-1.svg" alt=""/></div>' +
          '<div class="shape-2"><img src="mu/images/hero/shape-2.svg" alt=""/></div>', s);
      }

      if (id === 'couple') {
        function card(name, text, photo) {
          return '<div class="col col-lg-4 col-md-12 col-12"><div class="couple-card">' +
            '<div class="couple-text"><h2>' + M.esc(name) + '</h2><p>' + M.esc(text) + '</p></div>' +
            '<div class="couple-image inner-image">' + M.img(photo, name) + '</div>' +
          '</div></div>';
        }
        return M.sec(id, 'wpo-couple-section-s3',
          '<div class="container-fluid"><div class="wpo-couple-wrap">' +
            (s.quote ? '<div class="couple-title"><h2>“' + M.esc(s.quote) + '”</h2></div>' : '') +
            '<div class="row">' +
              card(s.nameA || B.nameA, s.textA, s.photoA) +
              '<div class="col col-lg-4 col-md-12 col-12"><div class="couple-middle-item">' +
                '<div class="middle-image inner-image">' + M.img(s.photoMid, '') + '</div>' +
                '<div class="couple-text"><p>' + M.esc(s.text) + '</p>' +
                  (s.btn ? '<div class="couple-btn">' + M.btn(s.btn, 'rsvp') + '</div>' : '') +
                '</div>' +
              '</div></div>' +
              card(s.nameB || B.nameB, s.textB, s.photoB) +
            '</div>' +
          '</div></div>', s);
      }

      if (id === 'story') {
        var cards = (s.items || []).map(function (m) {
          return '<div class="wpo-story-right">' +
            '<div class="story-content"><h3>' + M.esc(m.title) + '</h3><p>' + M.esc(m.text) + '</p></div>' +
            '<div class="story-item">' +
              '<div class="right-image inner-image">' + M.img(m.photoB, m.title) +
                (m.year ? '<div class="date"><span>' + M.esc(m.year) + '</span></div>' : '') +
              '</div>' +
              '<div class="left-image inner-image">' + M.img(m.photoA, m.title) + '</div>' +
            '</div>' +
          '</div>';
        });
        return M.sec(id, 'wpo-story-section-s2 section-padding',
          '<div class="container"><div class="wpo-story-wrap">' +
            '<div class="row"><div class="col-lg-12 col-12">' + M.title(s.title) + '</div></div>' +
            '<div class="row align-items-center"><div class="col-lg-12 col-12">' +
              M.slider(cards, { per: 1 }) +
            '</div></div>' +
          '</div></div>', s);
      }

      if (id === 'event') {
        return M.sec(id, 'wpo-event-section-s3',
          '<div class="wpo-event-wrap"><div class="container">' + M.title(s.title) +
            '<div class="row justify-content-center">' +
              (s.items || []).map(function (it) {
                return '<div class="col-lg-4 col-md-6 col-sm-6 col-12"><div class="event-item">' +
                  (it.photo ? '<div class="event-img inner-image">' + M.img(it.photo, it.title) + '</div>' : '') +
                  '<div class="event-content">' +
                    '<div class="icon"><img src="mu/images/event/' + M.esc(it.icon || 'icon-1.svg') + '" alt=""/></div>' +
                    '<div class="event-text"><h3>' + M.esc(it.title) + '</h3><p>' + M.esc(it.text) + '</p></div>' +
                  '</div>' +
                '</div></div>';
              }).join('') +
            '</div>' +
          '</div></div>', s);
      }

      if (id === 'rsvp') {
        return M.sec(id, 'wpo-contact-section-s2 section-padding',
          '<div class="container"><div class="contact-wrap"><div class="row align-items-center">' +
            '<div class="col-lg-12 col-md-12"><div class="contact-image-bg">' +
              M.img(s.photo || 'mu-rsvp-1', '') +
              '<div class="contact-title"><h2>' + M.esc(s.title) + '</h2>' +
                (s.note ? '<p>' + M.esc(s.note) +
                  (s.deadline ? ' <b>' + M.esc(E.EVER_fmtLongDate(s.deadline)) + '</b>' : '') + '</p>' : '') +
              '</div>' +
              '<div class="wpo-contact-section-wrapper">' + M.rsvpForm(s) + '</div>' +
            '</div></div>' +
          '</div></div></div>', s);
      }

      if (id === 'countdown') {
        return M.sec(id, 'mu-count-band section-padding',
          '<div class="container">' + M.title(s.title) +
            M.timer(s.date || B.date, s.label) +
            (s.quote ? '<p class="mu-count-quote">“' + M.esc(s.quote) + '”</p>' : '') +
          '</div>', s);
      }

      if (id === 'photos') {
        var tiles = (s.items || []).map(function (p) {
          return '<div class="portfolio-image">' +
            '<a href="' + M.esc(M.photo(p.src)) + '" data-mu-zoom>' +
              M.img(p.src, 'Photo', 'img img-responsive') +
              '<div class="hover-content">' + M.ti('plus') + '</div>' +
            '</a></div>';
        });
        return M.sec(id, 'wpo-portfolio-section-s2',
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
    label: 'Atrium',
    events: ['wedding', 'housewarming'],

    basics: [
      { k: 'nameA', label: 'First host / guest of honour', type: 'text', ph: 'Sofia' },
      { k: 'nameB', label: 'Second host (optional)', type: 'text', ph: 'Michael' },
      { k: 'brand', label: 'Wordmark in the header', type: 'text', ph: 'S & M' },
      { k: 'date',  label: 'Date', type: 'date' },
      { k: 'time',  label: 'Time', type: 'text', ph: '04:00 PM onwards' },
      { k: 'venue', label: 'Venue', type: 'text', ph: 'The Atrium' },
      { k: 'city',  label: 'City / region', type: 'text', ph: 'Richardson' },
      { k: 'dress', label: 'Dress code', type: 'text', ph: 'Smart casual' }
    ],

    sections: M.withStyleFields([
      { id: 'hero', label: 'Hero',
        fields: [
          { k: 'headline',   label: 'Headline', type: 'text', ph: 'We’re getting married' },
          { k: 'meta',       label: 'Line under the headline', type: 'text', ph: '25 Feb 2027, Richardson' },
          { k: 'photoMid',   label: 'Large photo', type: 'photo' },
          { k: 'photoRight', label: 'Small photo', type: 'photo' },
          { k: 'nameA',      label: 'First name (empty = basics)', type: 'text' },
          { k: 'nameB',      label: 'Second name (empty = basics)', type: 'text' }
        ] },
      { id: 'couple', label: 'Hosts',
        fields: [
          { k: 'quote',  label: 'Quote above the cards', type: 'textarea' },
          { k: 'nameA',  label: 'Left name (empty = basics)', type: 'text' },
          { k: 'textA',  label: 'Left message', type: 'textarea' },
          { k: 'photoA', label: 'Left photo', type: 'photo' },
          { k: 'photoMid', label: 'Centre photo', type: 'photo' },
          { k: 'text',   label: 'Centre paragraph', type: 'textarea' },
          { k: 'btn',    label: 'Centre button (empty = hide)', type: 'text' },
          { k: 'nameB',  label: 'Right name (empty = basics)', type: 'text' },
          { k: 'textB',  label: 'Right message', type: 'textarea' },
          { k: 'photoB', label: 'Right photo', type: 'photo' }
        ] },
      { id: 'story', label: 'Our story',
        fields: [{ k: 'title', label: 'Section title', type: 'text', ph: 'Our journey together' }],
        list: { k: 'items', label: 'Chapter',
          blank: function () { return { photoA: 'mu-story-5', photoB: 'mu-story-6', year: '', title: 'New chapter', text: '' }; },
          fields: [
            { k: 'title',  label: 'Title', type: 'text' },
            { k: 'text',   label: 'Text', type: 'textarea' },
            { k: 'photoB', label: 'Main photo', type: 'photo' },
            { k: 'photoA', label: 'Second photo', type: 'photo' },
            { k: 'year',   label: 'Year badge', type: 'text' }
          ] } },
      { id: 'event', label: 'Detail tiles',
        fields: [{ k: 'title', label: 'Section title', type: 'text', ph: 'Happy to have you with us' }],
        list: { k: 'items', label: 'Tile',
          blank: function () { return { photo: 'mu-event-1', icon: 'icon-1.svg', title: 'New tile', text: '' }; },
          fields: [
            { k: 'photo', label: 'Photo', type: 'photo' },
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
          nameA: 'Sofia', nameB: 'Michael', brand: 'S & M',
          date: E.EVER_futureISO(4), time: '04:00 PM onwards',
          venue: 'The Atrium', city: 'Richardson', dress: 'Smart casual'
        },
        sections: {
          hero: { on: true,
            headline: 'We’re getting married',
            meta: '25 Feb 2027 · Richardson, California',
            photoMid: 'mu-hero-6', photoRight: 'mu-hero-7',
            nameA: '', nameB: '' },
          couple: { on: true,
            quote: 'In a world full of people, my heart chose only you.',
            nameA: 'Michael Henry', photoA: 'mu-couple-4',
            textA: 'A heart full of love and a soul full of hope — I can’t wait to begin this journey with you by my side.',
            photoMid: 'mu-couple-5',
            text: 'It’s not just the way your eyes catch the light, or the curve of your smile — it’s the way you make the world feel softer, warmer and more alive.',
            btn: 'Let’s celebrate our love',
            nameB: 'Amanda Sofia', photoB: 'mu-couple-6',
            textB: 'Today I marry my best friend. With joy in my heart and love in my eyes, I’m ready for forever.' },
          story: { on: true, title: 'Our journey together', items: [
            { title: 'How we met', year: '2021', photoB: 'mu-story-6', photoA: 'mu-story-5',
              text: 'A coffee shop on a rainy afternoon, one last free seat, and a conversation that ran for hours.' },
            { title: 'Our first date', year: '2022', photoB: 'mu-story-29', photoA: 'mu-story-28',
              text: 'A long walk, a short film and the discovery that we both order the same coffee.' }
          ] },
          event: { on: true, title: 'Welcome — we’re happy to have you with us', items: [
            { photo: 'mu-event-1', icon: 'icon-1.svg', title: 'Location', text: 'The Atrium, Richardson — parking behind the hall.' },
            { photo: 'mu-event-2', icon: 'icon-2.svg', title: 'Ceremony', text: 'Four in the afternoon under the glass roof.' },
            { photo: 'mu-event-3', icon: 'icon-3.svg', title: 'Reception', text: 'Dinner at seven, dancing until midnight.' }
          ] },
          countdown: { on: true, title: 'Counting the days', label: 'Until we celebrate', date: '',
            quote: 'In a world full of people, my heart chose only you.' },
          rsvp: M.rsvpDefaults({ photo: 'mu-rsvp-1' }),
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
