/* ==========================================================================
   Ever RSVP — layout: royal (Classic Wedding)
   Reference implementation for the layout contract (docs/LAYOUT-SPEC.md).
   Structure: monogram hero → countdown & details → our story → gallery →
   events → venue & map → RSVP → contact footer.
   Styles: base .ws-* rules in styles.css (this layout needs no extra CSS file).
   ========================================================================== */
(function () {
  'use strict';
  var E = window;

  function navLinks() {
    return [['story', 'Our story'], ['events', 'Events'], ['gallery', 'Gallery'],
            ['venue', 'Venue'], ['rsvp', 'RSVP'], ['contact', 'Contact']];
  }

  E.EVER_registerLayout({
    id: 'royal',
    label: 'Classic Wedding',
    events: ['wedding'],

    basics: [
      { k: 'nameA', label: 'First partner', type: 'text', ph: 'Amelia' },
      { k: 'nameB', label: 'Second partner', type: 'text', ph: 'Noah' },
      { k: 'date',  label: 'Date', type: 'date' },
      { k: 'time',  label: 'Time', type: 'text', ph: '05:00 PM onwards' },
      { k: 'venue', label: 'Venue', type: 'text', ph: 'Rosewood Barn' },
      { k: 'city',  label: 'City / region', type: 'text', ph: 'Kent' },
      { k: 'dress', label: 'Dress code', type: 'text', ph: 'Semi formal · Pastel shades' },
      { k: 'quote', label: 'Favourite quote', type: 'text', ph: 'Two hearts, one love…' }
    ],

    sections: [
      { id: 'hero', label: 'Hero',
        fields: [
          { k: 'kicker1', label: 'Kicker line 1', type: 'text', ph: "You're invited to" },
          { k: 'kicker2', label: 'Kicker line 2', type: 'text', ph: 'the wedding of' },
          { k: 'photo',   label: 'Hero photo', type: 'photo' },
          { k: 'btnText', label: 'Button text', type: 'text', ph: 'Enter invitation' }
        ] },
      { id: 'countdown', label: 'Countdown & details',
        fields: [
          { k: 'label', label: 'Countdown label', type: 'text', ph: 'Countdown to our big day' },
          { k: 'quote', label: 'Quote under the timer', type: 'text', ph: 'Two hearts, one love…' }
        ] },
      { id: 'story', label: 'Our story',
        fields: [ { k: 'title', label: 'Section title', type: 'text', ph: 'Our story' } ],
        list: { k: 'items', label: 'Milestone', blank: function () {
            return { photo: 'couple', title: 'New milestone', date: '', text: '' }; },
          fields: [
            { k: 'photo', label: 'Photo', type: 'photo' },
            { k: 'title', label: 'Title', type: 'text', ph: 'First met' },
            { k: 'date',  label: 'Date line', type: 'text', ph: '14 March 2021' },
            { k: 'text',  label: 'Description', type: 'text', ph: 'A chance meeting…' }
          ] } },
      { id: 'gallery', label: 'Gallery',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Gallery' },
          { k: 'btn',   label: 'Button text (empty = hide)', type: 'text', ph: 'View more photos' }
        ],
        list: { k: 'items', label: 'Photo', blank: function () { return { src: 'decor' }; },
          fields: [ { k: 'src', label: 'Photo', type: 'photo' } ] } },
      { id: 'events', label: 'Events',
        fields: [ { k: 'title', label: 'Section title', type: 'text', ph: 'Events' } ],
        list: { k: 'items', label: 'Event', blank: function () {
            return { icon: 'rings', name: 'New event', time: '', venue: '' }; },
          fields: [
            { k: 'icon',  label: 'Icon', type: 'icon' },
            { k: 'name',  label: 'Event name', type: 'text', ph: 'Wedding ceremony' },
            { k: 'time',  label: 'Time', type: 'text', ph: '05:00 PM - 06:30 PM' },
            { k: 'venue', label: 'Venue / hall', type: 'text', ph: 'The Grand Palms · Main lawn' }
          ] } },
      { id: 'venue', label: 'Venue & map',
        fields: [
          { k: 'name',    label: 'Venue name', type: 'text', ph: 'The Grand Palms' },
          { k: 'address', label: 'Full address', type: 'text', ph: 'No. 123, Palm Avenue…' },
          { k: 'dirUrl',  label: 'Directions link (optional)', type: 'text', ph: 'https://maps.google.com/…' },
          { k: 'mapUrl',  label: 'Map embed URL (optional)', type: 'text', ph: 'https://www.openstreetmap.org/…' }
        ],
        list: { k: 'items', label: 'Amenity', blank: function () { return { icon: 'heart', label: 'New amenity' }; },
          fields: [
            { k: 'icon',  label: 'Icon', type: 'icon' },
            { k: 'label', label: 'Label', type: 'text', ph: 'Ample parking' }
          ] } },
      { id: 'rsvp', label: 'RSVP form',
        fields: [
          { k: 'title',       label: 'Heading', type: 'text', ph: 'Kindly RSVP' },
          { k: 'note',        label: 'Note before date', type: 'text', ph: 'Please confirm your presence by' },
          { k: 'deadline',    label: 'Reply deadline', type: 'date' },
          { k: 'showPhone',   label: 'Ask for phone number', type: 'check' },
          { k: 'guestsMax',   label: 'Max guests per reply', type: 'number', min: 1, max: 12 },
          { k: 'showMsg',     label: 'Include message box', type: 'check' },
          { k: 'submit',      label: 'Submit button text', type: 'text', ph: 'Submit RSVP' },
          { k: 'success',     label: 'Success message', type: 'text', ph: 'Thank you!' }
        ],
        list: { k: 'meals', label: 'Meal option', blank: function () { return ''; },
          fields: [ { k: '', label: 'Option', type: 'text', ph: 'Vegetarian' } ] } },
      { id: 'contact', label: 'Contact & footer',
        fields: [
          { k: 'phone',     label: 'Phone', type: 'text', ph: '+91 98765 43210' },
          { k: 'email',     label: 'E-mail', type: 'text', ph: 'hello@example.com' },
          { k: 'whatsapp',  label: 'WhatsApp link text', type: 'text', ph: 'WhatsApp us' },
          { k: 'thanks',    label: 'Thank-you line', type: 'text', ph: 'Thank you for being a part…' },
          { k: 'copyright', label: 'Copyright extra (optional)', type: 'text', ph: '' },
          { k: 'credit',    label: 'Credit line', type: 'text', ph: 'Made with ♥ for our big day' },
          { k: 'social.wa',    label: 'WhatsApp icon', type: 'check' },
          { k: 'social.fb',    label: 'Facebook icon', type: 'check' },
          { k: 'social.ig',    label: 'Instagram icon', type: 'check' },
          { k: 'social.share', label: 'Share icon', type: 'check' }
        ] }
    ],

    defaults: function () {
      return {
        basics: {
          nameA: 'Ananya', nameB: 'Rohan',
          date: E.EVER_futureISO(3), time: '05:00 PM onwards',
          venue: 'The Grand Palms',
          address: 'No. 123, Palm Avenue, Hennur Main Road',
          city: 'Bengaluru',
          dress: 'Semi formal \u00b7 Pastel shades',
          quote: 'Two hearts, one love, a lifetime together.'
        },
        sections: {
          hero: {
            on: true,
            kicker1: "You're invited to", kicker2: 'the wedding of',
            photo: 'couple', btnText: 'Enter invitation'
          },
          countdown: {
            on: true,
            label: 'Countdown to our big day',
            quote: 'Two hearts, one love, a lifetime together.'
          },
          story: {
            on: true, title: 'Our story',
            items: [
              { photo: 'cafe',     title: 'First met',      date: '14 March 2021', text: 'A chance meeting that started it all.' },
              { photo: 'proposal', title: 'Fell in love',   date: '20 July 2022',  text: 'We became inseparable and built beautiful memories.' },
              { photo: 'rings',    title: 'She said yes',   date: '14 February 2025', text: 'The best day of our lives, and the beginning of forever.' },
              { photo: 'dance',    title: 'Forever starts', date: E.EVER_fmtLongDate(E.EVER_futureISO(3)), text: "We can't wait to celebrate this special day with you all!" }
            ]
          },
          gallery: {
            on: true, title: 'Gallery', btn: 'View more photos',
            items: [
              { src: 'couple' }, { src: 'cafe' }, { src: 'proposal' },
              { src: 'dance' }, { src: 'rings' }, { src: 'decor' }
            ]
          },
          events: {
            on: true, title: 'Events',
            items: [
              { icon: 'rings',    name: 'Wedding ceremony', time: '05:00 PM - 06:30 PM', venue: 'The Grand Palms \u00b7 Main lawn' },
              { icon: 'cocktail', name: 'Cocktails & mocktails', time: '06:30 PM - 07:30 PM', venue: 'The Grand Palms \u00b7 Garden area' },
              { icon: 'dinner',   name: 'Dinner', time: '07:30 PM - 09:30 PM', venue: 'The Grand Palms \u00b7 Banquet hall' },
              { icon: 'music',    name: 'Reception party', time: '09:30 PM onwards', venue: 'The Grand Palms \u00b7 Banquet hall' }
            ]
          },
          venue: {
            on: true,
            name: 'The Grand Palms',
            address: 'No. 123, Palm Avenue, Hennur Main Road, Bengaluru - 560043, Karnataka, India',
            dirUrl: '',
            mapUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=77.5980%2C13.0180%2C77.6380%2C13.0480&layer=mapnik&marker=13.0330%2C77.6180',
            items: [
              { icon: 'car',   label: 'Ample parking' },
              { icon: 'bell',  label: 'Valet service' },
              { icon: 'chair', label: 'Wheelchair accessible' },
              { icon: 'snow',  label: 'AC venue' }
            ]
          },
          rsvp: {
            on: true,
            title: 'Kindly RSVP',
            note: 'Please confirm your presence by',
            deadline: E.EVER_futureISO(2, 10),
            showPhone: true,
            guestsMax: 6,
            meals: ['Vegetarian', 'Non vegetarian', 'Jain', 'Not sure yet'],
            showMsg: true,
            submit: 'Submit RSVP',
            success: 'Thank you! Your reply has been received \u2014 we can\u2019t wait to celebrate with you.'
          },
          contact: {
            on: true,
            phone: '+91 98765 43210',
            email: 'ananyaandrohan@gmail.com',
            whatsapp: 'WhatsApp us',
            thanks: 'Thank you for being a part of our special day!',
            social: { wa: true, fb: true, ig: true, share: true },
            copyright: '',
            credit: 'Made with \u2665 for our big day'
          }
        }
      };
    },

    render: function (d, tpl, opts) {
      var B = d.basics, S = d.sections;
      var nf = (E.EVER_NAME_FONTS[d.nameFont] || E.EVER_NAME_FONTS[tpl.nameFont] || E.EVER_NAME_FONTS.vibes).cls;
      var el = E.EVER_siteRoot(d, tpl, opts);

      var nav = navLinks().map(function (l) {
        return '<a href="#ws-sec-' + l[0] + '" data-goto="' + l[0] + '">' + E.EVER_esc(l[1]) + '</a>';
      }).join('');

      var html = '';
      (d.order && d.order.length ? d.order : E.EVER_layoutOrder(E.EVER_findLayout('royal'))).forEach(function (id) {
        var sec = S[id];
        if (!sec || !sec.on) return;

        if (id === 'hero') {
          html += '' +
            '<header class="ws-hero" id="ws-sec-hero">' +
              '<img class="ws-hero-img" src="' + E.EVER_esc(E.EVER_photoSrc(sec.photo)) + '" alt="" aria-hidden="true"/>' +
              '<div class="ws-hero-shade" aria-hidden="true"></div>' +
              '<span class="ws-orn ws-orn-a" aria-hidden="true"></span><span class="ws-orn ws-orn-b" aria-hidden="true"></span>' +
              '<div class="ws-hero-bar">' +
                '<span class="ws-mono">' + E.EVER_esc(E.EVER_monogram(B.nameA, B.nameB)) + '</span>' +
                '<nav class="ws-nav" aria-label="Event sections">' + nav + '</nav>' +
              '</div>' +
              '<div class="ws-hero-inner">' +
                '<p class="ws-kick">' + E.EVER_esc(sec.kicker1) + '<br/>' + E.EVER_esc(sec.kicker2) + '</p>' +
                '<h1 class="ws-names ' + nf + '">' +
                  E.EVER_esc(B.nameA) + ' <span class="ws-amp">\u0026</span><br/>' + E.EVER_esc(B.nameB) + '</h1>' +
                '<span class="ws-div" aria-hidden="true"><i></i>' + E.EVER_icon('heart', 'ws-div-heart') + '<i></i></span>' +
                '<p class="ws-hero-date">' + E.EVER_esc(E.EVER_fmtHeroDate(B.date)) + '</p>' +
                '<a class="ws-btn ws-btn-line" href="#ws-sec-countdown" data-goto="countdown">' + E.EVER_esc(sec.btnText || 'Enter invitation') + '</a>' +
              '</div>' +
              '<span class="ws-scroll" aria-hidden="true">' + E.EVER_icon('chevron') + '</span>' +
            '</header>';
        } else if (id === 'countdown') {
          var cards = [
            { ic: 'calendar', label: 'Date',  l1: E.EVER_esc(E.EVER_fmtLongDate(B.date)), l2: E.EVER_esc(E.EVER_fmtWeekday(B.date)) },
            { ic: 'clock',    label: 'Time',  l1: E.EVER_esc(B.time), l2: '' },
            { ic: 'pin',      label: 'Venue', l1: E.EVER_esc(B.venue), l2: E.EVER_esc(B.city) },
            { ic: 'dress',    label: 'Dress code', l1: E.EVER_esc(B.dress), l2: '' }
          ];
          html += '' +
            '<section class="ws-sec ws-count" id="ws-sec-countdown">' +
              '<div class="ws-count-grid">' +
                '<div class="ws-count-left">' +
                  '<h2 class="ws-title sm">' + E.EVER_esc(sec.label) + '</h2>' +
                  E.EVER_timerHtml(B.date) +
                  '<p class="ws-quote">\u201c' + E.EVER_esc(sec.quote) + '\u201d</p>' +
                '</div>' +
                '<div class="ws-details">' +
                  cards.map(function (c) {
                    return '<div class="ws-dcard">' + E.EVER_icon(c.ic) +
                      '<b>' + c.label + '</b><span>' + c.l1 + '</span>' + (c.l2 ? '<span>' + c.l2 + '</span>' : '') + '</div>';
                  }).join('') +
                  '<a class="ws-btn ws-btn-dark ws-map-link" href="' +
                    E.EVER_esc(E.EVER_safeUrl(S.venue.dirUrl) || E.EVER_directionsUrl(S.venue.address, B.city)) +
                    '" target="_blank" rel="noopener noreferrer">' + E.EVER_icon('pin') + ' View on map</a>' +
                '</div>' +
              '</div>' +
            '</section>';
        } else if (id === 'story') {
          html += '' +
            '<section class="ws-sec ws-story" id="ws-sec-story">' +
              '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
              '<div class="ws-story-row">' +
                (sec.items || []).map(function (m, i) {
                  return '<div class="ws-ms">' +
                    '<span class="ws-ms-heart" aria-hidden="true">' + (i > 0 ? E.EVER_icon('heart') : '') + '</span>' +
                    '<span class="ws-ms-photo"><img src="' + E.EVER_esc(E.EVER_photoSrc(m.photo)) + '" alt="' + E.EVER_esc(m.title) + '"/></span>' +
                    '<b>' + E.EVER_esc(m.title) + '</b><i class="ws-ms-date">' + E.EVER_esc(m.date) + '</i>' +
                    '<p>' + E.EVER_esc(m.text) + '</p></div>';
                }).join('') +
              '</div>' +
            '</section>';
        } else if (id === 'gallery') {
          html += '' +
            '<section class="ws-sec ws-gallery" id="ws-sec-gallery">' +
              '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
              '<div class="ws-gallery-row">' +
                (sec.items || []).map(function (p) {
                  return '<span class="ws-gcell"><img src="' + E.EVER_esc(E.EVER_photoSrc(p.src)) + '" alt="Event photo" loading="lazy"/></span>';
                }).join('') +
              '</div>' +
              (sec.btn ? '<a class="ws-btn ws-btn-dark" href="#ws-sec-gallery">' + E.EVER_icon('camera') + ' ' + E.EVER_esc(sec.btn) + '</a>' : '') +
            '</section>';
        } else if (id === 'events') {
          html += '' +
            '<section class="ws-sec ws-events" id="ws-sec-events">' +
              '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
              '<div class="ws-events-grid">' +
                (sec.items || []).map(function (ev) {
                  return '<div class="ws-ecard">' + E.EVER_icon(ev.icon) +
                    '<b>' + E.EVER_esc(ev.name) + '</b><span>' + E.EVER_esc(ev.time) + '</span>' +
                    '<span class="ws-ec-venue">' + E.EVER_esc(ev.venue) + '</span></div>';
                }).join('') +
              '</div>' +
            '</section>';
        } else if (id === 'venue') {
          html += '' +
            '<section class="ws-sec ws-venue-sec" id="ws-sec-venue">' +
              '<div class="ws-venue-grid">' +
                '<div class="ws-venue-panel">' +
                  '<h2 class="ws-title on-dark">' + E.EVER_esc(sec.name) + '</h2>' +
                  '<address>' + E.EVER_esc(sec.address).replace(/\n/g, '<br/>') + '</address>' +
                  '<div class="ws-am-row">' +
                    (sec.items || []).map(function (a) {
                      return '<div class="ws-am">' + E.EVER_icon(a.icon) + '<span>' + E.EVER_esc(a.label) + '</span></div>';
                    }).join('') +
                  '</div>' +
                  '<a class="ws-btn ws-btn-line" target="_blank" rel="noopener noreferrer" href="' +
                    E.EVER_esc(E.EVER_safeUrl(sec.dirUrl) || E.EVER_directionsUrl(sec.address, B.city)) +
                    '">Get directions ' + E.EVER_icon('share') + '</a>' +
                '</div>' +
                E.EVER_mapIframe(sec.mapUrl) +
              '</div>' +
            '</section>';
        } else if (id === 'rsvp') {
          html += '' +
            '<section class="ws-sec ws-rsvp" id="ws-sec-rsvp">' +
              '<div class="ws-rsvp-grid">' +
                '<div class="ws-rsvp-head">' +
                  '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
                  '<span class="ws-div" aria-hidden="true"><i></i>' + E.EVER_icon('heart', 'ws-div-heart') + '<i></i></span>' +
                  '<p>' + E.EVER_esc(sec.note) + '<br/><b>' + E.EVER_esc(E.EVER_fmtLongDate(sec.deadline)) + '</b></p>' +
                '</div>' +
                E.EVER_rsvpFormHtml(sec) +
              '</div>' +
            '</section>';
        } else if (id === 'contact') {
          var soc = '';
          if (sec.social && sec.social.wa) soc += '<a href="https://wa.me/' + E.EVER_esc(String(sec.phone).replace(/\D/g, '')) + '" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">' + E.EVER_icon('whatsapp') + '</a>';
          if (sec.social && sec.social.fb) soc += '<a href="#ws-sec-contact" aria-label="Facebook">' + E.EVER_icon('facebook') + '</a>';
          if (sec.social && sec.social.ig) soc += '<a href="#ws-sec-contact" aria-label="Instagram">' + E.EVER_icon('instagram') + '</a>';
          if (sec.social && sec.social.share) soc += '<a href="#ws-sec-contact" aria-label="Share">' + E.EVER_icon('share') + '</a>';
          html += '' +
            '<footer class="ws-footer" id="ws-sec-contact">' +
              '<div class="ws-foot-grid">' +
                '<div class="ws-foot-col">' +
                  '<h3>Get in touch</h3>' +
                  '<p>For any queries, feel free to reach out.</p>' +
                  '<a class="ws-foot-line" href="tel:' + E.EVER_esc(String(sec.phone).replace(/\s/g, '')) + '">' + E.EVER_icon('phone') + E.EVER_esc(sec.phone) + '</a>' +
                  '<a class="ws-foot-line" href="mailto:' + E.EVER_esc(sec.email) + '">' + E.EVER_icon('mail') + E.EVER_esc(sec.email) + '</a>' +
                  '<a class="ws-foot-line" href="https://wa.me/' + E.EVER_esc(String(sec.phone).replace(/\D/g, '')) + '" target="_blank" rel="noopener noreferrer">' + E.EVER_icon('whatsapp') + E.EVER_esc(sec.whatsapp) + '</a>' +
                '</div>' +
                '<div class="ws-foot-col ws-foot-mid">' +
                  '<span class="ws-crest"><i></i>' + E.EVER_esc(E.EVER_monogram(B.nameA, B.nameB)) + '<i></i></span>' +
                  '<p class="ws-thanks">' + E.EVER_esc(sec.thanks) + '</p>' +
                '</div>' +
                '<div class="ws-foot-col ws-foot-right">' +
                  '<h3>Share the love</h3>' +
                  '<p>Share our invitation with your family and friends</p>' +
                  '<div class="ws-soc">' + soc + '</div>' +
                '</div>' +
              '</div>' +
              '<div class="ws-foot-bar">' +
                '<span>\u00a9 ' + new Date().getFullYear() + ' ' + E.EVER_esc(B.nameA + ' & ' + B.nameB) + (sec.copyright ? ' \u00b7 ' + E.EVER_esc(sec.copyright) : '') + '. All rights reserved.</span>' +
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
      var nf = (E.EVER_NAME_FONTS[d.nameFont] || E.EVER_NAME_FONTS[tpl.nameFont] || E.EVER_NAME_FONTS.vibes).cls;
      var el = E.EVER_miniRoot(tpl, d, 'royal');
      var events = (S.events.items || []).slice(0, opts.short ? 2 : 3).map(function (ev) {
        return '<span class="wsm-ev">' + E.EVER_icon(ev.icon) + '<b>' + E.EVER_esc(ev.name) + '</b><i>' + E.EVER_esc(ev.time) + '</i></span>';
      }).join('');
      var story = (S.story.items || []).slice(0, opts.short ? 0 : 4).map(function (m) {
        return '<span class="wsm-ms"><img src="' + E.EVER_esc(E.EVER_photoSrc(m.photo)) + '" alt=""/></span>';
      }).join('');
      var gal = (S.gallery.items || []).slice(0, 6).map(function (p) {
        return '<img src="' + E.EVER_esc(E.EVER_photoSrc(p.src)) + '" alt=""/>';
      }).join('');
      var amen = (S.venue.items || []).slice(0, 4).map(function (a) {
        return '<span>' + E.EVER_icon(a.icon) + E.EVER_esc(a.label) + '</span>';
      }).join('');
      el.innerHTML = '' +
        '<div class="wsm-hero">' +
          '<img class="wsm-hero-img" src="' + E.EVER_esc(E.EVER_photoSrc(S.hero.photo)) + '" alt=""/>' +
          '<span class="wsm-orn wsm-orn-a" aria-hidden="true"></span><span class="wsm-orn wsm-orn-b" aria-hidden="true"></span>' +
          '<span class="wsm-mono">' + E.EVER_esc(E.EVER_monogram(B.nameA, B.nameB)) + '</span>' +
          '<span class="wsm-kick">' + E.EVER_esc(S.hero.kicker2) + '</span>' +
          '<strong class="wsm-names ' + nf + '">' + E.EVER_esc(B.nameA) + ' <i>\u0026</i> ' + E.EVER_esc(B.nameB) + '</strong>' +
          '<span class="wsm-div"><i></i>' + E.EVER_icon('heart') + '<i></i></span>' +
          '<span class="wsm-date">' + E.EVER_esc(E.EVER_fmtHeroDate(B.date)) + '</span>' +
          '<span class="wsm-btn">' + E.EVER_esc(S.hero.btnText || 'Enter invitation') + '</span>' +
        '</div>' +
        '<div class="wsm-count">' +
          '<div class="wsm-timer">' +
            '<span><b>120</b><i>Days</i></span><span><b>08</b><i>Hours</i></span>' +
            '<span><b>45</b><i>Mins</i></span><span><b>32</b><i>Secs</i></span>' +
          '</div>' +
          '<div class="wsm-dcards">' +
            '<span>' + E.EVER_icon('calendar') + '<b>Date</b><i>' + E.EVER_esc(E.EVER_fmtLongDate(B.date)) + '</i></span>' +
            '<span>' + E.EVER_icon('clock') + '<b>Time</b><i>' + E.EVER_esc(B.time) + '</i></span>' +
            '<span>' + E.EVER_icon('pin') + '<b>Venue</b><i>' + E.EVER_esc(B.venue) + '</i></span>' +
            '<span>' + E.EVER_icon('dress') + '<b>Dress</b><i>' + E.EVER_esc(B.dress) + '</i></span>' +
          '</div>' +
        '</div>' +
        (opts.short ? '' :
        '<div class="wsm-story"><span class="wsm-st">' + E.EVER_esc(S.story.title) + '</span>' +
          '<div class="wsm-ms-row">' + story + '</div></div>') +
        '<div class="wsm-gallery">' + gal + '</div>' +
        '<div class="wsm-events"><span class="wsm-st">' + E.EVER_esc(S.events.title) + '</span>' + events + '</div>' +
        (opts.short ? '' :
        '<div class="wsm-venue"><b>' + E.EVER_esc(S.venue.name) + '</b>' + amen + '</div>' +
        '<div class="wsm-rsvp"><b>' + E.EVER_esc(S.rsvp.title) + '</b><span class="wsm-btn wsm-btn-dark">Submit RSVP</span></div>') +
        '<div class="wsm-foot"><span>' + E.EVER_esc(S.contact.thanks) + '</span>' +
          '<span class="wsm-crest">' + E.EVER_esc(E.EVER_monogram(B.nameA, B.nameB)) + '</span></div>'
        ;
      return el;
    }
  });
})();
