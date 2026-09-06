/* ==========================================================================
   Ever RSVP — layout: lumen (Baptism & Christening)
   Soft, serene, ceremonial. Structure: light hero with soft ARCH-framed
   photo, CSS cross motif and script child name → two side-by-side panels
   (Ceremony ⋯ Reception) joined by a dashed line → elegant godparent cards
   with monogram circles → gentle horizontal photo strip → blessings &
   wishes message cards → soft RSVP panel → serene footer with CSS
   cross/dove motif. Styles: css/ly-lumen.css (scoped .ws-lumen /
   .wsm.ws-lumen).
   ========================================================================== */
(function () {
  'use strict';
  var E = window;

  function navLinks() {
    return [['ceremony', 'Ceremony'], ['godparents', 'Godparents'], ['moments', 'Moments'],
            ['wishes', 'Wishes'], ['rsvp', 'RSVP']];
  }

  E.EVER_registerLayout({
    id: 'lumen',
    label: 'Baptism & Christening',
    events: ['baptism'],

    basics: [
      { k: 'child',   label: 'Child name', type: 'text', ph: 'Theodore' },
      { k: 'parents', label: 'Parents line', type: 'text', ph: 'Sarah & Mark Thomas' },
      { k: 'kicker',  label: 'Hero kicker', type: 'text', ph: 'Holy Baptism' },
      { k: 'date',    label: 'Date', type: 'date' },
      { k: 'time',    label: 'Time', type: 'text', ph: '11:00 AM' },
      { k: 'church',  label: 'Church name', type: 'text', ph: 'St. Augustine Parish Church' },
      { k: 'city',    label: 'City', type: 'text', ph: 'Portland' }
    ],

    sections: [
      { id: 'hero', label: 'Hero',
        fields: [
          { k: 'photo',   label: 'Hero photo', type: 'photo' },
          { k: 'verse',   label: 'Verse line', type: 'text', ph: 'For this child we prayed…' },
          { k: 'btnText', label: 'Button text', type: 'text', ph: 'Ceremony details' }
        ] },
      { id: 'ceremony', label: 'Ceremony & reception',
        fields: [
          { k: 'title',          label: 'Section title', type: 'text', ph: 'Order of the day' },
          { k: 'ceremonyLabel',  label: 'Left panel label', type: 'text', ph: 'Ceremony' },
          { k: 'churchAddress',  label: 'Church address', type: 'text', ph: '124 Chestnut Street, Old Town' },
          { k: 'receptionLabel', label: 'Right panel label', type: 'text', ph: 'Reception' },
          { k: 'venue',          label: 'Reception venue', type: 'text', ph: 'Rose Garden Tea House' },
          { k: 'receptionTime',  label: 'Reception time', type: 'text', ph: '12:30 PM - a light lunch' }
        ] },
      { id: 'godparents', label: 'Godparents',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Godparents' },
          { k: 'note',  label: 'Note under title', type: 'text', ph: 'Their guiding stars' }
        ],
        list: { k: 'items', label: 'Godparent', blank: function () {
            return { name: 'New name', role: 'Godparent' }; },
          fields: [
            { k: 'name', label: 'Name', type: 'text', ph: 'Elena Marsh' },
            { k: 'role', label: 'Role', type: 'text', ph: 'Godmother' }
          ] } },
      { id: 'moments', label: 'Photo strip',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Little moments' }
        ],
        list: { k: 'items', label: 'Photo', blank: function () { return { photo: 'baptism' }; },
          fields: [ { k: 'photo', label: 'Photo', type: 'photo' } ] } },
      { id: 'wishes', label: 'Blessings & wishes',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Blessings & wishes' },
          { k: 'note',  label: 'Note under title', type: 'text', ph: 'Words from the people who love them' }
        ],
        list: { k: 'items', label: 'Wish', blank: function () {
            return { name: 'A friend', message: 'New blessing' }; },
          fields: [
            { k: 'name',    label: 'Name', type: 'text', ph: 'Grandma June' },
            { k: 'message', label: 'Message', type: 'textarea', ph: 'May your path be lit…' }
          ] } },
      { id: 'rsvp', label: 'RSVP form',
        fields: [
          { k: 'title',     label: 'Heading', type: 'text', ph: 'Kindly RSVP' },
          { k: 'note',      label: 'Note before date', type: 'text', ph: 'Please reply by' },
          { k: 'deadline',  label: 'Reply deadline', type: 'date' },
          { k: 'showPhone', label: 'Ask for phone number', type: 'check' },
          { k: 'guestsMax', label: 'Max guests per reply', type: 'number', min: 1, max: 12 },
          { k: 'showMsg',   label: 'Include message box', type: 'check' },
          { k: 'submit',    label: 'Submit button text', type: 'text', ph: 'Send our reply' },
          { k: 'success',   label: 'Success message', type: 'text', ph: 'Thank you — God bless!' }
        ],
        list: { k: 'meals', label: 'Meal option', blank: function () { return ''; },
          fields: [ { k: '', label: 'Option', type: 'text', ph: 'Vegetarian' } ] } },
      { id: 'footer', label: 'Contact & footer',
        fields: [
          { k: 'phone',     label: 'Phone', type: 'text', ph: '+1 503 555 0142' },
          { k: 'email',     label: 'E-mail', type: 'text', ph: 'hello@example.com' },
          { k: 'whatsapp',  label: 'WhatsApp link text', type: 'text', ph: 'Message us' },
          { k: 'thanks',    label: 'Thank-you line', type: 'text', ph: 'Thank you for blessing this day with us.' },
          { k: 'copyright', label: 'Copyright extra (optional)', type: 'text', ph: '' },
          { k: 'credit',    label: 'Credit line', type: 'text', ph: 'With love, the Thomas family' }
        ] }
    ],

    defaults: function () {
      return {
        basics: {
          child: 'Theodore',
          parents: 'Sarah & Mark Thomas',
          kicker: 'Holy Baptism',
          date: E.EVER_futureISO(1, 18),
          time: '11:00 AM',
          church: 'St. Augustine Parish Church',
          city: 'Portland'
        },
        sections: {
          hero: {
            on: true,
            photo: 'baptism',
            verse: 'For this child we prayed, and the Lord has granted our request.',
            btnText: 'Ceremony details'
          },
          ceremony: {
            on: true,
            title: 'Order of the day',
            ceremonyLabel: 'Ceremony',
            churchAddress: '124 Chestnut Street, Old Town',
            receptionLabel: 'Reception',
            venue: 'Rose Garden Tea House',
            receptionTime: '12:30 PM \u00b7 a light lunch'
          },
          godparents: {
            on: true,
            title: 'Godparents',
            note: 'Their guiding stars for the journey ahead',
            items: [
              { name: 'Elena Marsh',  role: 'Godmother' },
              { name: 'Peter Hale',   role: 'Godfather' },
              { name: 'Rosa Delgado', role: 'Godmother' }
            ]
          },
          moments: {
            on: true,
            title: 'Little moments',
            items: [
              { photo: 'baptism' }, { photo: 'baby' }, { photo: 'cafe' },
              { photo: 'decor' }, { photo: 'dance' }
            ]
          },
          wishes: {
            on: true,
            title: 'Blessings & wishes',
            note: 'A few words from the people who love him',
            items: [
              { name: 'Grandma June',  message: 'May your faith be a lamp for your feet and a light upon your path, little one.' },
              { name: 'Uncle Theo & Aunty Bea', message: 'We promise to always be nearby with open arms, warm cookies and terrible jokes.' },
              { name: 'The whole choir', message: 'May every sunrise remind you how deeply you are loved \u2014 today and always.' }
            ]
          },
          rsvp: {
            on: true,
            title: 'Kindly RSVP',
            note: 'Please reply by',
            deadline: E.EVER_futureISO(1, 10),
            showPhone: true,
            guestsMax: 6,
            meals: ['No preference', 'Vegetarian', 'Gluten-free', 'Little ones plate'],
            showMsg: true,
            submit: 'Send our reply',
            success: 'Thank you \u2014 your reply means the world to us. God bless!'
          },
          footer: {
            on: true,
            phone: '+1 503 555 0142',
            email: 'thomas.family@example.com',
            whatsapp: 'Message us',
            thanks: 'Thank you for blessing this day with us.',
            copyright: '',
            credit: 'With love, the Thomas family'
          }
        }
      };
    },

    render: function (d, tpl, opts) {
      var B = d.basics, S = d.sections;
      var nf = (E.EVER_NAME_FONTS[d.nameFont] || E.EVER_NAME_FONTS[tpl.nameFont] || E.EVER_NAME_FONTS.paris).cls;
      var el = E.EVER_siteRoot(d, tpl, opts);

      var nav = navLinks().map(function (l) {
        return '<a href="#ws-sec-' + l[0] + '" data-goto="' + l[0] + '">' + E.EVER_esc(l[1]) + '</a>';
      }).join('');

      var html = '';
      (d.order && d.order.length ? d.order : E.EVER_layoutOrder(E.EVER_findLayout('lumen'))).forEach(function (id) {
        var sec = S[id];
        if (!sec || sec.on === false) return;

        if (id === 'hero') {
          html += '' +
            '<header class="lum-hero" id="ws-sec-hero">' +
              '<span class="lum-glow" aria-hidden="true"></span>' +
              '<div class="ws-hero-bar">' +
                '<span class="ws-mono">' + E.EVER_esc(E.EVER_initials(B.child)) + '</span>' +
                '<nav class="ws-nav" aria-label="Event sections">' + nav + '</nav>' +
              '</div>' +
              '<div class="lum-hero-inner">' +
                '<span class="lum-cross" aria-hidden="true"></span>' +
                '<p class="lum-kick">' + E.EVER_esc(B.kicker) + '</p>' +
                '<span class="lum-arch"><img src="' + E.EVER_esc(E.EVER_photoSrc(sec.photo)) +
                  '" alt="' + E.EVER_esc(B.child) + '"/></span>' +
                '<h1 class="lum-child ' + nf + '">' + E.EVER_esc(B.child) + '</h1>' +
                '<span class="lum-div" aria-hidden="true"><i></i>' + E.EVER_icon('cross', 'lum-div-ic') + '<i></i></span>' +
                (B.parents ? '<p class="lum-parents">' + E.EVER_esc(B.parents) + '</p>' : '') +
                '<p class="lum-when">' + E.EVER_icon('calendar') + ' ' + E.EVER_esc(E.EVER_fmtHeroDate(B.date)) +
                  ' <i class="lum-dot" aria-hidden="true"></i> ' + E.EVER_icon('clock') + ' ' + E.EVER_esc(B.time) + '</p>' +
                (B.church ? '<p class="lum-church">' + E.EVER_icon('pin') + ' ' + E.EVER_esc(B.church) +
                  ', ' + E.EVER_esc(B.city) + '</p>' : '') +
                (sec.verse ? '<p class="lum-verse">\u201c' + E.EVER_esc(sec.verse) + '\u201d</p>' : '') +
                '<a class="ws-btn ws-btn-dark lum-cta" href="#ws-sec-ceremony" data-goto="ceremony">' +
                  E.EVER_esc(sec.btnText || 'Ceremony details') + '</a>' +
              '</div>' +
            '</header>';
        } else if (id === 'ceremony') {
          html += '' +
            '<section class="ws-sec ws-ceremony lum-cer" id="ws-sec-ceremony">' +
              '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
              '<div class="lum-cer-grid">' +
                '<div class="lum-panel">' +
                  '<span class="lum-panel-ic" aria-hidden="true">' + E.EVER_icon('cross') + '</span>' +
                  '<b class="lum-panel-lab">' + E.EVER_esc(sec.ceremonyLabel || 'Ceremony') + '</b>' +
                  '<strong class="lum-panel-big">' + E.EVER_esc(B.church) + '</strong>' +
                  (sec.churchAddress ? '<span class="lum-panel-sub">' + E.EVER_esc(sec.churchAddress) + '</span>' : '') +
                  '<span class="lum-panel-sub">' + E.EVER_icon('clock') + ' ' + E.EVER_esc(B.time) + '</span>' +
                '</div>' +
                '<span class="lum-cer-link" aria-hidden="true"></span>' +
                '<div class="lum-panel">' +
                  '<span class="lum-panel-ic" aria-hidden="true">' + E.EVER_icon('glass') + '</span>' +
                  '<b class="lum-panel-lab">' + E.EVER_esc(sec.receptionLabel || 'Reception') + '</b>' +
                  '<strong class="lum-panel-big">' + E.EVER_esc(sec.venue) + '</strong>' +
                  (sec.receptionTime ? '<span class="lum-panel-sub">' + E.EVER_icon('clock') + ' ' +
                    E.EVER_esc(sec.receptionTime) + '</span>' : '') +
                '</div>' +
              '</div>' +
            '</section>';
        } else if (id === 'godparents') {
          html += '' +
            '<section class="ws-sec ws-godparents lum-god" id="ws-sec-godparents">' +
              '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
              (sec.note ? '<p class="lum-note">' + E.EVER_esc(sec.note) + '</p>' : '') +
              '<div class="lum-god-grid">' +
                (sec.items || []).map(function (g) {
                  return '<div class="lum-gcard">' +
                    '<span class="lum-gmono" aria-hidden="true">' + E.EVER_esc(E.EVER_initials(g.name)) + '</span>' +
                    '<b>' + E.EVER_esc(g.name) + '</b>' +
                    (g.role ? '<i>' + E.EVER_esc(g.role) + '</i>' : '') +
                  '</div>';
                }).join('') +
              '</div>' +
            '</section>';
        } else if (id === 'moments') {
          html += '' +
            '<section class="ws-sec ws-moments lum-mom" id="ws-sec-moments">' +
              '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
              '<div class="lum-strip">' +
                (sec.items || []).map(function (m) {
                  return '<span class="lum-shot"><img src="' + E.EVER_esc(E.EVER_photoSrc(m.photo)) +
                    '" alt="Little moment" loading="lazy"/></span>';
                }).join('') +
              '</div>' +
            '</section>';
        } else if (id === 'wishes') {
          html += '' +
            '<section class="ws-sec ws-wishes lum-wish" id="ws-sec-wishes">' +
              '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
              (sec.note ? '<p class="lum-note">' + E.EVER_esc(sec.note) + '</p>' : '') +
              '<div class="lum-wish-grid">' +
                (sec.items || []).map(function (w) {
                  return '<figure class="lum-wcard">' +
                    '<span class="lum-q" aria-hidden="true">\u201c</span>' +
                    '<blockquote>' + E.EVER_esc(w.message).replace(/\n/g, '<br/>') + '</blockquote>' +
                    '<figcaption>\u2014 ' + E.EVER_esc(w.name) + '</figcaption>' +
                  '</figure>';
                }).join('') +
              '</div>' +
            '</section>';
        } else if (id === 'rsvp') {
          html += '' +
            '<section class="ws-sec ws-rsvp lum-rsvp" id="ws-sec-rsvp">' +
              '<div class="lum-rsvp-card">' +
                '<span class="lum-cross lum-cross-sm" aria-hidden="true"></span>' +
                '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
                '<p class="lum-rsvp-note">' + E.EVER_esc(sec.note) + ' <b>' +
                  E.EVER_esc(E.EVER_fmtLongDate(sec.deadline)) + '</b></p>' +
                E.EVER_rsvpFormHtml(sec) +
              '</div>' +
            '</section>';
        } else if (id === 'footer') {
          html += '' +
            '<footer class="ws-footer lum-foot" id="ws-sec-footer">' +
              '<span class="lum-foot-cross" aria-hidden="true"></span>' +
              '<span class="lum-foot-mono">' + E.EVER_esc(E.EVER_initials(B.child)) + '</span>' +
              '<p class="lum-thanks">' + E.EVER_esc(sec.thanks) + '</p>' +
              '<div class="lum-lines">' +
                '<a class="lum-line" href="tel:' + E.EVER_esc(String(sec.phone).replace(/\s/g, '')) + '">' +
                  E.EVER_icon('phone') + E.EVER_esc(sec.phone) + '</a>' +
                '<a class="lum-line" href="mailto:' + E.EVER_esc(sec.email) + '">' +
                  E.EVER_icon('mail') + E.EVER_esc(sec.email) + '</a>' +
                '<a class="lum-line" href="https://wa.me/' + E.EVER_esc(String(sec.phone).replace(/\D/g, '')) +
                  '" target="_blank" rel="noopener noreferrer">' + E.EVER_icon('whatsapp') + E.EVER_esc(sec.whatsapp) + '</a>' +
              '</div>' +
              '<div class="lum-foot-bar">' +
                '<span>\u00a9 ' + new Date().getFullYear() + ' ' + E.EVER_esc(B.child) +
                  (sec.copyright ? ' \u00b7 ' + E.EVER_esc(sec.copyright) : '') + '. All rights reserved.</span>' +
                '<span>' + E.EVER_esc(sec.credit) + '</span>' +
              '</div>' +
            '</footer>';
        }
      });

      el.innerHTML = html;
      return el;
    },

    mini: function (d, tpl, opts) {
      opts = opts || {};
      var B = d.basics, S = d.sections;
      var nf = (E.EVER_NAME_FONTS[d.nameFont] || E.EVER_NAME_FONTS[tpl.nameFont] || E.EVER_NAME_FONTS.paris).cls;
      var el = E.EVER_miniRoot(tpl, d, 'lumen');

      var cer = S.ceremony || {};
      var god = ((S.godparents && S.godparents.items) || []).slice(0, opts.short ? 0 : 3).map(function (g) {
        return '<span class="lum-m-god"><i>' + E.EVER_esc(E.EVER_initials(g.name)) + '</i><b>' +
          E.EVER_esc(g.role || g.name) + '</b></span>';
      }).join('');
      var shots = ((S.moments && S.moments.items) || []).slice(0, opts.short ? 3 : 5).map(function (m) {
        return '<img src="' + E.EVER_esc(E.EVER_photoSrc(m.photo)) + '" alt=""/>';
      }).join('');

      el.innerHTML = '' +
        '<div class="lum-m-hero">' +
          '<span class="lum-m-cross" aria-hidden="true"></span>' +
          '<span class="lum-m-kick">' + E.EVER_esc(B.kicker || '') + '</span>' +
          '<span class="lum-m-arch"><img src="' + E.EVER_esc(E.EVER_photoSrc(S.hero && S.hero.photo)) + '" alt=""/></span>' +
          '<strong class="lum-m-child ' + nf + '">' + E.EVER_esc(B.child) + '</strong>' +
          '<span class="lum-m-parents">' + E.EVER_esc(B.parents || '') + '</span>' +
          '<span class="lum-m-date">' + E.EVER_esc(E.EVER_fmtHeroDate(B.date)) + '</span>' +
          '<span class="lum-m-btn">' + E.EVER_esc(S.hero && S.hero.btnText || 'Ceremony details') + '</span>' +
        '</div>' +
        '<div class="lum-m-block">' +
          '<span class="lum-m-st">' + E.EVER_esc(cer.title || 'Ceremony') + '</span>' +
          '<span class="lum-m-row">' + E.EVER_icon('cross') + '<b>' + E.EVER_esc(B.church || '') + '</b><i>' +
            E.EVER_esc(B.time || '') + '</i></span>' +
          '<span class="lum-m-row">' + E.EVER_icon('glass') + '<b>' + E.EVER_esc(cer.venue || '') + '</b><i>' +
            E.EVER_esc(cer.receptionTime || '') + '</i></span>' +
        '</div>' +
        (opts.short ? '' :
        '<div class="lum-m-block lum-m-alt">' +
          '<span class="lum-m-st">' + E.EVER_esc(S.godparents && S.godparents.title || 'Godparents') + '</span>' +
          '<div class="lum-m-gods">' + god + '</div>' +
        '</div>' +
        '<div class="lum-m-shots">' + shots + '</div>') +
        '<div class="lum-m-foot">' +
          '<span class="lum-m-cross" aria-hidden="true"></span>' +
          '<span class="lum-m-thanks">' + E.EVER_esc(S.footer && S.footer.thanks || '') + '</span>' +
        '</div>';
      return el;
    }
  });
})();
