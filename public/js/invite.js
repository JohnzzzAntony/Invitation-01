/* ==========================================================================
   Invitara — published invitation (the page guests open)

   There is no server, so the invitation travels inside the link: publish
   encodes {state, theme, slug} into the URL hash and this page decodes it.
   That is what makes a shared link open on someone else's phone.

   A guest's RSVP therefore has nowhere to POST. Instead the reply is composed
   into a WhatsApp or e-mail message addressed to the host, using the contact
   details the host entered — the guest still replies in one tap, and the host
   still receives it, without an account or a backend.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.EVER_C;
  var root = document.getElementById('invite-root');
  var missing = document.getElementById('invite-missing');

  function fail() {
    if (root) root.hidden = true;
    if (missing) missing.hidden = false;
  }

  if (!C || !root || !window.EVER_renderSite) return fail();

  var payload = C.decodeInvite(window.location.hash);
  if (!payload || !payload.s) return fail();

  var state = payload.s;
  var tpl = window.EVER_findTemplate(payload.t || state.templateId);
  if (!tpl) return fail();

  /* ---------------- Render ---------------- */
  var site;
  try {
    site = window.EVER_renderSite(state, tpl, {});
  } catch (e) {
    return fail();
  }
  site.__wsData = state;
  root.appendChild(site);

  /* Bind the layout's behaviours. This is what sizes each slider slide to
     one-per-view, opens the mobile menu and the photo lightbox — without it
     a hero slider lays all its slides out side by side. rsvpDemo is off
     because a guest's reply is sent to the host below, not faked. */
  if (window.EVER_bindSite) window.EVER_bindSite(site, { rsvpDemo: false });
  if (window.EVER_tickCountdowns) window.EVER_tickCountdowns(root);

  /* Countdowns must keep ticking on a page nobody is editing. */
  setInterval(function () {
    if (window.EVER_tickCountdowns) window.EVER_tickCountdowns(root);
  }, 1000);

  /* ---------------- Title & share preview ---------------- */
  var b = state.basics || {};
  var who = (b.nameA && b.nameB) ? b.nameA + ' & ' + b.nameB : (b.title || b.nameA || '');
  if (who) {
    document.title = who + ' — you’re invited';
    var desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute('content',
        'You are invited' + (who ? ' — ' + who : '') +
        (b.date ? ' on ' + b.date : '') + '. See the details and RSVP.');
    }
  }

  /* ---------------- RSVP ---------------- */
  /* Build the message the guest sends back to the host. */
  function replyText(fields) {
    var lines = ['RSVP' + (who ? ' — ' + who : ''), ''];
    if (fields.name)   lines.push('Name: ' + fields.name);
    if (fields.attend) lines.push('Attending: ' + fields.attend);
    if (fields.guests) lines.push('Guests: ' + fields.guests);
    if (fields.meal)   lines.push('Meal: ' + fields.meal);
    if (fields.phone)  lines.push('Phone: ' + fields.phone);
    if (fields.msg)    lines.push('', fields.msg);
    return lines.join('\n');
  }

  /* Host contact details, wherever the layout stored them. */
  function hostContact() {
    var sections = state.sections || {};
    var social = b.social || {};
    var contact = sections.contact || {};
    return {
      wa: social.wa || contact.wa || contact.phone || b.phone || '',
      email: social.email || contact.email || b.email || ''
    };
  }

  function sendReply(fields) {
    var contact = hostContact();
    var text = replyText(fields);
    var subject = 'RSVP' + (who ? ' — ' + who : '');

    if (contact.wa) {
      var digits = String(contact.wa).replace(/[^\d]/g, '');
      if (digits) {
        window.open('https://wa.me/' + digits + '?text=' + encodeURIComponent(text),
          '_blank', 'noopener,noreferrer');
        return true;
      }
    }
    if (contact.email) {
      window.location.href = 'mailto:' + encodeURIComponent(contact.email) +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(text);
      return true;
    }
    return false;
  }

  function thankYou(form, sent) {
    var box = document.createElement('div');
    box.className = 'ws-rsvp-done';
    box.innerHTML = sent
      ? '<h4>Thank you — nearly there</h4>' +
        '<p>Send the message that just opened and your reply reaches the host.</p>'
      : '<h4>Thank you</h4>' +
        '<p>Your reply has been noted. If you can, message the host directly ' +
        'so they have it in writing.</p>';
    form.parentNode.replaceChild(box, form);
  }

  Array.prototype.forEach.call(root.querySelectorAll('.ws-rsvp-form'), function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var get = function (n) {
        var el = form.querySelector('[name="' + n + '"]');
        return el ? String(el.value || '').trim() : '';
      };
      var fields = {
        name: get('name'), attend: get('attend'), guests: get('guests'),
        meal: get('meal'), phone: get('phone'), msg: get('msg')
      };

      if (!fields.name) {
        if (window.everToast) window.everToast('Please add your name.');
        var nameEl = form.querySelector('[name="name"]');
        if (nameEl) nameEl.focus();
        return;
      }
      if (!fields.attend) {
        if (window.everToast) window.everToast('Please let the host know if you can attend.');
        return;
      }

      thankYou(form, sendReply(fields));
    });
  });

  /* Minimal toast for this page (app.js is not loaded on the guest view). */
  if (!window.everToast) {
    var toastEl = document.getElementById('toast');
    var timer = null;
    window.everToast = function (msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.hidden = false;
      clearTimeout(timer);
      timer = setTimeout(function () { toastEl.hidden = true; }, 3200);
    };
  }
})();
