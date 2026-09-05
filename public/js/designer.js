/* ==========================================================================
   Ever RSVP — "Create your own design" builder modal.
   Shared by create.html (design selection) and editor.html (design tab).
   Depends on: templates.js (EVER_* API), a #toast element is optional.
   ========================================================================== */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function toastMsg(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(t.__tm);
    t.__tm = setTimeout(function () { t.hidden = true; }, 2600);
  }

  var DEFAULTS = {
    id: '', name: '',
    dark: '#17301f', gold: '#c9a45c', bg: '#f7f3e8', ink: '#3c3628', soft: '#efe7d2',
    nameFont: 'vibes', ornament: 'floral'
  };

  var state = null;

  function ensureModal() {
    var wrap = document.getElementById('designer-overlay');
    if (wrap) return wrap;
    wrap = document.createElement('div');
    wrap.className = 'modal-overlay';
    wrap.id = 'designer-overlay';
    wrap.hidden = true;
    wrap.innerHTML = '' +
      '<div class="modal designer-modal" role="dialog" aria-modal="true" aria-labelledby="designer-title">' +
        '<h2 class="m-names" id="designer-title">Create your own design</h2>' +
        '<p class="m-meta">Pick the colors, fonts and ornaments — your design appears in the gallery and stays editable.</p>' +
        '<div class="dsn-grid">' +
          '<div class="dsn-form">' +
            '<div class="ed-field"><label for="dsn-name">Design name</label>' +
              '<input id="dsn-name" type="text" maxlength="28" placeholder="e.g. Royal Peacock"/></div>' +
            '<div class="dsn-colors">' +
              '<label class="dsn-color"><input id="dsn-dark" type="color" value="#17301f"/><span>Dark</span></label>' +
              '<label class="dsn-color"><input id="dsn-gold" type="color" value="#c9a45c"/><span>Accent</span></label>' +
              '<label class="dsn-color"><input id="dsn-bg" type="color" value="#f7f3e8"/><span>Background</span></label>' +
              '<label class="dsn-color"><input id="dsn-ink" type="color" value="#3c3628"/><span>Text</span></label>' +
              '<label class="dsn-color"><input id="dsn-soft" type="color" value="#efe7d2"/><span>Soft tone</span></label>' +
            '</div>' +
            '<div class="ed-field"><span class="ed-label">Name font</span><div class="dsn-fonts" id="dsn-fonts"></div></div>' +
            '<div class="ed-field"><span class="ed-label">Ornaments</span><div class="dsn-orns" id="dsn-orns"></div></div>' +
          '</div>' +
          '<div class="dsn-preview-box"><div id="dsn-preview"></div></div>' +
        '</div>' +
        '<div class="done-actions">' +
          '<button class="btn btn-ghost" type="button" id="dsn-cancel">Cancel</button>' +
          '<button class="btn btn-primary" type="button" id="dsn-save">Save design</button>' +
        '</div>' +
        '<p class="demo-note">Your design is saved on this device and can be selected like any other.</p>' +
      '</div>';
    document.body.appendChild(wrap);
    return wrap;
  }

  function buildRadios(box, list, current, cls) {
    box.innerHTML = '';
    list.forEach(function (op) {
      var lab = document.createElement('label');
      lab.className = cls + (op.value === current ? ' on' : '');
      lab.innerHTML = '<input type="radio" name="' + box.id + '" value="' + op.value + '"' +
        (op.value === current ? ' checked' : '') + '/>' + op.html;
      lab.addEventListener('click', function (e) {
        e.preventDefault();
        box.querySelectorAll('.' + cls).forEach(function (n) { n.classList.remove('on'); });
        lab.classList.add('on');
        lab.querySelector('input').checked = true;
        state[box.getAttribute('data-k')] = op.value;
        update();
      });
      box.appendChild(lab);
    });
  }

  function sampleData() {
    var d = window.EVER_siteDefaults();
    d.templateId = '__preview__';
    return d;
  }

  function previewTemplate() {
    return {
      id: '__preview__', name: state.name || 'My design', custom: true, category: 'Custom',
      dark: state.dark, gold: state.gold, bg: state.bg, ink: state.ink, soft: state.soft,
      nameFont: state.nameFont, ornament: state.ornament
    };
  }

  function update() {
    var prev = document.getElementById('dsn-preview');
    if (!prev || !window.EVER_renderSiteMini) return;
    prev.innerHTML = '';
    prev.appendChild(window.EVER_renderSiteMini(previewTemplate(), sampleData()));
    var save = document.getElementById('dsn-save');
    if (save) save.disabled = !state.name.trim();
  }

  function open(opts) {
    opts = opts || {};
    state = Object.assign({}, DEFAULTS, opts.template || {});
    var wrap = ensureModal();
    var q = function (id) { return wrap.querySelector('#' + id); };

    q('dsn-name').value = state.name;
    q('dsn-dark').value = state.dark; q('dsn-gold').value = state.gold;
    q('dsn-bg').value = state.bg; q('dsn-ink').value = state.ink; q('dsn-soft').value = state.soft;
    var titleEl = q('designer-title');
    if (titleEl) titleEl.textContent = opts.template ? 'Edit your design' : 'Create your own design';

    [['dsn-fonts', 'nameFont', fontOptions()], ['dsn-orns', 'ornament', ornOptions()]].forEach(function (pair) {
      var box = q(pair[0]);
      box.setAttribute('data-k', pair[1]);
      buildRadios(box, pair[2], state[pair[1]], pair[0] === 'dsn-fonts' ? 'dsn-font' : 'dsn-orn');
    });

    ['dark', 'gold', 'bg', 'ink', 'soft'].forEach(function (k) {
      q('dsn-' + k).oninput = function (e) { state[k] = e.target.value; update(); };
    });
    q('dsn-name').oninput = function (e) { state.name = e.target.value; update(); };

    q('dsn-cancel').onclick = close;
    q('dsn-save').onclick = function () {
      if (!state.name.trim()) { toastMsg('Give your design a name first.'); return; }
      var t = {
        id: state.id || ('custom-' + Date.now()),
        name: state.name.trim(),
        dark: state.dark, gold: state.gold, bg: state.bg, ink: state.ink, soft: state.soft,
        nameFont: state.nameFont, ornament: state.ornament
      };
      window.EVER_saveCustomTemplate(t);
      close();
      toastMsg('Design \u201c' + t.name + '\u201d saved.');
      if (typeof opts.onSave === 'function') opts.onSave(t);
    };

    wrap.hidden = false;
    document.body.classList.add('modal-open');
    update();
    q('dsn-name').focus();
  }

  function fontOptions() {
    return [
      { value: 'vibes', html: '<span class="f-vibes">Amelia</span>' },
      { value: 'paris', html: '<span class="f-paris">Amelia</span>' },
      { value: 'corm',  html: '<span class="f-corm">Amelia</span>' },
      { value: 'jost',  html: '<span class="f-jost">AMELIA</span>' }
    ];
  }
  function ornOptions() {
    return [
      { value: 'floral', html: '<span class="dsn-orn-demo orn-floral" aria-hidden="true"></span><span>Floral</span>' },
      { value: 'lines',  html: '<span class="dsn-orn-demo orn-lines" aria-hidden="true"></span><span>Lines</span>' },
      { value: 'geo',    html: '<span class="dsn-orn-demo orn-geo" aria-hidden="true"></span><span>Geometric</span>' }
    ];
  }

  function close() {
    var wrap = document.getElementById('designer-overlay');
    if (wrap) wrap.hidden = true;
    document.body.classList.remove('modal-open');
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest ? e.target.closest('[data-open-designer]') : null;
    if (opener) {
      e.preventDefault();
      var tplId = opener.getAttribute('data-template-id');
      var template = tplId ? window.EVER_readCustomTemplates().filter(function (t) { return t.id === tplId; })[0] : null;
      open({
        template: template,
        onSave: function (t) {
          if (typeof opener.__dsnOnSave === 'function') opener.__dsnOnSave(t);
        }
      });
    }
    var overlay = document.getElementById('designer-overlay');
    if (overlay && !overlay.hidden && (e.target === overlay)) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

  window.EVER_openDesigner = function (opts) { open(opts || {}); };
})();
