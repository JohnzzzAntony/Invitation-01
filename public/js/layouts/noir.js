/* ==========================================================================
   Ever RSVP — layout: noir (Gala & Formal Evening)
   Marquee hero with double hairline frame → numbered evening programme →
   fine-dining menu preview → dress-code band with style hints → 4-tile
   gold-framed gallery → dark luxury RSVP → formal crest footer.
   Architectural & geometric by design (distinct from the cinema layout).
   Styles: css/ly-noir.css (scoped under .ws-noir / .wsm.ws-noir).
   ========================================================================== */
(function () {
  'use strict';
  var E = window;

  function navLinks() {
    return [['programme', 'Programme'], ['menu', 'Menu'], ['dresscode', 'Dress code'],
            ['gallery', 'Gallery'], ['rsvp', 'RSVP']];
  }

  E.EVER_registerLayout({
    id: 'noir',
    label: 'Gala & Formal Evening',
    events: ['gala'],

    basics: [
      { k: 'host',      label: 'Host / committee', type: 'text', ph: 'The Ashford Society' },
      { k: 'eventLine', label: 'Invitation line', type: 'text', ph: 'request the pleasure of your company' },
      { k: 'title',     label: 'Event title', type: 'text', ph: 'The Winter Gala' },
      { k: 'date',      label: 'Date', type: 'date' },
      { k: 'time',      label: 'Time', type: 'text', ph: '07:00 PM' },
      { k: 'venue',     label: 'Venue', type: 'text', ph: 'The Grand Aurelia Ballroom' },
      { k: 'city',      label: 'City / region', type: 'text', ph: 'London' },
      { k: 'dress',     label: 'Dress code', type: 'text', ph: 'Black tie' }
    ],

    sections: [
      { id: 'hero', label: 'Marquee hero',
        fields: [
          { k: 'kicker', label: 'Kicker line', type: 'text', ph: 'You are cordially invited to' },
          { k: 'photo',  label: 'Hero photo', type: 'photo' }
        ] },
      { id: 'programme', label: 'Programme',
        fields: [
          { k: 'kicker', label: 'Kicker', type: 'text', ph: 'Order of the evening' },
          { k: 'title',  label: 'Section title', type: 'text', ph: 'Programme' }
        ],
        list: { k: 'items', label: 'Item', blank: function () {
            return { time: '', title: 'New item', desc: '' }; },
          fields: [
            { k: 'time',  label: 'Time', type: 'text', ph: '07:00 PM' },
            { k: 'title', label: 'Title', type: 'text', ph: 'Cocktail reception' },
            { k: 'desc',  label: 'Description', type: 'text', ph: 'Champagne in the foyer' }
          ] } },
      { id: 'menu', label: 'Evening menu',
        fields: [
          { k: 'kicker', label: 'Kicker', type: 'text', ph: 'Le menu' },
          { k: 'title',  label: 'Section title', type: 'text', ph: 'Evening menu' },
          { k: 'note',   label: 'Note under title', type: 'text', ph: 'A four course dinner, served with paired wines' }
        ],
        list: { k: 'items', label: 'Course', blank: function () {
            return { course: 'New course', items: '' }; },
          fields: [
            { k: 'course', label: 'Course label', type: 'text', ph: 'First course' },
            { k: 'items',  label: 'Dishes', type: 'textarea' }
          ] } },
      { id: 'dresscode', label: 'Dress code',
        fields: [
          { k: 'kicker', label: 'Kicker', type: 'text', ph: 'Attire' },
          { k: 'title',  label: 'Section title', type: 'text', ph: 'Dress code' },
          { k: 'note',   label: 'Note', type: 'text', ph: 'In keeping with the grandeur of the evening' }
        ],
        list: { k: 'items', label: 'Style hint', blank: function () {
            return { icon: 'spark', label: 'New hint' }; },
          fields: [
            { k: 'icon',  label: 'Icon', type: 'icon' },
            { k: 'label', label: 'Label', type: 'text', ph: 'Floor-length gowns' }
          ] } },
      { id: 'gallery', label: 'Gallery',
        fields: [
          { k: 'kicker', label: 'Kicker', type: 'text', ph: 'The ballroom' },
          { k: 'title',  label: 'Section title', type: 'text', ph: 'Gallery' }
        ],
        list: { k: 'items', label: 'Photo', blank: function () { return { src: 'gala' }; },
          fields: [ { k: 'src', label: 'Photo', type: 'photo' } ] } },
      { id: 'rsvp', label: 'RSVP form',
        fields: [
          { k: 'title',     label: 'Heading', type: 'text', ph: 'Kindly respond' },
          { k: 'note',      label: 'Note before date', type: 'text', ph: 'Please reply by' },
          { k: 'deadline',  label: 'Reply deadline', type: 'date' },
          { k: 'showPhone', label: 'Ask for phone number', type: 'check' },
          { k: 'guestsMax', label: 'Max guests per reply', type: 'number', min: 1, max: 12 },
          { k: 'showMsg',   label: 'Include message box', type: 'check' },
          { k: 'submit',    label: 'Submit button text', type: 'text', ph: 'Respond' },
          { k: 'success',   label: 'Success message', type: 'text', ph: 'Thank you!' }
        ],
        list: { k: 'meals', label: 'Meal option', blank: function () { return ''; },
          fields: [ { k: '', label: 'Option', type: 'text', ph: 'Vegetarian' } ] } },
      { id: 'footer', label: 'Footer',
        fields: [
          { k: 'phone',     label: 'Phone', type: 'text', ph: '+44 20 7946 0958' },
          { k: 'email',     label: 'E-mail', type: 'text', ph: 'rsvp@committee.example' },
          { k: 'thanks',    label: 'Thank-you line', type: 'text', ph: 'We look forward to your company.' },
          { k: 'copyright', label: 'Copyright extra (optional)', type: 'text', ph: '' },
          { k: 'credit',    label: 'Credit line', type: 'text', ph: 'By invitation of the committee' }
        ] }
    ],

    defaults: function () {
      return {
        basics: {
          host: 'The Ashford Society',
          eventLine: 'request the pleasure of your company',
          title: 'The Winter Gala',
          date: E.EVER_futureISO(3, 6), time: '07:00 PM',
          venue: 'The Grand Aurelia Ballroom', city: 'London',
          dress: 'Black tie'
        },
        sections: {
          hero: {
            on: true,
            kicker: 'You are cordially invited to',
            photo: 'gala'
          },
          programme: {
            on: true, kicker: 'Order of the evening', title: 'Programme',
            items: [
              { time: '07:00 PM',  title: 'Cocktail reception', desc: 'Champagne & canap\u00e9s in the Aurelia foyer' },
              { time: '07:45 PM',  title: 'Grand processional', desc: 'The committee opens the ballroom floor' },
              { time: '08:15 PM',  title: 'Dinner service',     desc: 'Four courses, wine pairings, and short addresses' },
              { time: '10:00 PM',  title: 'The ball',           desc: 'Dancing to the Aurelia orchestra until midnight' },
              { time: '12:00 AM',  title: 'Last waltz',         desc: 'A nightcap to close the evening' }
            ]
          },
          menu: {
            on: true, kicker: 'Le menu', title: 'Evening menu',
            note: 'A four course dinner, served with paired wines',
            items: [
              { course: 'First course',  items: 'Chilled golden beet velout\u00e9, cr\u00e8me fra\u00eeche, dill oil' },
              { course: 'Second course', items: 'Seared scallops, brown butter, cauliflower, caper raisin' },
              { course: 'Main course',   items: 'Herb-crusted filet of beef, pommes pur\u00e9e, cabernet jus \u2014 or wild mushroom wellington' },
              { course: 'Dessert',       items: 'Dark chocolate marquise, candied hazelnut, gold leaf' }
            ]
          },
          dresscode: {
            on: true, kicker: 'Attire', title: 'Dress code',
            note: 'In keeping with the grandeur of the evening',
            items: [
              { icon: 'dress', label: 'Floor-length gowns' },
              { icon: 'rings', label: 'Dark suits & bow ties' },
              { icon: 'spark', label: 'Your finest jewels' }
            ]
          },
          gallery: {
            on: true, kicker: 'The ballroom', title: 'Gallery',
            items: [
              { src: 'gala' }, { src: 'glam' }, { src: 'decor' }, { src: 'band' }
            ]
          },
          rsvp: {
            on: true,
            title: 'Kindly respond',
            note: 'Please reply by',
            deadline: E.EVER_futureISO(2, 6),
            showPhone: true,
            guestsMax: 4,
            meals: ['Standard', 'Vegetarian', 'Vegan'],
            showMsg: true,
            submit: 'Respond',
            success: 'Your card has been received. We look forward to receiving you.'
          },
          footer: {
            on: true,
            phone: '+44 20 7946 0958',
            email: 'rsvp@ashfordsociety.example',
            thanks: 'We look forward to your company.',
            copyright: '',
            credit: 'By invitation of the committee'
          }
        }
      };
    },

    render: function (d, tpl, opts) {
      var B = d.basics, S = d.sections;
      var nf = (E.EVER_NAME_FONTS[d.nameFont] || E.EVER_NAME_FONTS[tpl.nameFont] || E.EVER_NAME_FONTS.cinzel).cls;
      var el = E.EVER_siteRoot(d, tpl, opts);

      var nav = navLinks().map(function (l) {
        return '<a href="#ws-sec-' + l[0] + '" data-goto="' + l[0] + '">' + E.EVER_esc(l[1]) + '</a>';
      }).join('');

      var html = '';
      (d.order && d.order.length ? d.order : E.EVER_layoutOrder(E.EVER_findLayout('noir'))).forEach(function (id) {
        var sec = S[id];
        if (!sec || !sec.on) return;

        if (id === 'hero') {
          html += '' +
            '<header class="nr-hero" id="ws-sec-hero">' +
              '<img class="nr-hero-img" src="' + E.EVER_esc(E.EVER_photoSrc(sec.photo)) + '" alt="" aria-hidden="true"/>' +
              '<div class="nr-hero-shade" aria-hidden="true"></div>' +
              '<span class="nr-frame" aria-hidden="true"></span>' +
              '<nav class="nr-nav" aria-label="Event sections">' + nav + '</nav>' +
              '<div class="nr-hero-inner">' +
                '<span class="nr-crest" aria-hidden="true">' + E.EVER_esc(E.EVER_initials(B.host)) + '</span>' +
                '<p class="nr-kick">' + E.EVER_esc(sec.kicker) + '</p>' +
                '<h1 class="nr-title ' + nf + '">' + E.EVER_esc(B.title) + '</h1>' +
                '<p class="nr-host">' + E.EVER_esc(B.host) + '</p>' +
                '<ul class="nr-when">' +
                  '<li>' + E.EVER_icon('calendar') + E.EVER_esc(E.EVER_fmtHeroDate(B.date)) + '</li>' +
                  '<li>' + E.EVER_icon('clock') + E.EVER_esc(B.time) + '</li>' +
                  '<li>' + E.EVER_icon('pin') + E.EVER_esc(B.venue) + ' \u00b7 ' + E.EVER_esc(B.city) + '</li>' +
                '</ul>' +
                '<a class="ws-btn ws-btn-line nr-cta" href="#ws-sec-rsvp" data-goto="rsvp">' +
                  E.EVER_esc(B.eventLine) + '</a>' +
              '</div>' +
            '</header>';
        } else if (id === 'programme') {
          html += '' +
            '<section class="ws-sec nr-prog" id="ws-sec-programme">' +
              '<p class="nr-kick-l">' + E.EVER_esc(sec.kicker) + '</p>' +
              '<h2 class="nr-title2 ' + nf + '">' + E.EVER_esc(sec.title) + '</h2>' +
              '<ol class="nr-prog-list">' +
                (sec.items || []).map(function (it, i) {
                  return '<li class="nr-prog-row">' +
                    '<span class="nr-prog-num ' + nf + '">' + E.EVER_esc(i < 9 ? '0' + (i + 1) : String(i + 1)) + '</span>' +
                    '<span class="nr-prog-body"><b>' + E.EVER_esc(it.title) + '</b>' +
                      (it.desc ? '<span class="nr-prog-desc">' + E.EVER_esc(it.desc) + '</span>' : '') + '</span>' +
                    '<span class="nr-prog-time">' + E.EVER_esc(it.time) + '</span>' +
                  '</li>';
                }).join('') +
              '</ol>' +
            '</section>';
        } else if (id === 'menu') {
          html += '' +
            '<section class="ws-sec nr-menu" id="ws-sec-menu">' +
              '<p class="nr-kick-l">' + E.EVER_esc(sec.kicker) + '</p>' +
              '<h2 class="nr-title2 ' + nf + '">' + E.EVER_esc(sec.title) + '</h2>' +
              (sec.note ? '<p class="nr-menu-note">' + E.EVER_esc(sec.note) + '</p>' : '') +
              '<div class="nr-menu-list">' +
                (sec.items || []).map(function (c) {
                  return '<div class="nr-course">' +
                    '<span class="nr-course-k">' + E.EVER_esc(c.course) + '</span>' +
                    (c.items ? '<p class="nr-course-items">' + E.EVER_esc(c.items).replace(/\n/g, '<br/>') + '</p>' : '') +
                  '</div>';
                }).join('') +
              '</div>' +
            '</section>';
        } else if (id === 'dresscode') {
          html += '' +
            '<section class="ws-sec nr-dress" id="ws-sec-dresscode">' +
              '<div class="nr-dress-band">' +
                '<p class="nr-kick-l dark-band">' + E.EVER_esc(sec.kicker) + '</p>' +
                '<h2 class="nr-dress-big ' + nf + '">' + E.EVER_esc(B.dress) + '</h2>' +
                (sec.note ? '<p class="nr-dress-note">' + E.EVER_esc(sec.note) + '</p>' : '') +
                '<div class="nr-dress-hints">' +
                  (sec.items || []).map(function (h) {
                    return '<span class="nr-hint">' + E.EVER_icon(h.icon) + E.EVER_esc(h.label) + '</span>';
                  }).join('') +
                '</div>' +
              '</div>' +
            '</section>';
        } else if (id === 'gallery') {
          html += '' +
            '<section class="ws-sec nr-gal" id="ws-sec-gallery">' +
              '<p class="nr-kick-l">' + E.EVER_esc(sec.kicker) + '</p>' +
              '<h2 class="nr-title2 ' + nf + '">' + E.EVER_esc(sec.title) + '</h2>' +
              '<div class="nr-gal-grid">' +
                (sec.items || []).map(function (p) {
                  return '<span class="nr-gal-tile"><img src="' + E.EVER_esc(E.EVER_photoSrc(p.src)) +
                    '" alt="Event photo" loading="lazy"/></span>';
                }).join('') +
              '</div>' +
            '</section>';
        } else if (id === 'rsvp') {
          html += '' +
            '<section class="ws-sec nr-rsvp" id="ws-sec-rsvp">' +
              '<div class="nr-rsvp-panel">' +
                '<p class="nr-kick-l on-dark">' + E.EVER_esc('RSVP') + '</p>' +
                '<h2 class="nr-title2 on-dark ' + nf + '">' + E.EVER_esc(sec.title) + '</h2>' +
                '<p class="nr-rsvp-note">' + E.EVER_esc(sec.note) +
                  ' <b>' + E.EVER_esc(E.EVER_fmtLongDate(sec.deadline)) + '</b></p>' +
                E.EVER_rsvpFormHtml(sec) +
              '</div>' +
            '</section>';
        } else if (id === 'footer') {
          html += '' +
            '<footer class="ws-footer nr-foot" id="ws-sec-footer">' +
              '<span class="ws-crest" aria-hidden="true"><i></i>' +
                E.EVER_esc(E.EVER_initials(B.host)) + '<i></i></span>' +
              '<p class="nr-foot-host ' + nf + '">' + E.EVER_esc(B.host) + '</p>' +
              '<p class="nr-foot-thanks">' + E.EVER_esc(sec.thanks) + '</p>' +
              '<div class="nr-foot-lines">' +
                (sec.phone ? '<a class="nr-foot-line" href="tel:' +
                  E.EVER_esc(String(sec.phone).replace(/\s/g, '')) + '">' + E.EVER_icon('phone') +
                  E.EVER_esc(sec.phone) + '</a>' : '') +
                (sec.email ? '<a class="nr-foot-line" href="mailto:' + E.EVER_esc(sec.email) + '">' +
                  E.EVER_icon('mail') + E.EVER_esc(sec.email) + '</a>' : '') +
              '</div>' +
              '<div class="nr-foot-bar">' +
                '<span>\u00a9 ' + new Date().getFullYear() + ' ' + E.EVER_esc(B.host) +
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
      var nf = (E.EVER_NAME_FONTS[d.nameFont] || E.EVER_NAME_FONTS[tpl.nameFont] || E.EVER_NAME_FONTS.cinzel).cls;
      var el = E.EVER_miniRoot(tpl, d, 'noir');
      var hero = S.hero || {};
      var prog = (S.programme && S.programme.items) || [];
      var menu = (S.menu && S.menu.items) || [];
      var gal = (S.gallery && S.gallery.items) || [];
      var foot = S.footer || {};

      var progHtml = prog.slice(0, opts.short ? 2 : 3).map(function (it, i) {
        return '<span class="wsm-nr-row"><b>' + E.EVER_esc(i < 9 ? '0' + (i + 1) : String(i + 1)) + '</b>' +
          '<i>' + E.EVER_esc(it.title) + '</i><em>' + E.EVER_esc(it.time) + '</em></span>';
      }).join('');
      var menuHtml = menu.slice(0, opts.short ? 0 : 2).map(function (c) {
        return '<span class="wsm-nr-course"><i>' + E.EVER_esc(c.course) + '</i>' +
          '<em>' + E.EVER_esc(String(c.items || '').slice(0, 60)) + '</em></span>';
      }).join('');
      var galHtml = gal.slice(0, 4).map(function (p) {
        return '<img src="' + E.EVER_esc(E.EVER_photoSrc(p.src)) + '" alt=""/>';
      }).join('');

      el.innerHTML = '' +
        '<div class="wsm-hero wsm-nr-hero">' +
          '<img class="wsm-hero-img" src="' + E.EVER_esc(E.EVER_photoSrc(hero.photo)) + '" alt=""/>' +
          '<span class="wsm-nr-frame" aria-hidden="true"></span>' +
          '<span class="wsm-kick">' + E.EVER_esc(hero.kicker || '') + '</span>' +
          '<strong class="wsm-names ' + nf + '">' + E.EVER_esc(B.title) + '</strong>' +
          '<span class="wsm-nr-host">' + E.EVER_esc(B.host) + '</span>' +
          '<span class="wsm-date">' + E.EVER_esc(E.EVER_fmtHeroDate(B.date)) + '</span>' +
          '<span class="wsm-btn">' + E.EVER_esc(B.eventLine) + '</span>' +
        '</div>' +
        '<div class="wsm-nr-prog"><span class="wsm-st">' +
          E.EVER_esc((S.programme && S.programme.title) || 'Programme') + '</span>' + progHtml + '</div>' +
        (opts.short ? '' :
        '<div class="wsm-nr-menu"><span class="wsm-st">' +
          E.EVER_esc((S.menu && S.menu.title) || 'Evening menu') + '</span>' + menuHtml + '</div>' +
        '<div class="wsm-gallery">' + galHtml + '</div>' +
        '<div class="wsm-nr-rsvp"><b>' + E.EVER_esc((S.rsvp && S.rsvp.title) || 'Kindly respond') + '</b>' +
          '<span class="wsm-btn wsm-btn-dark">' + E.EVER_esc((S.rsvp && S.rsvp.submit) || 'Respond') + '</span></div>') +
        '<div class="wsm-foot"><span>' + E.EVER_esc(foot.thanks || '') + '</span>' +
          '<span class="wsm-crest">' + E.EVER_esc(E.EVER_initials(B.host)) + '</span></div>';
      return el;
    }
  });
})();
