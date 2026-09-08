/* ==========================================================================
   Invitara — layout: crescent  (Muhibbi "Muslim Wedding Home", index-9.html)
   --------------------------------------------------------------------------
   Ornamental, symmetrical design: a framed hero with an invocation image, a
   date line and an address, a circular countdown, two host texts around a
   single portrait, detail tiles, a three-column story slider and a centred
   RSVP card. Supports right-to-left reading via the Design panel.
   ========================================================================== */
(function () {
  'use strict';
  var E = window, M = window.MU;
  var ID = 'crescent';

  var NAV = [
    ['countdown', 'Countdown'], ['couple', 'Hosts'], ['event', 'Details'],
    ['story', 'Our story'], ['rsvp', 'RSVP']
  ];

  function body(d, tpl) {
    var B = d.basics;

    return M.build(d, ID, function (id, s) {
      if (id === 'hero') {
        return M.sec(id, 'wpo-hero-static-s9',
          '<div class="container-fluid"><div class="wpo-hero-wrap">' +
            (s.showCrest === false ? '' :
              '<div class="bismillah-image"><img src="mu/images/hero/bismillah.png" alt=""/></div>') +
            '<div class="hero-all-content">' +
              (s.dateLine ? '<div class="date-item"><h2>' + M.esc(s.dateLine) + '</h2></div>' : '') +
              '<div class="hero-item">' +
                '<div class="hero-content"><div class="hero-text">' +
                  '<h1>' + M.esc(s.nameA || B.nameA) + ' &amp; ' + M.esc(s.nameB || B.nameB) + '</h1>' +
                '</div></div>' +
                '<div class="shape shape-1"><img src="mu/images/hero/flower-6.png" alt=""/></div>' +
                '<div class="shape shape-2"><img src="mu/images/hero/flower-7.png" alt=""/></div>' +
              '</div>' +
              (s.address ? '<div class="address"><h2>' + M.esc(s.address) + '</h2></div>' : '') +
            '</div>' +
            (s.note ? '<div class="text-bottom"><h2>' + M.esc(s.note) + '</h2></div>' : '') +
          '</div></div>' +
          '<div class="shape-top shape-3"><img src="mu/images/hero/flower-5.png" alt=""/></div>' +
          '<div class="shape-top shape-4"><img src="mu/images/hero/flower-4.png" alt=""/></div>', s);
      }

      if (id === 'countdown') {
        return M.sec(id, 'wpo-wedding-date-s3',
          '<div class="container"><div class="wedding-date-wrap">' +
            (s.title ? M.title(s.title) : '') +
            '<div class="clock-grids">' + M.clock(s.date || B.date) + '</div>' +
          '</div></div>', s);
      }

      if (id === 'couple') {
        function card(name, text) {
          return '<div class="col col-lg-3 col-md-12 col-12"><div class="couple-card">' +
            '<div class="couple-text"><h2>' + M.esc(name) + '</h2><p>' + M.esc(text) + '</p></div>' +
          '</div></div>';
        }
        return M.sec(id, 'wpo-couple-section-s7 section-padding',
          '<div class="container-fluid"><div class="wpo-couple-wrap"><div class="row align-items-center">' +
            card(s.nameA || B.nameA, s.textA) +
            '<div class="col col-lg-6 col-md-12 col-12"><div class="couple-middle">' +
              '<div class="image">' + M.img(s.photo, '') + '</div>' +
              '<div class="shape shape-1"><img src="mu/images/couple/shape-7.png" alt=""/></div>' +
              '<div class="shape shape-2"><img src="mu/images/couple/shape-6.png" alt=""/></div>' +
            '</div></div>' +
            card(s.nameB || B.nameB, s.textB) +
          '</div></div></div>', s);
      }

      if (id === 'event') {
        return M.sec(id, 'wpo-event-section-s6',
          '<div class="wpo-event-wrap"><div class="container"><div class="row justify-content-center">' +
            (s.items || []).map(function (it) {
              return '<div class="col-lg-4 col-md-6 col-sm-6 col-12"><div class="event-item">' +
                '<div class="icon"><img src="mu/images/event/' + M.esc(it.icon || 'icon-1.svg') + '" alt=""/></div>' +
                '<div class="event-text"><h3>' + M.esc(it.title) + '</h3><p>' + M.esc(it.text) + '</p></div>' +
              '</div></div>';
            }).join('') +
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
              '<div class="shape-1"><img src="mu/images/story/shape-1.png" alt=""/></div>' +
              '<div class="shape-2"><img src="mu/images/story/shape-2.png" alt=""/></div>' +
            '</div></div>' +
            '<div class="col col-xl-4 col-lg-3 col-12"><div class="wpo-image-item">' +
              '<div class="image inner-image">' + M.img(m.photoB, m.title) + '</div>' +
            '</div></div>' +
          '</div></div>';
        });
        return M.sec(id, 'wpo-story-section-s7 section-padding',
          '<div class="container-fluid"><div class="wpo-story-wrap">' +
            (s.title ? '<div class="wpo-section-title"><h2>' + M.esc(s.title) + '</h2></div>' : '') +
            M.slider(slides, { per: 1 }) +
          '</div></div>', s);
      }

      if (id === 'rsvp') {
        return M.sec(id, 'wpo-contact-section-s8 section-padding',
          '<div class="container-fluid"><div class="contact-wrap">' +
            '<div class="row align-items-center justify-content-center"><div class="col-lg-8 col-md-12">' +
              '<div class="wpo-contact-card"><div class="contact-all-item">' +
                '<div class="contact-title">' +
                  '<div class="title-shape"><img src="mu/images/couple/shape-7.png" alt=""/></div>' +
                  '<h2>' + M.esc(s.title) + '</h2>' +
                  (s.note ? '<p>' + M.esc(s.note) +
                    (s.deadline ? ' <b>' + M.esc(E.EVER_fmtLongDate(s.deadline)) + '</b>' : '') + '</p>' : '') +
                '</div>' +
                '<div class="wpo-contact-section-wrapper">' + M.rsvpForm(s) + '</div>' +
              '</div></div>' +
            '</div></div>' +
          '</div></div>' +
          '<div class="shape-top shape-1"><img src="mu/images/hero/flower-5.png" alt=""/></div>' +
          '<div class="shape-top shape-2"><img src="mu/images/hero/flower-4.png" alt=""/></div>', s);
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
    label: 'Crescent',
    events: ['wedding', 'baby', 'baptism'],

    basics: [
      { k: 'nameA', label: 'First host / guest of honour', type: 'text', ph: 'Yusuf' },
      { k: 'nameB', label: 'Second host (optional)', type: 'text', ph: 'Fauziah' },
      { k: 'brand', label: 'Wordmark in the header', type: 'text', ph: 'Y & F' },
      { k: 'date',  label: 'Date', type: 'date' },
      { k: 'time',  label: 'Time', type: 'text', ph: '04:00 PM' },
      { k: 'venue', label: 'Venue', type: 'text', ph: 'Elgin Hall' },
      { k: 'city',  label: 'City / region', type: 'text', ph: 'Celina' },
      { k: 'dress', label: 'Dress code', type: 'text', ph: 'Modest formal' }
    ],

    sections: M.withStyleFields([
      { id: 'hero', label: 'Hero',
        fields: [
          { k: 'showCrest', label: 'Show the crest at the top', type: 'check' },
          { k: 'dateLine',  label: 'Date line', type: 'text', ph: 'Friday 25 February' },
          { k: 'nameA',     label: 'First name (empty = basics)', type: 'text' },
          { k: 'nameB',     label: 'Second name (empty = basics)', type: 'text' },
          { k: 'address',   label: 'Address line', type: 'text', ph: '6391 Elgin St, Celina' },
          { k: 'note',      label: 'Note at the bottom', type: 'textarea' }
        ] },
      { id: 'countdown', label: 'Countdown',
        fields: [
          { k: 'title', label: 'Section title (empty = hide)', type: 'text' },
          { k: 'date',  label: 'Count down to (empty = event date)', type: 'date' }
        ] },
      { id: 'couple', label: 'Hosts',
        fields: [
          { k: 'nameA', label: 'Left name (empty = basics)', type: 'text' },
          { k: 'textA', label: 'Left message', type: 'textarea' },
          { k: 'photo', label: 'Centre photo', type: 'photo' },
          { k: 'nameB', label: 'Right name (empty = basics)', type: 'text' },
          { k: 'textB', label: 'Right message', type: 'textarea' }
        ] },
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
      { id: 'story', label: 'Our story',
        fields: [{ k: 'title', label: 'Section title', type: 'text', ph: 'Our journey together' }],
        list: { k: 'items', label: 'Chapter',
          blank: function () { return { photoA: 'mu-story-24', photoB: 'mu-story-25', title: 'New chapter', text: '' }; },
          fields: [
            { k: 'photoA', label: 'Left photo', type: 'photo' },
            { k: 'title',  label: 'Title', type: 'text' },
            { k: 'text',   label: 'Text', type: 'textarea' },
            { k: 'photoB', label: 'Right photo', type: 'photo' }
          ] } },
      M.rsvpSpec('RSVP'),
      M.contactSection('Footer & contact')
    ]),

    defaults: function () {
      return {
        basics: {
          nameA: 'Yusuf', nameB: 'Fauziah', brand: 'Y & F',
          date: E.EVER_futureISO(5), time: '04:00 PM',
          venue: 'Elgin Hall', city: 'Celina', dress: 'Modest formal'
        },
        sections: {
          hero: { on: true, showCrest: true,
            dateLine: 'Friday 25 February',
            nameA: '', nameB: '',
            address: '6391 Elgin St. Celina, Delaware 10299',
            note: 'Please join us as we begin a beautiful new journey together.' },
          countdown: { on: true, title: '', date: '' },
          couple: { on: true,
            nameA: 'Yusuf Mustafa',
            textA: 'A heart full of love and a soul full of hope — I can’t wait to begin this journey with you by my side.',
            photo: 'mu-couple-13',
            nameB: 'Fauziah Aman',
            textB: 'Today I marry my best friend. With joy in my heart and love in my eyes, I’m ready for forever.' },
          event: { on: true, items: [
            { icon: 'icon-1.svg', title: 'Location', text: 'Elgin Hall, Celina — entrance on the north side.' },
            { icon: 'icon-2.svg', title: 'Nikah', text: 'Four in the afternoon, followed by refreshments.' },
            { icon: 'icon-3.svg', title: 'Walima', text: 'Dinner from seven, family and friends welcome.' }
          ] },
          story: { on: true, title: 'Our journey together', items: [
            { photoA: 'mu-story-24', photoB: 'mu-story-25', title: 'First family meeting',
              text: 'Two families, one long table, and an afternoon that decided everything.' },
            { photoA: 'mu-story-26', photoB: 'mu-story-27', title: 'Our promise of love',
              text: 'Quiet words, witnessed by the people who raised us both.' }
          ] },
          rsvp: M.rsvpDefaults({ title: 'Will you attend?', photo: '' }),
          contact: M.contactDefaults()
        }
      };
    },

    render: render,
    mini: function (d, tpl, opts) { return M.miniWrap(d, tpl, opts, render); }
  });
})();
