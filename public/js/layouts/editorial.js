/* ==========================================================================
   Ever RSVP — layout: editorial  (Muhibbi "Announcement Home 3", index-4.html)
   --------------------------------------------------------------------------
   Typographic hero with the names set between two flourishes, a framed pull
   quote, a wide centre portrait between two host cards, a horizontal story
   slider, a stacked RSVP card and a staggered photo strip.
   In the original this design puts the nav BELOW the hero — reproduced here.
   ========================================================================== */
(function () {
  'use strict';
  var E = window, M = window.MU;
  var ID = 'editorial';

  var NAV = [
    ['quote', 'Welcome'], ['couple', 'Hosts'], ['story', 'Our story'],
    ['countdown', 'Countdown'], ['rsvp', 'RSVP'], ['photos', 'Photos']
  ];

  function heroHtml(s, B) {
    return M.sec('hero', 'wpo-hero-static-s4',
      '<div class="container-fluid"><div class="wpo-hero-wrap"><div class="row">' +
        '<div class="col-lg-12 col-12"><div class="hero-item">' +
          '<div class="hero-contet">' +
            (s.kicker ? '<p>' + M.esc(s.kicker) + '</p>' : '') +
            '<div class="text-item">' +
              '<img src="mu/images/hero/text-shape-1.svg" alt="" class="text-image-1"/>' +
              '<h1>' + M.esc(s.nameA || B.nameA) +
                '<span><img src="mu/images/hero/and.svg" alt="and"/></span>' +
                M.esc(s.nameB || B.nameB) + '</h1>' +
              '<img src="mu/images/hero/text-shape-2.svg" alt="" class="text-image-2"/>' +
            '</div>' +
          '</div>' +
          '<div class="hero-bottom-item">' +
            '<div class="item"><p>' + M.esc(s.left) + '</p></div>' +
            '<div class="flower-iamge"><img src="mu/images/hero/flower.svg" alt=""/></div>' +
            '<div class="item"><p>' + M.esc(s.right) + '</p></div>' +
          '</div>' +
        '</div></div>' +
      '</div></div></div>', s);
  }

  function body(d, tpl) {
    var B = d.basics;

    return M.build(d, ID, function (id, s) {
      if (id === 'hero') return '';   /* rendered above the nav — see render() */

      if (id === 'quote') {
        return M.sec(id, 'wpo-quote-section-s2',
          '<div class="container"><div class="quote-wrap">' +
            '<div class="row text-center align-items-center"><div class="col-lg-12 col-12">' +
              '<div class="quote-title">' +
                '<div class="quote-title-shape"><img src="mu/images/quote/shape-3.svg" alt=""/></div>' +
                '<h2>“' + M.esc(s.title) + '”</h2>' +
                (s.text ? '<p>' + M.esc(s.text) + '</p>' : '') +
              '</div>' +
            '</div></div>' +
          '</div></div>', s);
      }

      if (id === 'couple') {
        function card(name, text, photo) {
          return '<div class="col col-lg-3 col-md-12 col-12"><div class="couple-card">' +
            '<div class="couple-text"><h2>' + M.esc(name) + '</h2><p>' + M.esc(text) + '</p></div>' +
            '<div class="couple-image inner-image">' + M.img(photo, name) + '</div>' +
          '</div></div>';
        }
        return M.sec(id, 'wpo-couple-section-s4 pt-0',
          '<div class="container-fluid"><div class="wpo-couple-wrap"><div class="row">' +
            card(s.nameA || B.nameA, s.textA, s.photoA) +
            '<div class="col col-lg-6 col-md-12 col-12"><div class="couple-middle-item">' +
              '<div class="middle-image inner-image">' + M.img(s.photoMid, '') +
                '<div class="flower-shape-image"><img src="mu/images/couple/flower-shape.png" alt=""/></div>' +
              '</div>' +
            '</div></div>' +
            card(s.nameB || B.nameB, s.textB, s.photoB) +
          '</div></div></div>', s);
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
        return M.sec(id, 'wpo-story-section-s3 section-padding',
          '<div class="container-fliud"><div class="wpo-story-wrap">' +
            '<div class="row"><div class="col-lg-12 col-12">' + M.title(s.title) + '</div></div>' +
            M.slider(items, { per: 3, cls: 'slider' }) +
          '</div></div>', s);
      }

      if (id === 'countdown') {
        return M.sec(id, 'mu-count-band section-padding',
          '<div class="container">' + M.title(s.title) +
            M.timer(s.date || B.date, s.label) +
            (s.quote ? '<p class="mu-count-quote">“' + M.esc(s.quote) + '”</p>' : '') +
          '</div>', s);
      }

      if (id === 'rsvp') {
        return M.sec(id, 'wpo-contact-section-s3 section-padding',
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
          '<div class="shape shape-left"><img src="mu/images/rsvp/shape-left.png" alt=""/></div>' +
          '<div class="shape shape-right"><img src="mu/images/rsvp/shape-right.png" alt=""/></div>', s);
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
    var hero = d.sections.hero && d.sections.hero.on !== false
      ? heroHtml(d.sections.hero, d.basics) : '';
    el.innerHTML = hero + M.head(d, tpl, { links: NAV, cls: 'header-bottom-style' }) + body(d, tpl);
    return el;
  }

  E.EVER_registerLayout({
    id: ID,
    label: 'Editorial',
    events: ['wedding', 'baptism'],

    basics: [
      { k: 'nameA', label: 'First host / guest of honour', type: 'text', ph: 'Sofia' },
      { k: 'nameB', label: 'Second host (optional)', type: 'text', ph: 'Michael' },
      { k: 'brand', label: 'Wordmark in the header', type: 'text', ph: 'S & M' },
      { k: 'date',  label: 'Date', type: 'date' },
      { k: 'time',  label: 'Time', type: 'text', ph: '04:00 PM' },
      { k: 'venue', label: 'Venue', type: 'text', ph: 'St Mary’s' },
      { k: 'city',  label: 'City / region', type: 'text', ph: 'Richardson' },
      { k: 'dress', label: 'Dress code', type: 'text', ph: 'Formal' }
    ],

    sections: M.withStyleFields([
      { id: 'hero', label: 'Hero',
        fields: [
          { k: 'kicker', label: 'Line above the names', type: 'text', ph: 'We’re getting married' },
          { k: 'nameA',  label: 'First name (empty = basics)', type: 'text' },
          { k: 'nameB',  label: 'Second name (empty = basics)', type: 'text' },
          { k: 'left',   label: 'Bottom-left line', type: 'text', ph: '25 February 2027, at 4.00 pm' },
          { k: 'right',  label: 'Bottom-right line', type: 'text', ph: 'Richardson, California' }
        ] },
      { id: 'quote', label: 'Pull quote',
        fields: [
          { k: 'title', label: 'Quote', type: 'textarea' },
          { k: 'text',  label: 'Paragraph', type: 'textarea' }
        ] },
      { id: 'couple', label: 'Hosts',
        fields: [
          { k: 'nameA',    label: 'Left name (empty = basics)', type: 'text' },
          { k: 'textA',    label: 'Left message', type: 'textarea' },
          { k: 'photoA',   label: 'Left photo', type: 'photo' },
          { k: 'photoMid', label: 'Centre photo', type: 'photo' },
          { k: 'nameB',    label: 'Right name (empty = basics)', type: 'text' },
          { k: 'textB',    label: 'Right message', type: 'textarea' },
          { k: 'photoB',   label: 'Right photo', type: 'photo' }
        ] },
      { id: 'story', label: 'Our story',
        fields: [{ k: 'title', label: 'Section title', type: 'text', ph: 'Our journey together' }],
        list: { k: 'items', label: 'Chapter',
          blank: function () { return { photo: 'mu-story-7', year: '', title: 'New chapter', text: '' }; },
          fields: [
            { k: 'photo', label: 'Photo', type: 'photo' },
            { k: 'year',  label: 'Year', type: 'text', ph: '2023' },
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
          date: E.EVER_futureISO(4), time: '04:00 PM',
          venue: 'St Mary’s', city: 'Richardson', dress: 'Formal'
        },
        sections: {
          hero: { on: true,
            kicker: 'We’re getting married',
            nameA: '', nameB: '',
            left: '25 February 2027, at 4.00 pm',
            right: 'Richardson, California 62639' },
          quote: { on: true,
            title: 'Every time I look at you, I fall in love all over again.',
            text: 'Each glance reminds me of every reason I fell for you the first time — and yet somehow you give me new reasons every day.' },
          couple: { on: true,
            nameA: 'Michael Henry', photoA: 'mu-couple-4',
            textA: 'A heart full of love and a soul full of hope — I can’t wait to begin this journey with you by my side.',
            photoMid: 'mu-couple-7',
            nameB: 'Amanda Sofia', photoB: 'mu-couple-6',
            textB: 'Today I marry my best friend. With joy in my heart and love in my eyes, I’m ready for forever.' },
          story: { on: true, title: 'Our journey together', items: [
            { photo: 'mu-story-7', year: '2020', title: 'How we met',
              text: 'A coffee shop on a rainy afternoon and the last free seat in the house.' },
            { photo: 'mu-story-8', year: '2023', title: 'Our first date',
              text: 'Casual conversation that turned into hours of laughter neither of us expected.' },
            { photo: 'mu-story-9', year: '2026', title: 'She said yes',
              text: 'On a cold morning at the top of a hill, with cold hands and warm hearts.' }
          ] },
          countdown: { on: true, title: 'Counting the days', label: 'Until we celebrate', date: '',
            quote: 'And so the adventure begins.' },
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
