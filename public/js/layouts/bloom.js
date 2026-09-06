/* ==========================================================================
   Ever RSVP — layout: bloom (Garden Wedding)
   Airy garden editorial — genuinely different structure from royal:
   light banded page, arch-shaped hero photo on a soft backdrop with
   CSS-drawn petals, full-width inline details band (When/Where/Time/Dress),
   welcome note with floral divider, day-of schedule as a growing vine,
   alternating editorial story rows, masonry photo mosaic, floral-framed
   RSVP card and a light botanical footer. No monogram nav bar.
   Styles: public/css/ly-bloom.css (.ws-bloom / .wsm.ws-bloom).
   Contract: docs/LAYOUT-SPEC.md — reference implementation royal.js.
   ========================================================================== */
(function () {
  'use strict';
  var E = window;

  E.EVER_registerLayout({
    id: 'bloom',
    label: 'Garden Wedding',
    events: ['wedding'],

    basics: [
      { k: 'nameA', label: 'First partner', type: 'text', ph: 'Freya' },
      { k: 'nameB', label: 'Second partner', type: 'text', ph: 'Oliver' },
      { k: 'date',  label: 'Date', type: 'date' },
      { k: 'time',  label: 'Time', type: 'text', ph: '02:00 PM in the afternoon' },
      { k: 'venue', label: 'Venue', type: 'text', ph: 'Willow & Ivy Gardens' },
      { k: 'city',  label: 'City / region', type: 'text', ph: 'Somerset' },
      { k: 'dress', label: 'Dress code', type: 'text', ph: 'Garden formal \u00b7 soft pastels' },
      { k: 'quote', label: 'Favourite quote', type: 'text', ph: 'Love planted deep, blooming forever.' }
    ],

    sections: [
      { id: 'hero', label: 'Hero',
        fields: [
          { k: 'kicker',  label: 'Kicker line', type: 'text', ph: 'The garden wedding of' },
          { k: 'photo',   label: 'Arch photo', type: 'photo' },
          { k: 'btnText', label: 'Button text', type: 'text', ph: 'Join our celebration' }
        ] },
      { id: 'details', label: 'Details band',
        fields: [
          { k: 'label', label: 'Kicker above the timer', type: 'text', ph: 'Counting down to the day' }
        ] },
      { id: 'welcome', label: 'Welcome note',
        fields: [
          { k: 'title', label: 'Section title', type: 'text', ph: 'Welcome to our garden' },
          { k: 'text',  label: 'Welcome note', type: 'textarea', ph: 'We\u2019re so glad you\u2019re here\u2026' }
        ] },
      { id: 'schedule', label: 'Day schedule (vine)',
        fields: [ { k: 'title', label: 'Section title', type: 'text', ph: 'The garden day' } ],
        list: { k: 'items', label: 'Moment', blank: function () {
            return { time: '', title: 'New moment', note: '' }; },
          fields: [
            { k: 'time',  label: 'Time', type: 'text', ph: '02:00 PM' },
            { k: 'title', label: 'Title', type: 'text', ph: 'The ceremony' },
            { k: 'note',  label: 'Note', type: 'text', ph: 'Vows beneath the willow\u2026' }
          ] } },
      { id: 'story', label: 'Our story',
        fields: [ { k: 'title', label: 'Section title', type: 'text', ph: 'How we grew' } ],
        list: { k: 'items', label: 'Chapter', blank: function () {
            return { photo: 'decor', title: 'New chapter', date: '', text: '' }; },
          fields: [
            { k: 'photo', label: 'Photo', type: 'photo' },
            { k: 'title', label: 'Title', type: 'text', ph: 'First met' },
            { k: 'date',  label: 'Date line', type: 'text', ph: '14 March 2021' },
            { k: 'text',  label: 'Description', type: 'textarea', ph: 'A chance meeting\u2026' }
          ] } },
      { id: 'gallery', label: 'Photo mosaic',
        fields: [ { k: 'title', label: 'Section title', type: 'text', ph: 'Gathered moments' } ],
        list: { k: 'items', label: 'Photo', blank: function () { return { src: 'decor' }; },
          fields: [ { k: 'src', label: 'Photo', type: 'photo' } ] } },
      { id: 'rsvp', label: 'RSVP form',
        fields: [
          { k: 'title',       label: 'Heading', type: 'text', ph: 'Kindly reply' },
          { k: 'note',        label: 'Note before date', type: 'text', ph: 'Please respond by' },
          { k: 'deadline',    label: 'Reply deadline', type: 'date' },
          { k: 'showPhone',   label: 'Ask for phone number', type: 'check' },
          { k: 'guestsMax',   label: 'Max guests per reply', type: 'number', min: 1, max: 12 },
          { k: 'showMsg',     label: 'Include message box', type: 'check' },
          { k: 'submit',      label: 'Submit button text', type: 'text', ph: 'Send our reply' },
          { k: 'success',     label: 'Success message', type: 'text', ph: 'Thank you!' }
        ],
        list: { k: 'meals', label: 'Meal option', blank: function () { return ''; },
          fields: [ { k: '', label: 'Option', type: 'text', ph: 'Garden vegetarian' } ] } },
      { id: 'footer', label: 'Garden footer',
        fields: [
          { k: 'phone',     label: 'Phone', type: 'text', ph: '+44 1749 123456' },
          { k: 'email',     label: 'E-mail', type: 'text', ph: 'hello@example.com' },
          { k: 'thanks',    label: 'Thank-you line', type: 'text', ph: 'Thank you for growing alongside us\u2026' },
          { k: 'copyright', label: 'Copyright extra (optional)', type: 'text', ph: '' },
          { k: 'credit',    label: 'Credit line', type: 'text', ph: 'Grown with \u2665 for our big day' }
        ] }
    ],

    defaults: function () {
      return {
        basics: {
          nameA: 'Freya', nameB: 'Oliver',
          date: E.EVER_futureISO(4, 26),
          time: '02:00 PM in the afternoon',
          venue: 'Willow & Ivy Gardens',
          city: 'Somerset',
          dress: 'Garden formal \u00b7 soft pastels',
          quote: 'Love planted deep, blooming forever.'
        },
        sections: {
          hero: {
            on: true,
            kicker: 'The garden wedding of',
            photo: 'couple',
            btnText: 'Join our celebration'
          },
          details: {
            on: true,
            label: 'Counting down to the day'
          },
          welcome: {
            on: true,
            title: 'Welcome to our garden',
            text: 'We\u2019re so glad you\u2019re here. After six years, a hundred long walks and one very spoiled cat, we\u2019re finally trading vows under the willows \u2014 and we can\u2019t imagine the day without you. Wander the grounds, sip something sparkling, and stay long after sunset.'
          },
          schedule: {
            on: true, title: 'The garden day',
            items: [
              { time: '01:30 PM', title: 'Guests arrive',        note: 'Lemonade and elderflower cordial on the croquet lawn while you find your seat.' },
              { time: '02:00 PM', title: 'The ceremony',         note: 'Vows beneath the great willow, with strings playing softly across the water.' },
              { time: '03:00 PM', title: 'Garden reception',     note: 'Pimm\u2019s cups, lawn games and photographs among the rose beds.' },
              { time: '05:00 PM', title: 'Dinner in the orchard', note: 'A long-table feast under the apple trees, with toasts and stories welcome.' },
              { time: '08:00 PM', title: 'First dance & party',  note: 'Festoon lights, cake, and dancing until the stars come out.' }
            ]
          },
          story: {
            on: true, title: 'How we grew',
            items: [
              { photo: 'cafe',     title: 'First met',        date: '14 March 2021', text: 'A rainy Saturday, one shared table in a crowded caf\u00e9, and a conversation neither of us wanted to end.' },
              { photo: 'proposal', title: 'The proposal',     date: '20 July 2023', text: 'Golden hour at the top of the orchard hill, a ring hidden inside a bundle of wildflowers, and a very tearful yes.' },
              { photo: 'dance',    title: 'Growing together', date: 'Spring 2024', text: 'We planted our first garden together that spring. Most of it thrived, the tomatoes did not, and we loved every minute of it.' },
              { photo: 'rings',    title: 'Forever begins',   date: E.EVER_fmtLongDate(E.EVER_futureISO(4, 26)), text: 'Now we get to say yes in front of everyone we love. We can\u2019t wait to celebrate with you.' }
            ]
          },
          gallery: {
            on: true, title: 'Gathered moments',
            items: [
              { src: 'couple' }, { src: 'decor' }, { src: 'dance' },
              { src: 'rings' }, { src: 'cafe' }, { src: 'band' },
              { src: 'proposal' }, { src: 'shoes' }
            ]
          },
          rsvp: {
            on: true,
            title: 'Kindly reply',
            note: 'Please respond by',
            deadline: E.EVER_futureISO(2, 10),
            showPhone: true,
            guestsMax: 6,
            meals: ['Garden vegetarian', 'Seasonal fish', 'Free-range chicken', 'Not sure yet'],
            showMsg: true,
            submit: 'Send our reply',
            success: 'Thank you! Your reply is tucked beneath the rose arbour \u2014 we can\u2019t wait to celebrate with you.'
          },
          footer: {
            on: true,
            phone: '+44 1749 123456',
            email: 'hello@freyaandoliver.example',
            thanks: 'Thank you for growing alongside us \u2014 see you under the willows.',
            copyright: '',
            credit: 'Grown with \u2665 for our big day'
          }
        }
      };
    },

    render: function (d, tpl, opts) {
      var B = d.basics, S = d.sections;
      var nf = (E.EVER_NAME_FONTS[d.nameFont] || E.EVER_NAME_FONTS[tpl.nameFont] || E.EVER_NAME_FONTS.vibes).cls;
      var el = E.EVER_siteRoot(d, tpl, opts);

      var html = '';
      (d.order && d.order.length ? d.order : E.EVER_layoutOrder(E.EVER_findLayout('bloom'))).forEach(function (id) {
        var sec = S[id];
        if (!sec || !sec.on) return;

        if (id === 'hero') {
          html += '' +
            '<header class="ws-sec wsb-hero" id="ws-sec-hero">' +
              '<span class="wsb-petal p1" aria-hidden="true"></span>' +
              '<span class="wsb-petal p2" aria-hidden="true"></span>' +
              '<span class="wsb-petal p3" aria-hidden="true"></span>' +
              '<span class="wsb-petal p4" aria-hidden="true"></span>' +
              '<span class="wsb-petal p5" aria-hidden="true"></span>' +
              '<span class="wsb-petal p6" aria-hidden="true"></span>' +
              '<span class="wsb-petal p7" aria-hidden="true"></span>' +
              '<div class="wsb-hero-in">' +
                '<p class="wsb-kick">' + E.EVER_esc(sec.kicker) + '</p>' +
                '<h1 class="wsb-names ' + nf + '">' +
                  E.EVER_esc(B.nameA) + ' <span class="wsb-amp">\u0026</span> ' + E.EVER_esc(B.nameB) + '</h1>' +
                '<span class="wsb-archwrap">' +
                  '<span class="wsb-arch"><img src="' + E.EVER_esc(E.EVER_photoSrc(sec.photo)) + '" alt="' +
                    E.EVER_esc(B.nameA + ' and ' + B.nameB) + '"/></span>' +
                '</span>' +
                '<p class="wsb-hero-date">' + E.EVER_esc(E.EVER_fmtHeroDate(B.date)) + '</p>' +
                '<a class="ws-btn ws-btn-dark" href="#ws-sec-details" data-goto="details">' +
                  E.EVER_esc(sec.btnText || 'Join our celebration') + '</a>' +
              '</div>' +
            '</header>';
        } else if (id === 'details') {
          html += '' +
            '<section class="ws-sec wsb-details" id="ws-sec-details">' +
              '<div class="wsb-band">' +
                '<p class="wsb-band-kick">' + E.EVER_esc(sec.label) + '</p>' +
                E.EVER_timerHtml(B.date) +
                '<div class="wsb-cols">' +
                  '<div class="wsb-col">' + E.EVER_icon('calendar') + '<b>When</b>' +
                    '<span>' + E.EVER_esc(E.EVER_fmtLongDate(B.date)) + '</span>' +
                    '<span>' + E.EVER_esc(E.EVER_fmtWeekday(B.date)) + '</span></div>' +
                  '<div class="wsb-col">' + E.EVER_icon('pin') + '<b>Where</b>' +
                    '<span>' + E.EVER_esc(B.venue) + '</span>' +
                    '<span>' + E.EVER_esc(B.city) + '</span></div>' +
                  '<div class="wsb-col">' + E.EVER_icon('clock') + '<b>Time</b>' +
                    '<span>' + E.EVER_esc(B.time) + '</span></div>' +
                  '<div class="wsb-col">' + E.EVER_icon('dress') + '<b>Dress</b>' +
                    '<span>' + E.EVER_esc(B.dress) + '</span></div>' +
                '</div>' +
              '</div>' +
            '</section>';
        } else if (id === 'welcome') {
          html += '' +
            '<section class="ws-sec wsb-welcome" id="ws-sec-welcome">' +
              '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
              '<p class="wsb-wtext">' + E.EVER_esc(sec.text) + '</p>' +
              '<span class="wsb-fdiv" aria-hidden="true"><i></i><em class="a"></em><em class="dot"></em><em class="b"></em><i></i></span>' +
              (B.quote ? '<p class="ws-quote">\u201c' + E.EVER_esc(B.quote) + '\u201d</p>' : '') +
            '</section>';
        } else if (id === 'schedule') {
          html += '' +
            '<section class="ws-sec wsb-sched" id="ws-sec-schedule">' +
              '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
              '<div class="wsb-vine">' +
                (sec.items || []).map(function (it) {
                  return '<div class="wsb-vitem">' +
                    '<span class="wsb-vleaf" aria-hidden="true"></span>' +
                    '<div class="wsb-vbody">' +
                      '<b class="wsb-vtime">' + E.EVER_esc(it.time) + '</b>' +
                      '<h3>' + E.EVER_esc(it.title) + '</h3>' +
                      (it.note ? '<p>' + E.EVER_esc(it.note) + '</p>' : '') +
                    '</div></div>';
                }).join('') +
              '</div>' +
            '</section>';
        } else if (id === 'story') {
          html += '' +
            '<section class="ws-sec wsb-story" id="ws-sec-story">' +
              '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
              '<div class="wsb-srows">' +
                (sec.items || []).map(function (m) {
                  return '<div class="wsb-srow">' +
                    '<span class="wsb-sphoto"><img src="' + E.EVER_esc(E.EVER_photoSrc(m.photo)) +
                      '" alt="' + E.EVER_esc(m.title) + '" loading="lazy"/></span>' +
                    '<div class="wsb-sbody">' +
                      '<i class="wsb-sdate">' + E.EVER_esc(m.date) + '</i>' +
                      '<h3>' + E.EVER_esc(m.title) + '</h3>' +
                      '<p>' + E.EVER_esc(m.text) + '</p>' +
                    '</div></div>';
                }).join('') +
              '</div>' +
            '</section>';
        } else if (id === 'gallery') {
          html += '' +
            '<section class="ws-sec wsb-gallery" id="ws-sec-gallery">' +
              '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
              '<div class="wsb-mosaic">' +
                (sec.items || []).map(function (p) {
                  return '<span class="wsb-mcell"><img src="' + E.EVER_esc(E.EVER_photoSrc(p.src)) +
                    '" alt="Event photo" loading="lazy"/></span>';
                }).join('') +
              '</div>' +
            '</section>';
        } else if (id === 'rsvp') {
          html += '' +
            '<section class="ws-sec wsb-rsvp" id="ws-sec-rsvp">' +
              '<div class="wsb-rcard">' +
                '<span class="wsb-corner tl" aria-hidden="true"></span>' +
                '<span class="wsb-corner tr" aria-hidden="true"></span>' +
                '<span class="wsb-corner br" aria-hidden="true"></span>' +
                '<span class="wsb-corner bl" aria-hidden="true"></span>' +
                '<h2 class="ws-title">' + E.EVER_esc(sec.title) + '</h2>' +
                '<p class="wsb-rnote">' + E.EVER_esc(sec.note) + ' <b>' +
                  E.EVER_esc(E.EVER_fmtLongDate(sec.deadline)) + '</b></p>' +
                E.EVER_rsvpFormHtml(sec) +
              '</div>' +
            '</section>';
        } else if (id === 'footer') {
          html += '' +
            '<footer class="ws-footer wsb-foot" id="ws-sec-footer">' +
              '<div class="wsb-foot-in">' +
                '<span class="wsb-botdiv" aria-hidden="true"><i></i><em class="a"></em><em class="dot"></em><em class="b"></em><i></i></span>' +
                '<span class="wsb-monoheart">' +
                  E.EVER_icon('heart') +
                  '<b>' + E.EVER_esc(E.EVER_monogram(B.nameA, B.nameB)) + '</b>' +
                  E.EVER_icon('heart') +
                '</span>' +
                '<p class="wsb-thanks">' + E.EVER_esc(sec.thanks) + '</p>' +
                '<div class="wsb-chips">' +
                  (sec.phone ? '<a class="wsb-chip" href="tel:' +
                    E.EVER_esc(String(sec.phone).replace(/\s/g, '')) + '">' +
                    E.EVER_icon('phone') + '<span>' + E.EVER_esc(sec.phone) + '</span></a>' : '') +
                  (sec.email ? '<a class="wsb-chip" href="mailto:' + E.EVER_esc(sec.email) + '">' +
                    E.EVER_icon('mail') + '<span>' + E.EVER_esc(sec.email) + '</span></a>' : '') +
                '</div>' +
                '<div class="wsb-foot-bar">' +
                  '<span>\u00a9 ' + new Date().getFullYear() + ' ' +
                    E.EVER_esc(B.nameA + ' & ' + B.nameB) +
                    (sec.copyright ? ' \u00b7 ' + E.EVER_esc(sec.copyright) : '') +
                    '. All rights reserved.</span>' +
                  '<span>' + E.EVER_esc(sec.credit || '') + '</span>' +
                '</div>' +
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
      var el = E.EVER_miniRoot(tpl, d, 'bloom');
      var H = S.hero || {}, SC = S.schedule || {}, G = S.gallery || {}, F = S.footer || {};
      var vine = (SC.items || []).slice(0, opts.short ? 0 : 3).map(function (it) {
        return '<span class="wsm-b-vi"><b>' + E.EVER_esc(it.time) + '</b><i>' + E.EVER_esc(it.title) + '</i></span>';
      }).join('');
      var gal = (G.items || []).slice(0, 6).map(function (p) {
        return '<img src="' + E.EVER_esc(E.EVER_photoSrc(p.src)) + '" alt=""/>';
      }).join('');
      el.innerHTML = '' +
        '<div class="wsm-b-hero">' +
          '<span class="wsm-b-petal a" aria-hidden="true"></span>' +
          '<span class="wsm-b-petal b" aria-hidden="true"></span>' +
          '<span class="wsm-b-arch"><img src="' + E.EVER_esc(E.EVER_photoSrc(H.photo)) + '" alt=""/></span>' +
          '<span class="wsm-kick">' + E.EVER_esc(H.kicker || '') + '</span>' +
          '<strong class="wsm-names ' + nf + '">' +
            E.EVER_esc(B.nameA) + ' <i>\u0026</i> ' + E.EVER_esc(B.nameB) + '</strong>' +
          '<span class="wsm-date">' + E.EVER_esc(E.EVER_fmtHeroDate(B.date)) + '</span>' +
          '<span class="wsm-btn">' + E.EVER_esc(H.btnText || 'Join our celebration') + '</span>' +
        '</div>' +
        '<div class="wsm-b-band">' +
          '<span>' + E.EVER_icon('calendar') + '<b>When</b><i>' + E.EVER_esc(E.EVER_fmtLongDate(B.date)) + '</i></span>' +
          '<span>' + E.EVER_icon('pin') + '<b>Where</b><i>' + E.EVER_esc(B.venue) + '</i></span>' +
          '<span>' + E.EVER_icon('clock') + '<b>Time</b><i>' + E.EVER_esc(B.time) + '</i></span>' +
          '<span>' + E.EVER_icon('dress') + '<b>Dress</b><i>' + E.EVER_esc(B.dress) + '</i></span>' +
        '</div>' +
        (opts.short ? '' :
        '<div class="wsm-b-vine"><span class="wsm-st">' + E.EVER_esc(SC.title || '') + '</span>' + vine + '</div>' +
        '<div class="wsm-b-gal">' + gal + '</div>') +
        '<div class="wsm-b-foot"><span class="wsm-b-mono">' +
          E.EVER_esc(E.EVER_monogram(B.nameA, B.nameB)) + '</span><span>' +
          E.EVER_esc(F.thanks || '') + '</span></div>'
        ;
      return el;
    }
  });
})();
