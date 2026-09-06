/* ==========================================================================
   Ever RSVP — layout: play (Baby Shower & Kids)
   Structure: soft hero with arch photo frame + floating dots/hearts →
   three rounded bubble detail cards → guest-book wishes grid → games &
   treats two-column cards → RSVP → soft pastel footer.
   Styles: css/ly-play.css.
   ========================================================================== */
(function () {
  'use strict';
  var E = window;

  function navLinks() {
    return [['details', 'Details'], ['wishes', 'Guest book'], ['games', 'Games'], ['rsvp', 'RSVP']];
  }

  E.EVER_registerLayout({
    id: 'play',
    label: 'Baby Shower & Kids',
    events: ['baby'],

    basics: [
      { k: 'name',     label: "Child's / family name", type: 'text', ph: 'Bennett' },
      { k: 'subtitle', label: 'Subtitle',              type: 'text', ph: 'A baby shower for our little one' },
      { k: 'hostLine', label: 'Hosted by',             type: 'text', ph: 'Hosted by grandparents-to-be' },
      { k: 'date',     label: 'Date',                  type: 'date' },
      { k: 'time',     label: 'Time',                  type: 'text', ph: '02:00 PM' },
      { k: 'venue',    label: 'Venue',                 type: 'text', ph: 'The Garden Room' },
      { k: 'city',     label: 'City',                  type: 'text', ph: 'Portland' }
    ],

    sections: [
      { id: 'hero', label: 'Hero',
        fields: [
          { k: 'kicker',  label: 'Kicker line', type: 'text', ph: 'Join us for' },
          { k: 'photo',   label: 'Arch photo',  type: 'photo' },
          { k: 'btnText', label: 'Button text', type: 'text', ph: 'See the details' }
        ] },
      { id: 'details', label: 'Details bubbles',
        fields: [
          { k: 'title',      label: 'Section title',   type: 'text', ph: 'The details' },
          { k: 'whenLabel',  label: 'When card label',  type: 'text', ph: 'When' },
          { k: 'whereLabel', label: 'Where card label', type: 'text', ph: 'Where' },
          { k: 'hostLabel',  label: 'Host card label',  type: 'text', ph: 'Hosted by' }
        ] },
      { id: 'wishes', label: 'Guest book',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Guest book' },
          { k: 'note',  label: 'Note under title', type: 'text', ph: 'Sweet words from our favorite people' }
        ],
        list: { k: 'items', label: 'Wish', blank: function () {
            return { name: 'Family friend', msg: 'So excited for you three!' }; },
          fields: [
            { k: 'name', label: 'Name', type: 'text', ph: 'Grandma June' },
            { k: 'msg',  label: 'Message', type: 'textarea', ph: 'A little note for the family…' }
          ] } },
      { id: 'games', label: 'Games & treats',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Games & treats' },
          { k: 'note',  label: 'Note under title', type: 'text', ph: 'Gentle games and something sweet' }
        ],
        list: { k: 'items', label: 'Game or treat', blank: function () {
            return { icon: 'star', title: 'New game', text: '' }; },
          fields: [
            { k: 'icon',  label: 'Icon', type: 'icon' },
            { k: 'title', label: 'Title', type: 'text', ph: 'Wishes for baby' },
            { k: 'text',  label: 'Description', type: 'text', ph: 'A little note for the memory jar.' }
          ] } },
      { id: 'rsvp', label: 'RSVP form',
        fields: [
          { k: 'title',     label: 'Heading', type: 'text', ph: 'Will you join us?' },
          { k: 'note',      label: 'Note before date', type: 'text', ph: 'Kindly reply by' },
          { k: 'deadline',  label: 'Reply deadline', type: 'date' },
          { k: 'showPhone', label: 'Ask for phone number', type: 'check' },
          { k: 'guestsMax', label: 'Max guests per reply', type: 'number', min: 1, max: 12 },
          { k: 'showMsg',   label: 'Include message box', type: 'check' },
          { k: 'submit',    label: 'Submit button text', type: 'text', ph: 'Send my reply' },
          { k: 'success',   label: 'Success message', type: 'text', ph: 'Thank you! We cannot wait to celebrate.' }
        ],
        list: { k: 'meals', label: 'Meal option', blank: function () { return ''; },
          fields: [ { k: '', label: 'Option', type: 'text', ph: 'Vegetarian' } ] } },
      { id: 'footer', label: 'Contact & footer',
        fields: [
          { k: 'phone',     label: 'Phone', type: 'text', ph: '+1 503 555 0117' },
          { k: 'email',     label: 'E-mail', type: 'text', ph: 'hello@example.com' },
          { k: 'whatsapp',  label: 'WhatsApp link text', type: 'text', ph: 'Message us' },
          { k: 'thanks',    label: 'Thank-you line', type: 'text', ph: 'Thank you for showering our little one with love.' },
          { k: 'copyright', label: 'Copyright extra (optional)', type: 'text', ph: '' },
          { k: 'credit',    label: 'Credit line', type: 'text', ph: 'Made with \u2665 by the family' }
        ] }
    ],

    defaults: function () {
      return {
        basics: {
          name: 'Bennett',
          subtitle: 'A baby shower for our little one',
          hostLine: 'Hosted by grandparents-to-be',
          date: E.EVER_futureISO(1, 20), time: '02:00 PM',
          venue: 'The Garden Room', city: 'Portland'
        },
        sections: {
          hero: {
            on: true,
            kicker: 'Join us for',
            photo: 'baby',
            btnText: 'See the details'
          },
          details: {
            on: true, title: 'The details',
            whenLabel: 'When', whereLabel: 'Where', hostLabel: 'Hosted by'
          },
          wishes: {
            on: true, title: 'Guest book', note: 'Sweet words from our favorite people',
            items: [
              { name: 'Grandma June',  msg: 'A little one brings so much love. Counting the days until we meet!' },
              { name: 'The Carters',   msg: 'So happy for you two \u2014 Bennett is already so loved.' },
              { name: 'Aunt Rosie',    msg: 'Saving all my hugs for the little one. See you soon!' },
              { name: 'Campus friends', msg: 'From midnight talks to midnight feeds \u2014 we are here for you.' }
            ]
          },
          games: {
            on: true, title: 'Games & treats', note: 'Gentle games and something sweet for everyone',
            items: [
              { icon: 'star',  title: 'Wishes for baby',    text: 'Write a little note for the memory jar.' },
              { icon: 'cake',  title: 'Cookie decorating',  text: 'Cloud and star cookies with all the sprinkles.' },
              { icon: 'music', title: 'Name that song',     text: 'Lullaby edition \u2014 humming is allowed.' },
              { icon: 'gift',  title: 'Tiny raffle',        text: 'Every guest leaves with something soft and sweet.' }
            ]
          },
          rsvp: {
            on: true,
            title: 'Will you join us?',
            note: 'Kindly reply by',
            deadline: E.EVER_futureISO(1, 6),
            showPhone: false,
            guestsMax: 4,
            meals: ['Vegetarian', 'Gluten free', 'No preference'],
            showMsg: true,
            submit: 'Send my reply',
            success: 'Thank you! We cannot wait to celebrate with you.'
          },
          footer: {
            on: true,
            phone: '+1 503 555 0117',
            email: 'hello@bennett.family',
            whatsapp: 'Message us',
            thanks: 'Thank you for showering our little one with love.',
            copyright: '',
            credit: 'Made with \u2665 by the family'
          }
        }
      };
    },

    render: function (d, tpl, opts) {
      var B = d.basics, S = d.sections;
      var nf = (E.EVER_NAME_FONTS[d.nameFont] || E.EVER_NAME_FONTS[tpl.nameFont] || E.EVER_NAME_FONTS.baloo).cls;
      var el = E.EVER_siteRoot(d, tpl, opts);

      var nav = navLinks().map(function (l) {
        return '<a href="#ws-sec-' + l[0] + '" data-goto="' + l[0] + '">' + E.EVER_esc(l[1]) + '</a>';
      }).join('');

      var html = '';
      (d.order && d.order.length ? d.order : E.EVER_layoutOrder(E.EVER_findLayout('play'))).forEach(function (id) {
        var sec = S[id];
        if (!sec || !sec.on) return;

        if (id === 'hero') {
          html += '' +
            '<header class="ply-hero" id="ws-sec-hero">' +
              '<div class="ws-hero-bar">' +
                '<span class="ws-mono">' + E.EVER_esc(E.EVER_initials(B.name)) + '</span>' +
                '<nav class="ws-nav" aria-label="Event sections">' + nav + '</nav>' +
              '</div>' +
              '<span class="ply-dots ply-d1" aria-hidden="true"></span>' +
              '<span class="ply-dots ply-d2" aria-hidden="true"></span>' +
              '<span class="ply-heart ply-h1" aria-hidden="true">' + E.EVER_icon('heart') + '</span>' +
              '<span class="ply-heart ply-h2" aria-hidden="true">' + E.EVER_icon('heart') + '</span>' +
              '<div class="ply-hero-inner">' +
                '<p class="ply-kick">' + E.EVER_esc(sec.kicker) + '</p>' +
                '<span class="ply-arch"><img src="' + E.EVER_esc(E.EVER_photoSrc(sec.photo)) + '" alt="' +
                  E.EVER_esc(B.name) + '" fetchpriority="high"/></span>' +
                '<h1 class="ply-name ' + nf + '">' + E.EVER_esc(B.name) + '</h1>' +
                '<p class="ply-sub">' + E.EVER_esc(B.subtitle) + '</p>' +
                '<div class="ply-pills">' +
                  '<span class="ply-pill">' + E.EVER_icon('calendar') + E.EVER_esc(E.EVER_fmtLongDate(B.date)) + '</span>' +
                  '<span class="ply-pill">' + E.EVER_icon('clock') + E.EVER_esc(B.time) + '</span>' +
                '</div>' +
                '<a class="ws-btn ply-btn" href="#ws-sec-details" data-goto="details">' + E.EVER_icon('spark') + ' ' +
                  E.EVER_esc(sec.btnText || 'See the details') + '</a>' +
                (B.hostLine ? '<p class="ply-host">' + E.EVER_esc(B.hostLine) + '</p>' : '') +
              '</div>' +
            '</header>';
        } else if (id === 'details') {
          html += '' +
            '<section class="ws-sec ws-details ply-det" id="ws-sec-details">' +
              '<h2 class="ply-title">' + E.EVER_esc(sec.title) + '</h2>' +
              '<div class="ply-bubbles">' +
                '<div class="ply-bubble">' +
                  '<span class="ply-bic" aria-hidden="true">' + E.EVER_icon('calendar') + '</span>' +
                  '<b>' + E.EVER_esc(sec.whenLabel || 'When') + '</b>' +
                  '<strong>' + E.EVER_esc(E.EVER_fmtLongDate(B.date)) + '</strong>' +
                  '<span>' + E.EVER_esc(E.EVER_fmtWeekday(B.date)) + ' \u00b7 ' + E.EVER_esc(B.time) + '</span>' +
                '</div>' +
                '<div class="ply-bubble">' +
                  '<span class="ply-bic" aria-hidden="true">' + E.EVER_icon('pin') + '</span>' +
                  '<b>' + E.EVER_esc(sec.whereLabel || 'Where') + '</b>' +
                  '<strong>' + E.EVER_esc(B.venue) + '</strong>' +
                  '<span>' + E.EVER_esc(B.city) + '</span>' +
                '</div>' +
                '<div class="ply-bubble">' +
                  '<span class="ply-bic" aria-hidden="true">' + E.EVER_icon('heart') + '</span>' +
                  '<b>' + E.EVER_esc(sec.hostLabel || 'Hosted by') + '</b>' +
                  '<strong>' + E.EVER_esc(B.hostLine) + '</strong>' +
                '</div>' +
              '</div>' +
            '</section>';
        } else if (id === 'wishes') {
          var wishes = (sec.items || []).map(function (w) {
            return '<figure class="ply-wcard">' +
              '<blockquote>\u201c' + E.EVER_esc(w.msg) + '\u201d</blockquote>' +
              '<figcaption>\u2014 ' + E.EVER_esc(w.name) + '</figcaption>' +
            '</figure>';
          }).join('');
          html += '' +
            '<section class="ws-sec ws-wishes ply-wish" id="ws-sec-wishes">' +
              '<h2 class="ply-title">' + E.EVER_esc(sec.title) + '</h2>' +
              (sec.note ? '<p class="ply-note">' + E.EVER_esc(sec.note) + '</p>' : '') +
              '<div class="ply-wish-grid">' + wishes + '</div>' +
            '</section>';
        } else if (id === 'games') {
          var games = (sec.items || []).map(function (g) {
            return '<div class="ply-gcard">' +
              '<span class="ply-gic" aria-hidden="true">' + E.EVER_icon(g.icon) + '</span>' +
              '<div class="ply-gtx"><b>' + E.EVER_esc(g.title) + '</b>' +
              (g.text ? '<p>' + E.EVER_esc(g.text) + '</p>' : '') + '</div>' +
            '</div>';
          }).join('');
          html += '' +
            '<section class="ws-sec ws-games ply-games" id="ws-sec-games">' +
              '<h2 class="ply-title">' + E.EVER_esc(sec.title) + '</h2>' +
              (sec.note ? '<p class="ply-note">' + E.EVER_esc(sec.note) + '</p>' : '') +
              '<div class="ply-games-grid">' + games + '</div>' +
            '</section>';
        } else if (id === 'rsvp') {
          html += '' +
            '<section class="ws-sec ws-rsvp ply-rsvp" id="ws-sec-rsvp">' +
              '<div class="ply-rsvp-head">' +
                '<h2 class="ply-title">' + E.EVER_esc(sec.title) + '</h2>' +
                '<p class="ply-rsvp-note">' + E.EVER_esc(sec.note) + ' <b>' +
                  E.EVER_esc(E.EVER_fmtLongDate(sec.deadline)) + '</b></p>' +
              '</div>' +
              '<div class="ply-rsvp-card">' + E.EVER_rsvpFormHtml(sec) + '</div>' +
            '</section>';
        } else if (id === 'footer') {
          html += '' +
            '<footer class="ws-footer ply-foot" id="ws-sec-footer">' +
              '<span class="ply-foot-mono">' + E.EVER_esc(E.EVER_initials(B.name)) + '</span>' +
              '<p class="ply-thanks">' + E.EVER_esc(sec.thanks) + '</p>' +
              '<div class="ply-foot-lines">' +
                '<a href="tel:' + E.EVER_esc(String(sec.phone).replace(/\s/g, '')) + '">' + E.EVER_icon('phone') +
                  '<span>' + E.EVER_esc(sec.phone) + '</span></a>' +
                '<a href="mailto:' + E.EVER_esc(sec.email) + '">' + E.EVER_icon('mail') +
                  '<span>' + E.EVER_esc(sec.email) + '</span></a>' +
                '<a href="https://wa.me/' + E.EVER_esc(String(sec.phone).replace(/\D/g, '')) +
                  '" target="_blank" rel="noopener noreferrer">' + E.EVER_icon('whatsapp') +
                  '<span>' + E.EVER_esc(sec.whatsapp) + '</span></a>' +
              '</div>' +
              '<div class="ply-foot-bar">' +
                '<span>\u00a9 ' + new Date().getFullYear() + ' ' + E.EVER_esc(B.name) +
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
      var nf = (E.EVER_NAME_FONTS[d.nameFont] || E.EVER_NAME_FONTS[tpl.nameFont] || E.EVER_NAME_FONTS.baloo).cls;
      var el = E.EVER_miniRoot(tpl, d, 'play');

      var wishes = S.wishes && S.wishes.items ? S.wishes.items : [];
      var wishRows = wishes.slice(0, opts.short ? 0 : 2).map(function (w) {
        return '<span class="ply-m-wish"><b>' + E.EVER_esc(w.name) + '</b><i>' + E.EVER_esc(w.msg) + '</i></span>';
      }).join('');
      var games = S.games && S.games.items ? S.games.items : [];
      var gameRows = games.slice(0, opts.short ? 0 : 2).map(function (g) {
        return '<span class="ply-m-row">' + E.EVER_icon(g.icon) + '<b>' + E.EVER_esc(g.title) + '</b></span>';
      }).join('');

      el.innerHTML = '' +
        '<div class="ply-m-hero">' +
          '<span class="ply-m-kick">' + E.EVER_esc(S.hero.kicker || '') + '</span>' +
          '<span class="ply-m-arch"><img src="' + E.EVER_esc(E.EVER_photoSrc(S.hero.photo)) + '" alt=""/></span>' +
          '<strong class="ply-m-name ' + nf + '">' + E.EVER_esc(B.name) + '</strong>' +
          '<span class="ply-m-sub">' + E.EVER_esc(B.subtitle || '') + '</span>' +
          '<span class="ply-m-pill">' + E.EVER_icon('calendar') + E.EVER_esc(E.EVER_fmtLongDate(B.date)) + '</span>' +
        '</div>' +
        '<div class="ply-m-block">' +
          '<span class="ply-m-st">' + E.EVER_esc(S.details && S.details.title || 'Details') + '</span>' +
          '<span class="ply-m-row"><i class="ply-m-ic">' + E.EVER_icon('calendar') + '</i>' +
            '<b>' + E.EVER_esc(E.EVER_fmtLongDate(B.date)) + '</b></span>' +
          '<span class="ply-m-row"><i class="ply-m-ic">' + E.EVER_icon('pin') + '</i>' +
            '<b>' + E.EVER_esc(B.venue) + '</b></span>' +
          '<span class="ply-m-row"><i class="ply-m-ic">' + E.EVER_icon('heart') + '</i>' +
            '<b>' + E.EVER_esc(B.hostLine) + '</b></span>' +
        '</div>' +
        (opts.short ? '' :
        '<div class="ply-m-block ply-m-alt">' +
          '<span class="ply-m-st">' + E.EVER_esc(S.wishes && S.wishes.title || 'Guest book') + '</span>' + wishRows +
        '</div>' +
        '<div class="ply-m-block">' +
          '<span class="ply-m-st">' + E.EVER_esc(S.games && S.games.title || 'Games') + '</span>' + gameRows +
        '</div>') +
        '<div class="ply-m-foot">' +
          '<span class="ply-m-thanks">' + E.EVER_esc(S.footer && S.footer.thanks || '') + '</span>' +
          '<span class="ply-m-crest">' + E.EVER_esc(E.EVER_initials(B.name)) + '</span>' +
        '</div>';
      return el;
    }
  });
})();
