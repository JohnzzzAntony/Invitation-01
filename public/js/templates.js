/* ==========================================================================
   Ever RSVP — shared template catalog
   Loaded by create.html, checkout.html and editor.html.
   Exposes window.EVER_TEMPLATES, window.EVER_FONT_PAIRS,
   window.renderInvite() (legacy card) and window.renderSiteMini()
   (mini event-WEBSITE preview used across the flow).
   ========================================================================== */
(function () {
  'use strict';

  var TEMPLATES = [
    { id: 'eucalyptus', name: 'Eucalyptus',  category: 'Floral',
      bg: 'linear-gradient(165deg,#a3bda0,#7f9c7c)', text: '#fdfdfa', kicker: 'rgba(253,253,250,.75)',
      rule: 'rgba(253,253,250,.55)', btn: '#fdfdfa', btnText: '#5c7a52', dark: true },
    { id: 'blush', name: 'Blush', category: 'Watercolor',
      bg: 'linear-gradient(165deg,#f9e4e4,#fbeeeb)', text: '#7d5154', kicker: 'rgba(125,81,84,.6)',
      rule: 'rgba(125,81,84,.35)', btn: '#7d5154', btnText: '#fdf7f5', dark: false },
    { id: 'monogram', name: 'Monogram', category: 'Modern',
      bg: '#ffffff', text: '#31434c', kicker: 'rgba(49,67,76,.55)',
      rule: 'rgba(49,67,76,.25)', btn: '#31434c', btnText: '#ffffff', dark: false, bordered: true },
    { id: 'golden-hour', name: 'Golden Hour', category: 'Classic',
      bg: '#f5efe4', text: '#a5814c', kicker: 'rgba(165,129,76,.6)',
      rule: 'rgba(165,129,76,.4)', btn: '#a5814c', btnText: '#fdfaf3', dark: false },
    { id: 'midnight', name: 'Midnight', category: 'Classic',
      bg: '#22384a', text: '#d9c08d', kicker: 'rgba(217,192,141,.65)',
      rule: 'rgba(217,192,141,.45)', btn: '#d9c08d', btnText: '#22384a', dark: true },
    { id: 'garden-party', name: 'Garden Party', category: 'Floral',
      bg: '#fbfcf8', text: '#5c7a52', kicker: 'rgba(92,122,82,.6)',
      rule: 'rgba(92,122,82,.35)', btn: '#5c7a52', btnText: '#ffffff', dark: false, dots: true },
    { id: 'ocean', name: 'Ocean', category: 'Modern',
      bg: 'linear-gradient(165deg,#12879f,#0d6a81)', text: '#eafafd', kicker: 'rgba(234,250,253,.7)',
      rule: 'rgba(234,250,253,.45)', btn: '#eafafd', btnText: '#0d6a81', dark: true },
    { id: 'terracotta', name: 'Terracotta', category: 'Modern',
      bg: 'linear-gradient(165deg,#c98a67,#b3704e)', text: '#fdf3ec', kicker: 'rgba(253,243,236,.7)',
      rule: 'rgba(253,243,236,.45)', btn: '#fdf3ec', btnText: '#a05a37', dark: true },
    { id: 'ivory', name: 'Ivory', category: 'Elegant',
      bg: '#f4f1ea', text: '#3a3a36', kicker: 'rgba(58,58,54,.55)',
      rule: 'rgba(58,58,54,.3)', btn: '#3a3a36', btnText: '#f4f1ea', dark: false }
  ];

  var FONT_PAIRS = {
    classic:  { label: 'Classic',  namesClass: '',                   sample: 'Aa', sampleClass: 'serif' },
    romantic: { label: 'Romantic', namesClass: 'inv-names-italic',   sample: 'Aa', sampleClass: 'serif italic' },
    modern:   { label: 'Modern',   namesClass: 'inv-names-modern',   sample: 'AA', sampleClass: '' }
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtDate(iso) {
    var d = new Date(iso + 'T12:00:00');
    if (isNaN(d.getTime())) return iso || '';
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ' · ' + d.getFullYear();
  }

  /**
   * Build an invitation preview DOM node (legacy card style).
   * opts.size: 'xs' (chips) | 'sm' (cards / summary) | 'lg' (editor canvas)
   * opts.extended: include story / schedule / RSVP blocks (editor canvas)
   */
  function renderInvite(tpl, data, opts) {
    opts = opts || {};
    var fonts = FONT_PAIRS[data.fontPair] || FONT_PAIRS.classic;
    var accent = data.accent || tpl.btn;
    var el = document.createElement('div');
    el.className = 'inv inv-' + (opts.size || 'sm')
      + (tpl.bordered ? ' inv-bordered' : '') + (tpl.dots ? ' inv-dots' : '');
    el.style.background = tpl.bg;
    el.style.color = tpl.text;

    var html = '' +
      '<p class="inv-kicker">' + esc(data.kicker || 'Together with their families') + '</p>' +
      '<h4 class="inv-names ' + fonts.namesClass + '">' +
        esc(data.nameA || 'Amelia') + ' <span class="inv-amp" style="color:' + accent + '">&amp;</span> ' +
        esc(data.nameB || 'Noah') +
      '</h4>' +
      '<span class="inv-rule" style="background:' + accent + '"></span>' +
      '<p class="inv-date">' + esc(fmtDate(data.date || '2026-06-14')).toUpperCase() + '</p>' +
      '<p class="inv-venue">' + esc((data.venue || 'Rosewood Barn') + ' · ' + (data.city || 'Kent')) + '</p>';

    if (opts.extended) {
      if (data.showStory) {
        html += '<p class="inv-story">' + esc(data.story || '') + '</p>';
      }
      if (data.showSchedule) {
        html += '' +
          '<div class="inv-schedule">' +
            '<p class="inv-sched-title">The day</p>' +
            '<div class="inv-sched-row"><span>Ceremony</span><i style="background:' + tpl.kicker + '"></i><b>4:00 pm</b></div>' +
            '<div class="inv-sched-row"><span>Dinner</span><i style="background:' + tpl.kicker + '"></i><b>6:00 pm</b></div>' +
            '<div class="inv-sched-row"><span>Dancing</span><i style="background:' + tpl.kicker + '"></i><b>8:00 pm</b></div>' +
          '</div>';
      }
      var q = '';
      if (data.qMenu) q += '<span class="inv-q">Menu selection</span>';
      if (data.qPlus) q += '<span class="inv-q">Plus-ones</span>';
      if (data.qSong) q += '<span class="inv-q">Song requests</span>';
      var qHtml = q ? '<div class="inv-qs">' + q + '</div>' : '';
      html += '' +
        '<div class="inv-rsvp">' +
          '<p class="inv-rsvp-title">Will you join us?</p>' +
          '<div class="inv-rsvp-btns">' +
            '<span class="inv-btn" style="background:' + accent + ';color:' + tpl.btnText + '">Joyfully accept</span>' +
            '<span class="inv-btn inv-btn-ghost" style="border-color:' + tpl.kicker + '">Regretfully decline</span>' +
          '</div>' + qHtml +
        '</div>';
    } else {
      html += '<span class="inv-btn" style="background:' + accent + ';color:' + tpl.btnText + '">RSVP</span>';
    }

    el.innerHTML = html;
    return el;
  }

  /**
   * Build a miniature EVENT WEBSITE preview (not a card) — a tiny scroll of
   * what guests actually get: nav, hero, info cards, reply strip, footer.
   * Used on the design-selection cards and the checkout order summary.
   */
  function renderSiteMini(tpl) {
    var el = document.createElement('div');
    el.className = 'msite' + (tpl.bordered ? ' msite-bordered' : '') + (tpl.dots ? ' msite-dots' : '');
    el.style.background = tpl.bg;
    el.style.color = tpl.text;
    el.setAttribute('aria-hidden', 'true');

    var html = '' +
      '<div class="ms-nav">' +
        '<b>Amelia <i>&middot;</i> Noah</b>' +
        '<span class="ms-chip" style="background:' + tpl.btn + ';color:' + tpl.btnText + '">RSVP</span>' +
      '</div>' +
      '<div class="ms-hero">' +
        '<span class="ms-kick">Together with their families</span>' +
        '<strong class="ms-names">Amelia <i style="color:' + tpl.btn + '">&amp;</i> Noah</strong>' +
        '<span class="ms-rule" style="background:' + tpl.btn + '"></span>' +
        '<span class="ms-date">Saturday &middot; June 14 &middot; 2026</span>' +
        '<span class="ms-loc">Rosewood Barn &middot; Kent</span>' +
      '</div>' +
      '<div class="ms-cards">' +
        '<span><b>When</b><i>4:00 pm</i></span>' +
        '<span><b>Where</b><i>The barn</i></span>' +
        '<span><b>Dress</b><i>Garden formal</i></span>' +
      '</div>' +
      '<div class="ms-day">' +
        '<b>The day</b>' +
        '<span><i style="background:' + tpl.btn + '"></i>Ceremony<em>4:00</em></span>' +
        '<span><i style="background:' + tpl.btn + '"></i>Dinner<em>6:30</em></span>' +
      '</div>' +
      '<div class="ms-foot">' +
        '<span class="ms-tag" style="color:' + tpl.btn + '">#AmeliaAndNoah</span>' +
        '<span class="ms-reply">Will you join us?</span>' +
      '</div>';

    el.innerHTML = html;
    return el;
  }

  window.EVER_TEMPLATES = TEMPLATES;
  window.EVER_FONT_PAIRS = FONT_PAIRS;
  window.renderInvite = renderInvite;
  window.renderSiteMini = renderSiteMini;
})();
