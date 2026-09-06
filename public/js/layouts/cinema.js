/* ==========================================================================
   Ever RSVP — layout: cinema (Cinematic Anniversary)
   Full-bleed film-poster hero with giant years watermark → dark "celebrating
   N years" stats band (with countdown) → vertical love-story timeline with
   alternating round photos → vow-renewal evening schedule → wide gallery
   stills with captions → dark elegant RSVP → centered monogram footer.
   Styles: css/ly-cinema.css (scoped under .ws-cinema / .wsm.ws-cinema).
   ========================================================================== */
(function () {
  'use strict';
  var E = window;

  /* Dynamic copy tokens resolved against basics at render time:
     %years%  -> basics.years
     %then%   -> (current year - years), e.g. 50 years ago
     %when%   -> year of basics.date (the renewal year)
     %nameA% / %nameB% -> partner names                                    */
  function tk(s, B) {
    var y = parseInt(B.years, 10);
    var then = isNaN(y) ? '' : String(new Date().getFullYear() - y);
    var when = String(E.EVER_dateObj(B.date).getFullYear());
    return String(s == null ? '' : s)
      .replace(/%years%/g, B.years || '')
      .replace(/%then%/g, then)
      .replace(/%when%/g, when)
      .replace(/%nameA%/g, B.nameA || '')
      .replace(/%nameB%/g, B.nameB || '');
  }

  function navLinks() {
    return [['stats', 'Celebration'], ['story', 'Our story'], ['schedule', 'The evening'],
            ['gallery', 'Gallery'], ['rsvp', 'RSVP']];
  }

  E.EVER_registerLayout({
    id: 'cinema',
    label: 'Cinematic Anniversary',
    events: ['anniversary'],

    basics: [
      { k: 'nameA', label: 'First partner', type: 'text', ph: 'Grace' },
      { k: 'nameB', label: 'Second partner', type: 'text', ph: 'Jonathan' },
      { k: 'years', label: 'Years together', type: 'text', ph: '50' },
      { k: 'date',  label: 'Celebration date', type: 'date' },
      { k: 'time',  label: 'Time', type: 'text', ph: '06:30 PM' },
      { k: 'venue', label: 'Venue', type: 'text', ph: 'The Rosewood Conservatory' },
      { k: 'city',  label: 'City / region', type: 'text', ph: 'Greenwich' },
      { k: 'quote', label: 'Tagline / quote', type: 'text', ph: 'Fifty years down, forever to go.' }
    ],

    sections: [
      { id: 'hero', label: 'Hero',
        fields: [
          { k: 'kicker', label: 'Kicker (%years% token allowed)', type: 'text', ph: '50 years of love' },
          { k: 'photo',  label: 'Hero photo', type: 'photo' }
        ] },
      { id: 'stats', label: 'Celebration stats',
        fields: [
          { k: 'kicker',     label: 'Kicker', type: 'text', ph: 'Celebrating' },
          { k: 'title',      label: 'Heading (%years% token allowed)', type: 'text', ph: '50 years of us' },
          { k: 'showTimer',  label: 'Show countdown', type: 'check' },
          { k: 'timerLabel', label: 'Countdown label', type: 'text', ph: 'Counting down to the evening' }
        ],
        list: { k: 'items', label: 'Stat', blank: function () {
            return { icon: 'heart', num: '', label: 'New stat' }; },
          fields: [
            { k: 'icon',  label: 'Icon', type: 'icon' },
            { k: 'num',   label: 'Number / value (tokens allowed)', type: 'text', ph: '50' },
            { k: 'label', label: 'Label', type: 'text', ph: 'Years together' }
          ] } },
      { id: 'story', label: 'Love story',
        fields: [
          { k: 'kicker', label: 'Kicker', type: 'text', ph: 'Scene by scene' },
          { k: 'title',  label: 'Section title', type: 'text', ph: 'The story so far' }
        ],
        list: { k: 'items', label: 'Chapter', blank: function () {
            return { photo: 'couple', year: '', title: 'New chapter', text: '' }; },
          fields: [
            { k: 'photo', label: 'Photo', type: 'photo' },
            { k: 'year',  label: 'Year / chapter label', type: 'text', ph: '1975' },
            { k: 'title', label: 'Title', type: 'text', ph: 'First met' },
            { k: 'text',  label: 'Description', type: 'textarea' }
          ] } },
      { id: 'schedule', label: 'Vow renewal evening',
        fields: [
          { k: 'kicker', label: 'Kicker', type: 'text', ph: 'Vow renewal' },
          { k: 'title',  label: 'Section title', type: 'text', ph: 'The evening' },
          { k: 'note',   label: 'Note under title', type: 'text', ph: 'Dress: garden formal' }
        ],
        list: { k: 'items', label: 'Moment', blank: function () {
            return { time: '', title: 'New moment', note: '' }; },
          fields: [
            { k: 'time',  label: 'Time', type: 'text', ph: '06:30 PM' },
            { k: 'title', label: 'Title', type: 'text', ph: 'Guests arrive' },
            { k: 'note',  label: 'Note', type: 'text', ph: 'Champagne on the terrace' }
          ] } },
      { id: 'gallery', label: 'Gallery stills',
        fields: [
          { k: 'kicker', label: 'Kicker', type: 'text', ph: 'Frames' },
          { k: 'title',  label: 'Section title', type: 'text', ph: 'Moments on film' }
        ],
        list: { k: 'items', label: 'Still', blank: function () {
            return { src: 'anniv', caption: '' }; },
          fields: [
            { k: 'src',     label: 'Photo', type: 'photo' },
            { k: 'caption', label: 'Caption', type: 'text', ph: 'The head table, dressed for the evening' }
          ] } },
      { id: 'rsvp', label: 'RSVP form',
        fields: [
          { k: 'title',     label: 'Heading', type: 'text', ph: 'Join the celebration' },
          { k: 'note',      label: 'Note before date', type: 'text', ph: 'Kindly reply by' },
          { k: 'deadline',  label: 'Reply deadline', type: 'date' },
          { k: 'showPhone', label: 'Ask for phone number', type: 'check' },
          { k: 'guestsMax', label: 'Max guests per reply', type: 'number', min: 1, max: 12 },
          { k: 'showMsg',   label: 'Include message box', type: 'check' },
          { k: 'submit',    label: 'Submit button text', type: 'text', ph: 'Send RSVP' },
          { k: 'success',   label: 'Success message', type: 'text', ph: 'Thank you!' }
        ],
        list: { k: 'meals', label: 'Meal option', blank: function () { return ''; },
          fields: [ { k: '', label: 'Option', type: 'text', ph: 'Vegetarian' } ] } },
      { id: 'footer', label: 'Footer',
        fields: [
          { k: 'phone',     label: 'Phone', type: 'text', ph: '+1 203 555 0134' },
          { k: 'email',     label: 'E-mail', type: 'text', ph: 'us@example.com' },
          { k: 'thanks',    label: 'Thank-you line', type: 'text', ph: 'Thank you for being part of our story.' },
          { k: 'copyright', label: 'Copyright extra (optional)', type: 'text', ph: '' },
          { k: 'credit',    label: 'Credit line', type: 'text', ph: 'Made with love for our golden year' }
        ] }
    ],

    defaults: function () {
      return {
        basics: {
          nameA: 'Grace', nameB: 'Jonathan', years: '50',
          date: E.EVER_futureISO(2, 8), time: '06:30 PM',
          venue: 'The Rosewood Conservatory', city: 'Greenwich',
          quote: 'Fifty years down, forever to go.'
        },
        sections: {
          hero: {
            on: true,
            kicker: '%years% years of love',
            photo: 'anniv'
          },
          stats: {
            on: true,
            kicker: 'Celebrating',
            title: '%years% years of us',
            showTimer: true,
            timerLabel: 'Counting down to the renewal evening',
            items: [
              { icon: 'heart',    num: '%years%', label: 'Years together' },
              { icon: 'rings',    num: '%then%',  label: 'The year it began' },
              { icon: 'calendar', num: '%when%',  label: 'Renewal year' },
              { icon: 'glass',    num: '120',     label: 'Guests expected' }
            ]
          },
          story: {
            on: true, kicker: 'Scene by scene', title: 'The story so far',
            items: [
              { photo: 'cafe',  year: 'The beginning', title: 'A chance meeting',
                text: 'A shared umbrella, a missed bus, and a conversation that never really ended.' },
              { photo: 'couple', year: 'Year one', title: 'Every Sunday',
                text: 'The little caf\u00e9 on the corner learned our order by heart \u2014 and never once got it wrong.' },
              { photo: 'rings', year: 'The vow', title: 'She said yes',
                text: 'A quiet evening, a nervous question, and a lifetime answered in one word.' },
              { photo: 'dance', year: 'Still counting', title: 'The dance goes on',
                text: 'Through every move and every season, we never once lost the step.' }
            ]
          },
          schedule: {
            on: true, kicker: 'Vow renewal', title: 'The evening',
            note: 'Dress: garden formal \u00b7 The Rosewood Conservatory',
            items: [
              { time: '06:30 PM', title: 'Guests arrive',        note: 'Champagne on the conservatory terrace' },
              { time: '07:00 PM', title: 'Renewal of vows',      note: 'Officiated beneath the glass house' },
              { time: '07:45 PM', title: 'Dinner is served',     note: 'A menu inspired by our wedding year' },
              { time: '09:00 PM', title: 'First dance, again',   note: 'The same song, fifty years on' },
              { time: '10:00 PM', title: 'Sparklers & toasts',   note: 'Under the garden lights' }
            ]
          },
          gallery: {
            on: true, kicker: 'Frames', title: 'Moments on film',
            items: [
              { src: 'anniv',  caption: 'The head table, dressed for the evening' },
              { src: 'dance',  caption: 'The first dance, all over again' },
              { src: 'silver', caption: 'Champagne towers & old friends' }
            ]
          },
          rsvp: {
            on: true,
            title: 'Join the celebration',
            note: 'Kindly reply by',
            deadline: E.EVER_futureISO(1, 24),
            showPhone: true,
            guestsMax: 6,
            meals: ['Standard', 'Vegetarian', 'Gluten free'],
            showMsg: true,
            submit: 'Send RSVP',
            success: 'Thank you \u2014 your seats are being kept. We can\u2019t wait to celebrate with you.'
          },
          footer: {
            on: true,
            phone: '+1 203 555 0134',
            email: 'grace.and.jonathan@example.com',
            thanks: 'Thank you for fifty wonderful years of friendship.',
            copyright: '',
            credit: 'Made with love for our golden year'
          }
        }
      };
    },

    render: function (d, tpl, opts) {
      var B = d.basics, S = d.sections;
      var nf = (E.EVER_NAME_FONTS[d.nameFont] || E.EVER_NAME_FONTS[tpl.nameFont] || E.EVER_NAME_FONTS.pfd).cls;
      var el = E.EVER_siteRoot(d, tpl, opts);

      var nav = navLinks().map(function (l) {
        return '<a href="#ws-sec-' + l[0] + '" data-goto="' + l[0] + '">' + E.EVER_esc(l[1]) + '</a>';
      }).join('');

      var html = '';
      (d.order && d.order.length ? d.order : E.EVER_layoutOrder(E.EVER_findLayout('cinema'))).forEach(function (id) {
        var sec = S[id];
        if (!sec || !sec.on) return;

        if (id === 'hero') {
          html += '' +
            '<header class="cn-hero" id="ws-sec-hero">' +
              '<img class="cn-hero-img" src="' + E.EVER_esc(E.EVER_photoSrc(sec.photo)) + '" alt="" aria-hidden="true"/>' +
              '<div class="cn-hero-shade" aria-hidden="true"></div>' +
              '<span class="cn-hero-year f-pfd" aria-hidden="true">' + E.EVER_esc(B.years) + '</span>' +
              '<div class="cn-bar">' +
                '<span class="cn-mono">' + E.EVER_esc(E.EVER_monogram(B.nameA, B.nameB)) + '</span>' +
                '<nav class="cn-nav" aria-label="Event sections">' + nav + '</nav>' +
              '</div>' +
              '<div class="cn-hero-inner">' +
                '<p class="cn-kick">' + E.EVER_esc(tk(sec.kicker, B)) + '</p>' +
                '<h1 class="cn-names ' + nf + '">' +
                  E.EVER_esc(B.nameA) + ' <span class="cn-amp">\u0026</span> ' + E.EVER_esc(B.nameB) + '</h1>' +
                (B.quote ? '<p class="cn-tag">\u201c' + E.EVER_esc(B.quote) + '\u201d</p>' : '') +
                '<span class="cn-rule" aria-hidden="true"></span>' +
                '<p class="cn-when">' + E.EVER_esc(E.EVER_fmtHeroDate(B.date)) + ' \u00b7 ' + E.EVER_esc(B.time) + '</p>' +
                '<p class="cn-where">' + E.EVER_esc(B.venue) + ' \u00b7 ' + E.EVER_esc(B.city) + '</p>' +
              '</div>' +
              '<a class="cn-scroll" href="#ws-sec-stats" data-goto="stats" aria-label="Scroll to celebration">' +
                E.EVER_icon('chevron') + '</a>' +
            '</header>';
        } else if (id === 'stats') {
          var timer = sec.showTimer
            ? '<p class="cn-timer-label">' + E.EVER_esc(tk(sec.timerLabel, B)) + '</p>' + E.EVER_timerHtml(B.date)
            : '';
          html += '' +
            '<section class="ws-sec cn-stats" id="ws-sec-stats">' +
              '<p class="cn-kick-l">' + E.EVER_esc(tk(sec.kicker, B)) + '</p>' +
              '<h2 class="cn-stats-title ' + nf + '">' + E.EVER_esc(tk(sec.title, B)) + '</h2>' +
              '<div class="cn-stats-row">' +
                (sec.items || []).map(function (st) {
                  return '<div class="cn-stat">' + E.EVER_icon(st.icon) +
                    '<b class="cn-stat-num">' + E.EVER_esc(tk(st.num, B)) + '</b>' +
                    '<span class="cn-stat-lb">' + E.EVER_esc(st.label) + '</span></div>';
                }).join('') +
              '</div>' +
              '<div class="cn-timer-wrap">' + timer + '</div>' +
            '</section>';
        } else if (id === 'story') {
          html += '' +
            '<section class="ws-sec cn-story" id="ws-sec-story">' +
              '<p class="cn-kick-l">' + E.EVER_esc(sec.kicker) + '</p>' +
              '<h2 class="cn-title ' + nf + '">' + E.EVER_esc(sec.title) + '</h2>' +
              '<div class="cn-tl">' +
                (sec.items || []).map(function (m, i) {
                  return '<div class="cn-tl-row' + (i % 2 ? ' alt' : '') + '">' +
                    '<div class="cn-tl-txt">' +
                      '<i class="cn-tl-year">' + E.EVER_esc(m.year) + '</i>' +
                      '<b class="cn-tl-t">' + E.EVER_esc(m.title) + '</b>' +
                      '<p>' + E.EVER_esc(m.text) + '</p>' +
                    '</div>' +
                    '<div class="cn-tl-node"><span class="cn-tl-ph">' +
                      '<img src="' + E.EVER_esc(E.EVER_photoSrc(m.photo)) + '" alt="' + E.EVER_esc(m.title) + '" loading="lazy"/>' +
                    '</span></div>' +
                    '<div class="cn-tl-txt cn-tl-ghost" aria-hidden="true"></div>' +
                  '</div>';
                }).join('') +
              '</div>' +
            '</section>';
        } else if (id === 'schedule') {
          html += '' +
            '<section class="ws-sec cn-sched" id="ws-sec-schedule">' +
              '<p class="cn-kick-l">' + E.EVER_esc(sec.kicker) + '</p>' +
              '<h2 class="cn-title ' + nf + '">' + E.EVER_esc(sec.title) + '</h2>' +
              (sec.note ? '<p class="cn-sched-note">' + E.EVER_esc(sec.note) + '</p>' : '') +
              '<div class="cn-sc-list">' +
                (sec.items || []).map(function (it) {
                  return '<div class="cn-sc-row">' +
                    '<span class="cn-sc-time">' + E.EVER_esc(it.time) + '</span>' +
                    '<span class="cn-sc-t">' + E.EVER_esc(it.title) + '</span>' +
                    (it.note ? '<span class="cn-sc-note">' + E.EVER_esc(it.note) + '</span>' : '') +
                  '</div>';
                }).join('') +
              '</div>' +
            '</section>';
        } else if (id === 'gallery') {
          html += '' +
            '<section class="ws-sec cn-gallery" id="ws-sec-gallery">' +
              '<p class="cn-kick-l">' + E.EVER_esc(sec.kicker) + '</p>' +
              '<h2 class="cn-title ' + nf + '">' + E.EVER_esc(sec.title) + '</h2>' +
              '<div class="cn-stills">' +
                (sec.items || []).map(function (p) {
                  return '<figure class="cn-still">' +
                    '<span class="cn-still-frame"><img src="' + E.EVER_esc(E.EVER_photoSrc(p.src)) + '" alt="' +
                      E.EVER_esc(p.caption || 'Anniversary photo') + '" loading="lazy"/></span>' +
                    (p.caption ? '<figcaption><i aria-hidden="true"></i><span>' + E.EVER_esc(p.caption) +
                      '</span><i aria-hidden="true"></i></figcaption>' : '') +
                  '</figure>';
                }).join('') +
              '</div>' +
            '</section>';
        } else if (id === 'rsvp') {
          html += '' +
            '<section class="ws-sec cn-rsvp" id="ws-sec-rsvp">' +
              '<div class="cn-rsvp-box">' +
                '<p class="cn-kick-l light">' + E.EVER_esc('RSVP') + '</p>' +
                '<h2 class="cn-title on-dark ' + nf + '">' + E.EVER_esc(sec.title) + '</h2>' +
                '<p class="cn-rsvp-note">' + E.EVER_esc(sec.note) +
                  ' <b>' + E.EVER_esc(E.EVER_fmtLongDate(sec.deadline)) + '</b></p>' +
                E.EVER_rsvpFormHtml(sec) +
              '</div>' +
            '</section>';
        } else if (id === 'footer') {
          html += '' +
            '<footer class="ws-footer cn-foot" id="ws-sec-footer">' +
              '<span class="ws-crest" aria-hidden="true"><i></i>' +
                E.EVER_esc(E.EVER_monogram(B.nameA, B.nameB)) + '<i></i></span>' +
              '<p class="cn-foot-names ' + nf + '">' + E.EVER_esc(B.nameA) +
                ' <span class="cn-amp">\u0026</span> ' + E.EVER_esc(B.nameB) + '</p>' +
              '<p class="cn-foot-thanks">' + E.EVER_esc(sec.thanks) + '</p>' +
              '<div class="cn-foot-lines">' +
                (sec.phone ? '<a class="cn-foot-line" href="tel:' +
                  E.EVER_esc(String(sec.phone).replace(/\s/g, '')) + '">' + E.EVER_icon('phone') +
                  E.EVER_esc(sec.phone) + '</a>' : '') +
                (sec.email ? '<a class="cn-foot-line" href="mailto:' + E.EVER_esc(sec.email) + '">' +
                  E.EVER_icon('mail') + E.EVER_esc(sec.email) + '</a>' : '') +
              '</div>' +
              '<div class="cn-foot-bar">' +
                '<span>\u00a9 ' + new Date().getFullYear() + ' ' + E.EVER_esc(B.nameA + ' & ' + B.nameB) +
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
      var nf = (E.EVER_NAME_FONTS[d.nameFont] || E.EVER_NAME_FONTS[tpl.nameFont] || E.EVER_NAME_FONTS.pfd).cls;
      var el = E.EVER_miniRoot(tpl, d, 'cinema');
      var hero = S.hero || {};
      var stats = (S.stats && S.stats.items) || [];
      var story = (S.story && S.story.items) || [];
      var sched = (S.schedule && S.schedule.items) || [];
      var gal = (S.gallery && S.gallery.items) || [];
      var foot = S.footer || {};

      var statsHtml = stats.slice(0, 4).map(function (st) {
        return '<span><b>' + E.EVER_esc(tk(st.num, B)) + '</b><i>' + E.EVER_esc(st.label) + '</i></span>';
      }).join('');
      var storyHtml = story.slice(0, 3).map(function (m) {
        return '<span class="wsm-ms"><img src="' + E.EVER_esc(E.EVER_photoSrc(m.photo)) + '" alt=""/></span>';
      }).join('');
      var schedHtml = sched.slice(0, opts.short ? 0 : 2).map(function (it) {
        return '<span class="wsm-cn-sc"><i>' + E.EVER_esc(it.time) + '</i><b>' + E.EVER_esc(it.title) + '</b></span>';
      }).join('');
      var galHtml = gal.slice(0, 3).map(function (p) {
        return '<img src="' + E.EVER_esc(E.EVER_photoSrc(p.src)) + '" alt=""/>';
      }).join('');

      el.innerHTML = '' +
        '<div class="wsm-hero">' +
          '<img class="wsm-hero-img" src="' + E.EVER_esc(E.EVER_photoSrc(hero.photo)) + '" alt=""/>' +
          '<span class="wsm-orn wsm-orn-a" aria-hidden="true"></span><span class="wsm-orn wsm-orn-b" aria-hidden="true"></span>' +
          '<span class="wsm-cn-years">' + E.EVER_esc(B.years) + '</span>' +
          '<span class="wsm-kick">' + E.EVER_esc(tk(hero.kicker, B)) + '</span>' +
          '<strong class="wsm-names ' + nf + '">' + E.EVER_esc(B.nameA) + ' <i>\u0026</i> ' + E.EVER_esc(B.nameB) + '</strong>' +
          '<span class="wsm-date">' + E.EVER_esc(E.EVER_fmtHeroDate(B.date)) + '</span>' +
          '<span class="wsm-btn">' + E.EVER_esc((S.rsvp && S.rsvp.title) || 'Join the celebration') + '</span>' +
        '</div>' +
        '<div class="wsm-cn-stats">' + statsHtml + '</div>' +
        (opts.short ? '' :
        '<div class="wsm-story"><span class="wsm-st">' + E.EVER_esc((S.story && S.story.title) || '') + '</span>' +
          '<div class="wsm-ms-row">' + storyHtml + '</div></div>' +
        '<div class="wsm-cn-sched"><span class="wsm-st">' + E.EVER_esc((S.schedule && S.schedule.title) || '') + '</span>' +
          schedHtml + '</div>' +
        '<div class="wsm-gallery">' + galHtml + '</div>' +
        '<div class="wsm-cn-rsvp"><b>' + E.EVER_esc((S.rsvp && S.rsvp.title) || 'RSVP') + '</b>' +
          '<span class="wsm-btn wsm-btn-dark">' + E.EVER_esc((S.rsvp && S.rsvp.submit) || 'Send RSVP') + '</span></div>') +
        '<div class="wsm-foot"><span>' + E.EVER_esc(foot.thanks || '') + '</span>' +
          '<span class="wsm-crest">' + E.EVER_esc(E.EVER_monogram(B.nameA, B.nameB)) + '</span></div>';
      return el;
    }
  });
})();
