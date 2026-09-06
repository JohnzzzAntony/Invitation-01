/* ==========================================================================
   Ever RSVP — layout: fiesta (Birthday Party)
   Structure: full-color celebration hero (confetti + balloons + big age
   badge) → meet the star (photo + fun facts) → two bold detail cards →
   horizontal party schedule → games & fun → wishes band → RSVP →
   celebratory footer. Styles: css/ly-fiesta.css.
   ========================================================================== */
(function () {
  'use strict';
  var E = window;

  function navLinks() {
    return [['spotlight', 'The star'], ['details', 'Details'], ['schedule', 'Schedule'],
            ['games', 'Games'], ['wishes', 'Wishes'], ['rsvp', 'RSVP']];
  }

  E.EVER_registerLayout({
    id: 'fiesta',
    label: 'Birthday Party',
    events: ['birthday'],

    basics: [
      { k: 'name',     label: 'Celebrant name', type: 'text', ph: 'Aarav' },
      { k: 'age',      label: 'Age',            type: 'text', ph: '7' },
      { k: 'hostLine', label: 'Hosted by',      type: 'text', ph: 'Hosted by the Sharma family' },
      { k: 'date',     label: 'Date',           type: 'date' },
      { k: 'time',     label: 'Time',           type: 'text', ph: '04:00 PM onwards' },
      { k: 'venue',    label: 'Venue',          type: 'text', ph: 'Sunshine Park Pavilion' },
      { k: 'city',     label: 'City',           type: 'text', ph: 'Bengaluru' }
    ],

    sections: [
      { id: 'hero', label: 'Hero',
        fields: [
          { k: 'kicker',  label: 'Kicker line', type: 'text', ph: "You're invited to" },
          { k: 'subline', label: 'Fun sub-line', type: 'text', ph: 'Cake, games and a whole lot of fun' },
          { k: 'btnText', label: 'Button text', type: 'text', ph: 'RSVP for the party' }
        ] },
      { id: 'spotlight', label: 'Meet the star',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Meet the birthday star' },
          { k: 'text',  label: 'Intro text',    type: 'text', ph: 'Here is the star of the show…' },
          { k: 'photo', label: 'Photo',         type: 'photo' }
        ],
        list: { k: 'facts', label: 'Fun fact', blank: function () {
            return { icon: 'spark', text: 'New fun fact' }; },
          fields: [
            { k: 'icon', label: 'Icon', type: 'icon' },
            { k: 'text', label: 'Fact', type: 'text', ph: 'Future astronaut' }
          ] } },
      { id: 'details', label: 'Party details',
        fields: [
          { k: 'title',      label: 'Section title', type: 'text', ph: 'Party details' },
          { k: 'whenLabel',  label: 'When card label',  type: 'text', ph: 'When' },
          { k: 'whereLabel', label: 'Where card label', type: 'text', ph: 'Where' }
        ] },
      { id: 'schedule', label: 'Party schedule',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Party schedule' },
          { k: 'note',  label: 'Note under title', type: 'text', ph: 'The plan for the big day' }
        ],
        list: { k: 'items', label: 'Moment', blank: function () {
            return { time: '05:00 PM', title: 'New moment', note: '' }; },
          fields: [
            { k: 'time',  label: 'Time', type: 'text', ph: '05:00 PM' },
            { k: 'title', label: 'Title', type: 'text', ph: 'Cake time' },
            { k: 'note',  label: 'Note', type: 'text', ph: 'Candles and the first slice' }
          ] } },
      { id: 'games', label: 'Games & fun',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Games & fun' },
          { k: 'note',  label: 'Note under title', type: 'text', ph: 'Everyone wins something!' }
        ],
        list: { k: 'items', label: 'Activity', blank: function () {
            return { icon: 'game', title: 'New game', text: '' }; },
          fields: [
            { k: 'icon',  label: 'Icon', type: 'icon' },
            { k: 'title', label: 'Title', type: 'text', ph: 'Treasure hunt' },
            { k: 'text',  label: 'Description', type: 'text', ph: 'Follow the clues…' }
          ] } },
      { id: 'wishes', label: 'Wishes band',
        fields: [
          { k: 'title',   label: 'Title', type: 'text', ph: 'Leave your wishes' },
          { k: 'text',    label: 'Demo wish', type: 'textarea', ph: 'Happy birthday champ!…' },
          { k: 'signoff', label: 'Wish signoff', type: 'text', ph: '— Uncle Sam & Aunty Riya' },
          { k: 'count',   label: 'Wishes count', type: 'number', min: 1, max: 999 }
        ] },
      { id: 'rsvp', label: 'RSVP form',
        fields: [
          { k: 'title',     label: 'Heading', type: 'text', ph: 'RSVP for the party' },
          { k: 'note',      label: 'Note before date', type: 'text', ph: 'Please reply by' },
          { k: 'deadline',  label: 'Reply deadline', type: 'date' },
          { k: 'showPhone', label: 'Ask for phone number', type: 'check' },
          { k: 'guestsMax', label: 'Max guests per reply', type: 'number', min: 1, max: 12 },
          { k: 'showMsg',   label: 'Include message box', type: 'check' },
          { k: 'submit',    label: 'Submit button text', type: 'text', ph: 'Count me in' },
          { k: 'success',   label: 'Success message', type: 'text', ph: 'Yay! See you at the party!' }
        ],
        list: { k: 'meals', label: 'Meal option', blank: function () { return ''; },
          fields: [ { k: '', label: 'Option', type: 'text', ph: 'Kids meal' } ] } },
      { id: 'footer', label: 'Contact & footer',
        fields: [
          { k: 'phone',     label: 'Phone', type: 'text', ph: '+91 98765 43210' },
          { k: 'email',     label: 'E-mail', type: 'text', ph: 'hello@example.com' },
          { k: 'whatsapp',  label: 'WhatsApp link text', type: 'text', ph: 'WhatsApp the host' },
          { k: 'thanks',    label: 'Thank-you line', type: 'text', ph: 'Thank you for celebrating with us!' },
          { k: 'copyright', label: 'Copyright extra (optional)', type: 'text', ph: '' },
          { k: 'credit',    label: 'Credit line', type: 'text', ph: "Made with \u2665 for the big day" }
        ] }
    ],

    defaults: function () {
      return {
        basics: {
          name: 'Aarav', age: '7',
          hostLine: 'Hosted by the Sharma family',
          date: E.EVER_futureISO(2, 14), time: '04:00 PM onwards',
          venue: 'Sunshine Park Pavilion', city: 'Bengaluru'
        },
        sections: {
          hero: {
            on: true,
            kicker: "You're invited to",
            subline: 'Cake, games and a whole lot of fun \u2014 come celebrate with us!',
            btnText: 'RSVP for the party'
          },
          spotlight: {
            on: true,
            title: 'Meet the birthday star',
            text: 'Full of energy, jokes and dinosaur facts \u2014 here is the star of the show.',
            photo: 'balloons',
            facts: [
              { icon: 'star',  text: 'Future astronaut, expert sandcastle builder' },
              { icon: 'game',  text: 'Chess champion of the living room' },
              { icon: 'cake',  text: 'Chocolate cake is the only cake' },
              { icon: 'music', text: 'Knows every word of the dinosaur song' }
            ]
          },
          details: {
            on: true, title: 'Party details',
            whenLabel: 'When', whereLabel: 'Where'
          },
          schedule: {
            on: true, title: 'Party schedule', note: 'The plan for the big day',
            items: [
              { time: '04:00 PM', title: 'Guests arrive',  note: 'Balloons, music and welcome drinks' },
              { time: '04:30 PM', title: 'Games arena',    note: 'Treasure hunt and musical chairs' },
              { time: '05:30 PM', title: 'Cake time',      note: 'Candles, song and the first slice' },
              { time: '06:15 PM', title: 'Return gifts',   note: 'Goodie bags for every guest' }
            ]
          },
          games: {
            on: true, title: 'Games & fun', note: 'Everyone wins something!',
            items: [
              { icon: 'game',  title: 'Treasure hunt',     text: 'Follow the clues to the hidden treasure chest.' },
              { icon: 'music', title: 'Musical statues',   text: 'Freeze when the music stops \u2014 last one moving is out.' },
              { icon: 'cake',  title: 'Cupcake decorating',text: 'Sprinkles, frosting and your own masterpiece.' },
              { icon: 'gift',  title: 'Pass the parcel',   text: 'Layered wrapping with tiny surprises in every layer.' },
              { icon: 'star',  title: 'Pin the tail',      text: 'Blindfolds on, giggles guaranteed.' },
              { icon: 'spark', title: 'Bubble disco',      text: 'Bubbles everywhere with party music.' }
            ]
          },
          wishes: {
            on: true,
            title: 'Leave your wishes',
            text: 'Happy birthday champ! May your year be full of adventures, laughter and double-scoop ice cream.',
            signoff: '\u2014 Uncle Sam & Aunty Riya',
            count: 64
          },
          rsvp: {
            on: true,
            title: 'RSVP for the party',
            note: 'Please reply by',
            deadline: E.EVER_futureISO(1, 30),
            showPhone: true,
            guestsMax: 6,
            meals: ['Kids meal', 'Vegetarian', 'Non vegetarian', 'Just cake for me'],
            showMsg: true,
            submit: 'Count me in',
            success: 'Yay! Your reply is in \u2014 see you at the party!'
          },
          footer: {
            on: true,
            phone: '+91 98765 43210',
            email: 'hello@aaravturns7.com',
            whatsapp: 'WhatsApp the host',
            thanks: 'Thank you for celebrating with us!',
            copyright: '',
            credit: "Made with \u2665 for Aarav's big day"
          }
        }
      };
    },

    render: function (d, tpl, opts) {
      var B = d.basics, S = d.sections;
      var nf = (E.EVER_NAME_FONTS[d.nameFont] || E.EVER_NAME_FONTS[tpl.nameFont] || E.EVER_NAME_FONTS.play).cls;
      var el = E.EVER_siteRoot(d, tpl, opts);

      var nav = navLinks().map(function (l) {
        return '<a href="#ws-sec-' + l[0] + '" data-goto="' + l[0] + '">' + E.EVER_esc(l[1]) + '</a>';
      }).join('');

      var html = '';
      (d.order && d.order.length ? d.order : E.EVER_layoutOrder(E.EVER_findLayout('fiesta'))).forEach(function (id) {
        var sec = S[id];
        if (!sec || !sec.on) return;

        if (id === 'hero') {
          html += '' +
            '<header class="fsi-hero" id="ws-sec-hero">' +
              '<span class="fsi-conf fsi-conf-a" aria-hidden="true"></span>' +
              '<span class="fsi-conf fsi-conf-b" aria-hidden="true"></span>' +
              '<span class="fsi-b fsi-b1" aria-hidden="true"></span>' +
              '<span class="fsi-b fsi-b2" aria-hidden="true"></span>' +
              '<span class="fsi-b fsi-b3" aria-hidden="true"></span>' +
              '<span class="fsi-b fsi-b4" aria-hidden="true"></span>' +
              '<div class="ws-hero-bar">' +
                '<span class="ws-mono">' + E.EVER_esc(E.EVER_initials(B.name)) + '</span>' +
                '<nav class="ws-nav" aria-label="Event sections">' + nav + '</nav>' +
              '</div>' +
              '<div class="fsi-hero-inner">' +
                '<p class="fsi-kick">' + E.EVER_esc(sec.kicker) + '</p>' +
                (B.age ? '<span class="fsi-age"><b>' + E.EVER_esc(B.age) + '</b><i>years old</i></span>' : '') +
                '<h1 class="fsi-name ' + nf + '">' + E.EVER_esc(B.name) + '</h1>' +
                '<p class="fsi-sub">' + E.EVER_esc(sec.subline) + '</p>' +
                '<p class="fsi-when">' + E.EVER_icon('calendar') + ' ' + E.EVER_esc(E.EVER_fmtHeroDate(B.date)) +
                  ' <i class="fsi-dot" aria-hidden="true"></i> ' + E.EVER_icon('pin') + ' ' +
                  E.EVER_esc(B.venue) + ', ' + E.EVER_esc(B.city) + '</p>' +
                '<a class="ws-btn fsi-cta" href="#ws-sec-rsvp" data-goto="rsvp">' + E.EVER_icon('gift') + ' ' +
                  E.EVER_esc(sec.btnText || 'RSVP for the party') + '</a>' +
                (B.hostLine ? '<p class="fsi-host">' + E.EVER_esc(B.hostLine) + '</p>' : '') +
              '</div>' +
            '</header>';
        } else if (id === 'spotlight') {
          var facts = (sec.facts || []).map(function (f) {
            return '<div class="fsi-fact"><span class="fsi-fact-ic" aria-hidden="true">' + E.EVER_icon(f.icon) + '</span>' +
              '<span class="fsi-fact-tx">' + E.EVER_esc(f.text) + '</span></div>';
          }).join('');
          html += '' +
            '<section class="ws-sec ws-spotlight fsi-spot" id="ws-sec-spotlight">' +
              '<h2 class="fsi-title">' + E.EVER_esc(sec.title) + '</h2>' +
              '<div class="fsi-spot-grid">' +
                '<div class="fsi-polaroid">' +
                  '<img src="' + E.EVER_esc(E.EVER_photoSrc(sec.photo)) + '" alt="' + E.EVER_esc(B.name) + '" loading="lazy"/>' +
                  '<span class="fsi-tape" aria-hidden="true"></span>' +
                  '<b class="fsi-pola-cap">' + E.EVER_esc(B.name) + ' \u00b7 ' + E.EVER_esc(B.age || '') + '</b>' +
                '</div>' +
                '<div class="fsi-facts">' +
                  '<p class="fsi-facts-intro">' + E.EVER_esc(sec.text) + '</p>' + facts +
                '</div>' +
              '</div>' +
            '</section>';
        } else if (id === 'details') {
          html += '' +
            '<section class="ws-sec ws-details fsi-det" id="ws-sec-details">' +
              '<h2 class="fsi-title">' + E.EVER_esc(sec.title) + '</h2>' +
              '<div class="fsi-det-grid">' +
                '<div class="fsi-det-card">' +
                  '<span class="fsi-det-ic" aria-hidden="true">' + E.EVER_icon('calendar') + '</span>' +
                  '<b class="fsi-det-lab">' + E.EVER_esc(sec.whenLabel || 'When') + '</b>' +
                  '<strong class="fsi-det-big">' + E.EVER_esc(E.EVER_fmtWeekday(B.date)) + '</strong>' +
                  '<span class="fsi-det-sub">' + E.EVER_esc(E.EVER_fmtLongDate(B.date)) + '</span>' +
                  '<span class="fsi-det-sub">' + E.EVER_esc(B.time) + '</span>' +
                '</div>' +
                '<div class="fsi-det-card">' +
                  '<span class="fsi-det-ic" aria-hidden="true">' + E.EVER_icon('pin') + '</span>' +
                  '<b class="fsi-det-lab">' + E.EVER_esc(sec.whereLabel || 'Where') + '</b>' +
                  '<strong class="fsi-det-big">' + E.EVER_esc(B.venue) + '</strong>' +
                  '<span class="fsi-det-sub">' + E.EVER_esc(B.city) + '</span>' +
                  '<a class="fsi-det-map" target="_blank" rel="noopener noreferrer" href="' +
                    E.EVER_esc(E.EVER_directionsUrl(B.venue, B.city)) + '">' + E.EVER_icon('share') +
                    ' Open in Maps</a>' +
                '</div>' +
              '</div>' +
            '</section>';
        } else if (id === 'schedule') {
          var items = (sec.items || []).map(function (m, i) {
            return '<div class="fsi-scard">' +
              '<span class="fsi-time">' + E.EVER_esc(m.time) + '</span>' +
              '<b>' + E.EVER_esc(m.title) + '</b>' +
              (m.note ? '<p>' + E.EVER_esc(m.note) + '</p>' : '') +
              (i < (sec.items.length - 1) ? '<span class="fsi-slink" aria-hidden="true"></span>' : '') +
            '</div>';
          }).join('');
          html += '' +
            '<section class="ws-sec ws-schedule fsi-sched" id="ws-sec-schedule">' +
              '<h2 class="fsi-title">' + E.EVER_esc(sec.title) + '</h2>' +
              (sec.note ? '<p class="fsi-note">' + E.EVER_esc(sec.note) + '</p>' : '') +
              '<div class="fsi-track">' + items + '</div>' +
            '</section>';
        } else if (id === 'games') {
          var games = (sec.items || []).map(function (g) {
            return '<div class="fsi-gcard"><span class="fsi-gic" aria-hidden="true">' + E.EVER_icon(g.icon) + '</span>' +
              '<b>' + E.EVER_esc(g.title) + '</b>' +
              (g.text ? '<p>' + E.EVER_esc(g.text) + '</p>' : '') + '</div>';
          }).join('');
          html += '' +
            '<section class="ws-sec ws-games fsi-games" id="ws-sec-games">' +
              '<h2 class="fsi-title">' + E.EVER_esc(sec.title) + '</h2>' +
              (sec.note ? '<p class="fsi-note">' + E.EVER_esc(sec.note) + '</p>' : '') +
              '<div class="fsi-games-grid">' + games + '</div>' +
            '</section>';
        } else if (id === 'wishes') {
          html += '' +
            '<section class="ws-sec ws-wishes fsi-wish" id="ws-sec-wishes">' +
              '<div class="fsi-wish-band">' +
                '<span class="fsi-star fsi-star-a" aria-hidden="true">' + E.EVER_icon('star') + '</span>' +
                '<span class="fsi-star fsi-star-b" aria-hidden="true">' + E.EVER_icon('spark') + '</span>' +
                '<span class="fsi-star fsi-star-c" aria-hidden="true">' + E.EVER_icon('star') + '</span>' +
                '<b class="fsi-count">' + E.EVER_esc(parseInt(sec.count, 10) || 0) + '</b>' +
                '<span class="fsi-count-lab">wishes and counting</span>' +
                '<p class="fsi-wish-quote">\u201c' + E.EVER_esc(sec.text) + '\u201d</p>' +
                (sec.signoff ? '<span class="fsi-wish-sign">' + E.EVER_esc(sec.signoff) + '</span>' : '') +
                '<h2 class="fsi-wish-title">' + E.EVER_esc(sec.title) + '</h2>' +
              '</div>' +
            '</section>';
        } else if (id === 'rsvp') {
          html += '' +
            '<section class="ws-sec ws-rsvp fsi-rsvp" id="ws-sec-rsvp">' +
              '<div class="fsi-rsvp-head">' +
                '<h2 class="fsi-title">' + E.EVER_esc(sec.title) + '</h2>' +
                '<p class="fsi-rsvp-note">' + E.EVER_esc(sec.note) + ' <b>' +
                  E.EVER_esc(E.EVER_fmtLongDate(sec.deadline)) + '</b></p>' +
              '</div>' +
              '<div class="fsi-rsvp-card">' + E.EVER_rsvpFormHtml(sec) + '</div>' +
            '</section>';
        } else if (id === 'footer') {
          html += '' +
            '<footer class="ws-footer fsi-foot" id="ws-sec-footer">' +
              '<span class="fsi-foot-mono">' + E.EVER_esc(E.EVER_initials(B.name)) + '</span>' +
              '<p class="fsi-thanks">' + E.EVER_esc(sec.thanks) + '</p>' +
              '<div class="fsi-chips">' +
                '<a class="fsi-chip" href="tel:' + E.EVER_esc(String(sec.phone).replace(/\s/g, '')) + '">' +
                  E.EVER_icon('phone') + '<span>' + E.EVER_esc(sec.phone) + '</span></a>' +
                '<a class="fsi-chip" href="mailto:' + E.EVER_esc(sec.email) + '">' +
                  E.EVER_icon('mail') + '<span>' + E.EVER_esc(sec.email) + '</span></a>' +
                '<a class="fsi-chip" href="https://wa.me/' + E.EVER_esc(String(sec.phone).replace(/\D/g, '')) +
                  '" target="_blank" rel="noopener noreferrer">' + E.EVER_icon('whatsapp') +
                  '<span>' + E.EVER_esc(sec.whatsapp) + '</span></a>' +
              '</div>' +
              '<div class="fsi-foot-bar">' +
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
      var nf = (E.EVER_NAME_FONTS[d.nameFont] || E.EVER_NAME_FONTS[tpl.nameFont] || E.EVER_NAME_FONTS.play).cls;
      var el = E.EVER_miniRoot(tpl, d, 'fiesta');

      var sched = S.schedule && S.schedule.items ? S.schedule.items : [];
      var games = S.games && S.games.items ? S.games.items : [];
      var schedRows = sched.slice(0, opts.short ? 2 : 3).map(function (m) {
        return '<span class="fsi-m-row"><i class="fsi-m-time">' + E.EVER_esc(m.time) + '</i>' +
          '<b>' + E.EVER_esc(m.title) + '</b></span>';
      }).join('');
      var gameRows = games.slice(0, opts.short ? 0 : 2).map(function (g) {
        return '<span class="fsi-m-row">' + E.EVER_icon(g.icon) + '<b>' + E.EVER_esc(g.title) + '</b></span>';
      }).join('');

      el.innerHTML = '' +
        '<div class="fsi-m-hero">' +
          '<span class="fsi-m-mono">' + E.EVER_esc(E.EVER_initials(B.name)) + '</span>' +
          '<span class="fsi-m-age"><b>' + E.EVER_esc(B.age || '') + '</b></span>' +
          '<span class="fsi-m-kick">' + E.EVER_esc(S.hero.kicker || '') + '</span>' +
          '<strong class="fsi-m-name ' + nf + '">' + E.EVER_esc(B.name) + '</strong>' +
          '<span class="fsi-m-date">' + E.EVER_esc(E.EVER_fmtHeroDate(B.date)) + '</span>' +
          '<span class="fsi-m-btn">' + E.EVER_esc(S.hero.btnText || 'RSVP') + '</span>' +
        '</div>' +
        '<div class="fsi-m-block">' +
          '<span class="fsi-m-st">' + E.EVER_esc(S.schedule && S.schedule.title || 'Schedule') + '</span>' + schedRows +
        '</div>' +
        (opts.short ? '' :
        '<div class="fsi-m-block fsi-m-alt">' +
          '<span class="fsi-m-st">' + E.EVER_esc(S.games && S.games.title || 'Games') + '</span>' + gameRows +
        '</div>') +
        '<div class="fsi-m-foot">' +
          '<span class="fsi-m-thanks">' + E.EVER_esc(S.footer && S.footer.thanks || '') + '</span>' +
          '<span class="fsi-m-crest">' + E.EVER_esc(E.EVER_initials(B.name)) + '</span>' +
        '</div>';
      return el;
    }
  });
})();
