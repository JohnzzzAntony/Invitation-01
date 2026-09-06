/* ==========================================================================
   Ever RSVP — layout: nest (Housewarming)
   Warm, welcoming, map-forward. Structure: "front door" photo hero with key
   motif + address chip → family welcome note with monogram → open-house
   slots with countdown → numbered room-by-room tour path → practical
   good-to-know grid → BIG split visit panel (map + directions + amenities,
   the hero feature of this layout) → RSVP → warm chip footer.
   Styles: css/ly-nest.css (scoped under .ws-nest / .wsm.ws-nest).
   ========================================================================== */
(function () {
  'use strict';
  var E = window;

  function navLinks() {
    return [['welcome', 'Welcome'], ['openhouse', 'Open house'], ['tour', 'Tour'],
            ['notes', 'Good to know'], ['visit', 'Visit'], ['rsvp', 'RSVP']];
  }

  E.EVER_registerLayout({
    id: 'nest',
    label: 'Housewarming',
    events: ['housewarming'],

    basics: [
      { k: 'family',  label: 'Family name', type: 'text', ph: 'The Bennetts' },
      { k: 'line',    label: 'Headline', type: 'text', ph: "We've moved in!" },
      { k: 'date',    label: 'Open-house date', type: 'date' },
      { k: 'time',    label: 'Open-house time', type: 'text', ph: 'Drop in 2:00 PM - 6:00 PM' },
      { k: 'address', label: 'Address', type: 'text', ph: '42 Larkspur Lane' },
      { k: 'city',    label: 'City', type: 'text', ph: 'Maplewood' }
    ],

    sections: [
      { id: 'hero', label: 'Hero',
        fields: [
          { k: 'kicker',  label: 'Kicker line', type: 'text', ph: 'Housewarming open house' },
          { k: 'photo',   label: 'Hero photo', type: 'photo' },
          { k: 'btnText', label: 'Button text', type: 'text', ph: 'Plan your visit' }
        ] },
      { id: 'welcome', label: 'Welcome note',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Welcome to our new place' },
          { k: 'text',  label: 'Welcome note', type: 'textarea', ph: 'After months of boxes and paint swatches…' }
        ] },
      { id: 'openhouse', label: 'Open house',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Open house' },
          { k: 'note',  label: 'Note under title', type: 'text', ph: 'Doors are open — stop by anytime' }
        ],
        list: { k: 'items', label: 'Open-house slot', blank: function () {
            return { datelabel: 'Saturday', time: '2:00 PM - 6:00 PM', note: '' }; },
          fields: [
            { k: 'datelabel', label: 'Date label', type: 'text', ph: 'Saturday, June 14' },
            { k: 'time',      label: 'Time', type: 'text', ph: '2:00 PM - 6:00 PM' },
            { k: 'note',      label: 'Note', type: 'text', ph: 'Lemonade on the porch' }
          ] } },
      { id: 'tour', label: 'Room tour',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Room by room' },
          { k: 'note',  label: 'Note under title', type: 'text', ph: 'Wander at your own pace' }
        ],
        list: { k: 'items', label: 'Room', blank: function () {
            return { icon: 'home', room: 'New room', note: '' }; },
          fields: [
            { k: 'icon', label: 'Icon', type: 'icon' },
            { k: 'room', label: 'Room / stop', type: 'text', ph: 'The kitchen' },
            { k: 'note', label: 'Note', type: 'text', ph: 'Where the snacks live' }
          ] } },
      { id: 'notes', label: 'Good to know',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Good to know' },
          { k: 'note',  label: 'Note under title', type: 'text', ph: '' }
        ],
        list: { k: 'items', label: 'Note', blank: function () {
            return { icon: 'spark', label: 'New note', value: '' }; },
          fields: [
            { k: 'icon',  label: 'Icon', type: 'icon' },
            { k: 'label', label: 'Label', type: 'text', ph: 'WiFi' },
            { k: 'value', label: 'Value', type: 'text', ph: 'Network + password' }
          ] } },
      { id: 'visit', label: 'Visit & map',
        fields: [
          { k: 'title',  label: 'Panel title', type: 'text', ph: 'Find us' },
          { k: 'intro',  label: 'Intro line', type: 'text', ph: 'Front door is blue — you can\u2019t miss it' },
          { k: 'dirUrl', label: 'Directions link (optional)', type: 'text', ph: 'https://maps.google.com/…' },
          { k: 'mapUrl', label: 'Map embed URL (optional)', type: 'text', ph: 'https://www.openstreetmap.org/…' }
        ],
        list: { k: 'items', label: 'Amenity', blank: function () {
            return { icon: 'key', label: 'New amenity' }; },
          fields: [
            { k: 'icon',  label: 'Icon', type: 'icon' },
            { k: 'label', label: 'Label', type: 'text', ph: 'Free driveway parking' }
          ] } },
      { id: 'rsvp', label: 'RSVP form',
        fields: [
          { k: 'title',     label: 'Heading', type: 'text', ph: 'Will you drop by?' },
          { k: 'note',      label: 'Note before date', type: 'text', ph: 'Please reply by' },
          { k: 'deadline',  label: 'Reply deadline', type: 'date' },
          { k: 'showPhone', label: 'Ask for phone number', type: 'check' },
          { k: 'guestsMax', label: 'Max guests per reply', type: 'number', min: 1, max: 12 },
          { k: 'showMsg',   label: 'Include message box', type: 'check' },
          { k: 'submit',    label: 'Submit button text', type: 'text', ph: 'Count us in' },
          { k: 'success',   label: 'Success message', type: 'text', ph: 'See you at the open house!' }
        ],
        list: { k: 'meals', label: 'Food note', blank: function () { return ''; },
          fields: [ { k: '', label: 'Option', type: 'text', ph: 'Vegetarian' } ] } },
      { id: 'footer', label: 'Contact & footer',
        fields: [
          { k: 'phone',     label: 'Phone', type: 'text', ph: '+1 555 236 7788' },
          { k: 'email',     label: 'E-mail', type: 'text', ph: 'hello@example.com' },
          { k: 'whatsapp',  label: 'WhatsApp link text', type: 'text', ph: 'Message us' },
          { k: 'thanks',    label: 'Thank-you line', type: 'text', ph: 'Thank you for helping us make this house a home.' },
          { k: 'copyright', label: 'Copyright extra (optional)', type: 'text', ph: '' },
          { k: 'credit',    label: 'Credit line', type: 'text', ph: 'Made with \u2665 and fresh paint' }
        ] }
    ],

    defaults: function () {
      return {
        basics: {
          family: 'The Bennetts',
          line: "We've moved in \u2014 come see our new place!",
          date: E.EVER_futureISO(1, 12),
          time: 'Drop in 2:00 PM - 6:00 PM',
          address: '42 Larkspur Lane',
          city: 'Maplewood'
        },
        sections: {
          hero: {
            on: true,
            kicker: 'Housewarming open house',
            photo: 'home',
            btnText: 'Plan your visit'
          },
          welcome: {
            on: true,
            title: 'Welcome to our new place',
            text: 'After months of boxes, paint swatches and one very stubborn kitchen drawer, we are finally home. Come wander the rooms, sit on the porch and help us christen the garden. No gifts \u2014 just bring yourselves.'
          },
          openhouse: {
            on: true,
            title: 'Open house',
            note: 'Doors are open \u2014 stop by whenever suits you',
            items: [
              { datelabel: 'Saturday', time: '2:00 PM - 6:00 PM', note: 'First look, lemonade on the porch' },
              { datelabel: 'Sunday', time: '10:00 AM - 1:00 PM', note: 'Brunch bites and garden games' }
            ]
          },
          tour: {
            on: true,
            title: 'Room by room',
            note: 'Wander at your own pace \u2014 the kettle is always on',
            items: [
              { icon: 'home',  room: 'The porch',     note: 'Where morning coffee happens from now on' },
              { icon: 'heart', room: 'The kitchen',   note: 'Snack HQ \u2014 help yourself to the good shelf' },
              { icon: 'chair', room: 'Living room',   note: 'Sofa tested, afternoon-nap approved' },
              { icon: 'leaf',  room: 'The garden',    note: 'Tomatoes, a hammock and big plans' },
              { icon: 'star',  room: "Kids' den",     note: 'Crayons, cushions and a treasure chest' }
            ]
          },
          notes: {
            on: true,
            title: 'Good to know',
            note: '',
            items: [
              { icon: 'spark', label: 'WiFi',     value: 'LarkspurLane \u00b7 welcome42' },
              { icon: 'car',   label: 'Parking',  value: 'Driveway + free street parking' },
              { icon: 'baby',  label: 'Kids',     value: 'Very welcome \u2014 toys in the den' },
              { icon: 'leaf',  label: 'Pets',     value: 'Biscuit the beagle says hello' }
            ]
          },
          visit: {
            on: true,
            title: 'Find us',
            intro: 'Front door is blue \u2014 you can\u2019t miss it.',
            dirUrl: '',
            mapUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=-79.4200%2C43.6650%2C-79.3100%2C43.7250&layer=mapnik&marker=43.6950%2C-79.3650',
            items: [
              { icon: 'car',   label: 'Free driveway parking' },
              { icon: 'key',   label: 'Side gate open' },
              { icon: 'bell',  label: 'Just ring twice' },
              { icon: 'chair', label: 'Step-free entry' }
            ]
          },
          rsvp: {
            on: true,
            title: 'Will you drop by?',
            note: 'A quick headcount helps us bake enough pie \u2014 please reply by',
            deadline: E.EVER_futureISO(1, 8),
            showPhone: true,
            guestsMax: 6,
            meals: ['Anything, thanks', 'Vegetarian', 'Gluten-free', 'Just coffee for me'],
            showMsg: true,
            submit: 'Count us in',
            success: 'Wonderful! We\u2019ll leave the porch light on for you.'
          },
          footer: {
            on: true,
            phone: '+1 555 236 7788',
            email: 'hello@thebennetts.example',
            whatsapp: 'Message the Bennetts',
            thanks: 'Thank you for helping us make this house a home.',
            copyright: '',
            credit: 'Made with \u2665 and fresh paint'
          }
        }
      };
    },

    render: function (d, tpl, opts) {
      var B = d.basics, S = d.sections;
      var nf = (E.EVER_NAME_FONTS[d.nameFont] || E.EVER_NAME_FONTS[tpl.nameFont] || E.EVER_NAME_FONTS.corm).cls;
      var el = E.EVER_siteRoot(d, tpl, opts);

      var nav = navLinks().map(function (l) {
        return '<a href="#ws-sec-' + l[0] + '" data-goto="' + l[0] + '">' + E.EVER_esc(l[1]) + '</a>';
      }).join('');

      var html = '';
      (d.order && d.order.length ? d.order : E.EVER_layoutOrder(E.EVER_findLayout('nest'))).forEach(function (id) {
        var sec = S[id];
        if (!sec || sec.on === false) return;

        if (id === 'hero') {
          html += '' +
            '<header class="nst-hero" id="ws-sec-hero">' +
              '<img class="nst-hero-img" src="' + E.EVER_esc(E.EVER_photoSrc(sec.photo)) + '" alt="Our new home" aria-hidden="true"/>' +
              '<div class="nst-shade" aria-hidden="true"></div>' +
              '<div class="ws-hero-bar">' +
                '<span class="ws-mono">' + E.EVER_esc(E.EVER_initials(B.family)) + '</span>' +
                '<nav class="ws-nav" aria-label="Event sections">' + nav + '</nav>' +
              '</div>' +
              '<div class="nst-hero-inner">' +
                '<span class="nst-key" aria-hidden="true">' + E.EVER_icon('key') + '</span>' +
                '<p class="nst-kick">' + E.EVER_esc(sec.kicker) + '</p>' +
                '<h1 class="nst-family ' + nf + '">' + E.EVER_esc(B.family) + '</h1>' +
                '<p class="nst-line">' + E.EVER_esc(B.line) + '</p>' +
                '<span class="nst-chip">' + E.EVER_icon('home') + '<span>' +
                  E.EVER_esc(B.address) + ' \u00b7 ' + E.EVER_esc(B.city) + '</span></span>' +
                '<p class="nst-when">' + E.EVER_icon('calendar') + ' ' + E.EVER_esc(E.EVER_fmtHeroDate(B.date)) +
                  ' <i class="nst-dot" aria-hidden="true"></i> ' + E.EVER_icon('clock') + ' ' + E.EVER_esc(B.time) + '</p>' +
                '<a class="ws-btn nst-cta" href="#ws-sec-visit" data-goto="visit">' + E.EVER_icon('key') + ' ' +
                  E.EVER_esc(sec.btnText || 'Plan your visit') + '</a>' +
              '</div>' +
              '<span class="ws-scroll" aria-hidden="true">' + E.EVER_icon('chevron') + '</span>' +
            '</header>';
        } else if (id === 'welcome') {
          html += '' +
            '<section class="ws-sec ws-welcome nst-welcome" id="ws-sec-welcome">' +
              '<div class="nst-wel-card">' +
                '<span class="nst-wel-mono" aria-hidden="true">' + E.EVER_esc(E.EVER_initials(B.family)) + '</span>' +
                '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
                '<p class="nst-wel-text">' + E.EVER_esc(sec.text).replace(/\n/g, '<br/>') + '</p>' +
                '<span class="nst-wel-sig">\u2014 ' + E.EVER_esc(B.family) + '</span>' +
              '</div>' +
            '</section>';
        } else if (id === 'openhouse') {
          html += '' +
            '<section class="ws-sec ws-openhouse nst-open" id="ws-sec-openhouse">' +
              '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
              (sec.note ? '<p class="nst-note">' + E.EVER_esc(sec.note) + '</p>' : '') +
              E.EVER_timerHtml(B.date) +
              '<div class="nst-open-grid">' +
                (sec.items || []).map(function (o) {
                  return '<div class="nst-open-card">' +
                    '<span class="nst-open-ic" aria-hidden="true">' + E.EVER_icon('calendar') + '</span>' +
                    '<b class="nst-open-day">' + E.EVER_esc(o.datelabel) + '</b>' +
                    '<strong class="nst-open-time">' + E.EVER_esc(o.time) + '</strong>' +
                    (o.note ? '<p class="nst-open-note">' + E.EVER_esc(o.note) + '</p>' : '') +
                  '</div>';
                }).join('') +
              '</div>' +
            '</section>';
        } else if (id === 'tour') {
          html += '' +
            '<section class="ws-sec ws-tour nst-tour" id="ws-sec-tour">' +
              '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
              (sec.note ? '<p class="nst-note">' + E.EVER_esc(sec.note) + '</p>' : '') +
              '<ol class="nst-path">' +
                (sec.items || []).map(function (rm, i) {
                  return '<li class="nst-stop">' +
                    '<span class="nst-stop-num" aria-hidden="true">' + (i + 1) + '</span>' +
                    '<span class="nst-stop-ic" aria-hidden="true">' + E.EVER_icon(rm.icon) + '</span>' +
                    '<div class="nst-stop-body"><b>' + E.EVER_esc(rm.room) + '</b>' +
                    (rm.note ? '<p>' + E.EVER_esc(rm.note) + '</p>' : '') + '</div>' +
                  '</li>';
                }).join('') +
              '</ol>' +
            '</section>';
        } else if (id === 'notes') {
          html += '' +
            '<section class="ws-sec ws-notes nst-notes" id="ws-sec-notes">' +
              '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
              (sec.note ? '<p class="nst-note">' + E.EVER_esc(sec.note) + '</p>' : '') +
              '<div class="nst-notes-grid">' +
                (sec.items || []).map(function (n) {
                  return '<div class="nst-note-card">' + E.EVER_icon(n.icon) +
                    '<b>' + E.EVER_esc(n.label) + '</b><span>' + E.EVER_esc(n.value) + '</span></div>';
                }).join('') +
              '</div>' +
            '</section>';
        } else if (id === 'visit') {
          html += '' +
            '<section class="ws-sec ws-visit nst-visit" id="ws-sec-visit">' +
              '<div class="nst-visit-grid">' +
                '<div class="nst-visit-map">' + E.EVER_mapIframe(sec.mapUrl, 'Map to our new home') + '</div>' +
                '<div class="nst-visit-panel">' +
                  '<span class="nst-visit-key" aria-hidden="true">' + E.EVER_icon('key') + '</span>' +
                  '<h2 class="ws-title on-dark">' + E.EVER_esc(sec.title) + '</h2>' +
                  (sec.intro ? '<p class="nst-visit-intro">' + E.EVER_esc(sec.intro) + '</p>' : '') +
                  '<address>' + E.EVER_esc(B.address) + '<br/>' + E.EVER_esc(B.city) + '</address>' +
                  '<a class="ws-btn ws-btn-line" target="_blank" rel="noopener noreferrer" href="' +
                    E.EVER_esc(E.EVER_safeUrl(sec.dirUrl) || E.EVER_directionsUrl(B.address, B.city)) +
                    '">Get directions ' + E.EVER_icon('share') + '</a>' +
                  '<div class="nst-am-row">' +
                    (sec.items || []).map(function (a) {
                      return '<span class="nst-am">' + E.EVER_icon(a.icon) + E.EVER_esc(a.label) + '</span>';
                    }).join('') +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</section>';
        } else if (id === 'rsvp') {
          html += '' +
            '<section class="ws-sec ws-rsvp nst-rsvp" id="ws-sec-rsvp">' +
              '<div class="nst-rsvp-card">' +
                '<span class="nst-rsvp-key" aria-hidden="true">' + E.EVER_icon('key') + '</span>' +
                '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
                '<p class="nst-rsvp-note">' + E.EVER_esc(sec.note) + ' <b>' +
                  E.EVER_esc(E.EVER_fmtLongDate(sec.deadline)) + '</b></p>' +
                E.EVER_rsvpFormHtml(sec) +
              '</div>' +
            '</section>';
        } else if (id === 'footer') {
          html += '' +
            '<footer class="ws-footer nst-foot" id="ws-sec-footer">' +
              '<span class="nst-foot-mono">' + E.EVER_esc(E.EVER_initials(B.family)) + '</span>' +
              '<p class="nst-thanks">' + E.EVER_esc(sec.thanks) + '</p>' +
              '<div class="nst-chips">' +
                '<a class="nst-chip" href="tel:' + E.EVER_esc(String(sec.phone).replace(/\s/g, '')) + '">' +
                  E.EVER_icon('phone') + '<span>' + E.EVER_esc(sec.phone) + '</span></a>' +
                '<a class="nst-chip" href="mailto:' + E.EVER_esc(sec.email) + '">' +
                  E.EVER_icon('mail') + '<span>' + E.EVER_esc(sec.email) + '</span></a>' +
                '<a class="nst-chip" href="https://wa.me/' + E.EVER_esc(String(sec.phone).replace(/\D/g, '')) +
                  '" target="_blank" rel="noopener noreferrer">' + E.EVER_icon('whatsapp') +
                  '<span>' + E.EVER_esc(sec.whatsapp) + '</span></a>' +
              '</div>' +
              '<div class="nst-foot-bar">' +
                '<span>\u00a9 ' + new Date().getFullYear() + ' ' + E.EVER_esc(B.family) +
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
      var nf = (E.EVER_NAME_FONTS[d.nameFont] || E.EVER_NAME_FONTS[tpl.nameFont] || E.EVER_NAME_FONTS.corm).cls;
      var el = E.EVER_miniRoot(tpl, d, 'nest');

      var open = S.openhouse && S.openhouse.items ? S.openhouse.items : [];
      var tour = S.tour && S.tour.items ? S.tour.items : [];
      var openRows = open.slice(0, opts.short ? 1 : 2).map(function (o) {
        return '<span class="nst-m-row"><i>' + E.EVER_esc(o.datelabel) + '</i><b>' + E.EVER_esc(o.time) + '</b></span>';
      }).join('');
      var tourRows = tour.slice(0, opts.short ? 0 : 3).map(function (t) {
        return '<span class="nst-m-row">' + E.EVER_icon(t.icon) + '<b>' + E.EVER_esc(t.room) + '</b></span>';
      }).join('');

      el.innerHTML = '' +
        '<div class="wsm-hero">' +
          '<img class="wsm-hero-img" src="' + E.EVER_esc(E.EVER_photoSrc(S.hero && S.hero.photo)) + '" alt=""/>' +
          '<span class="wsm-mono">' + E.EVER_esc(E.EVER_initials(B.family)) + '</span>' +
          '<span class="wsm-kick">' + E.EVER_esc(S.hero && S.hero.kicker || '') + '</span>' +
          '<strong class="wsm-names ' + nf + '">' + E.EVER_esc(B.family) + '</strong>' +
          '<span class="wsm-date">' + E.EVER_esc(E.EVER_fmtHeroDate(B.date)) + ' \u00b7 ' + E.EVER_esc(B.city) + '</span>' +
          '<span class="wsm-btn">' + E.EVER_esc(S.hero && S.hero.btnText || 'Plan your visit') + '</span>' +
        '</div>' +
        '<div class="nst-m-block">' +
          '<span class="wsm-st">' + E.EVER_esc(S.openhouse && S.openhouse.title || 'Open house') + '</span>' + openRows +
        '</div>' +
        (opts.short ? '' :
        '<div class="nst-m-block nst-m-alt">' +
          '<span class="wsm-st">' + E.EVER_esc(S.tour && S.tour.title || 'Tour') + '</span>' + tourRows +
        '</div>' +
        '<div class="nst-m-visit">' +
          '<b>' + E.EVER_esc(B.address) + '</b>' +
          '<span>' + E.EVER_esc(B.city) + '</span>' +
        '</div>') +
        '<div class="wsm-foot">' +
          '<span>' + E.EVER_esc(S.footer && S.footer.thanks || '') + '</span>' +
          '<span class="wsm-crest">' + E.EVER_esc(E.EVER_initials(B.family)) + '</span>' +
        '</div>';
      return el;
    }
  });
})();
