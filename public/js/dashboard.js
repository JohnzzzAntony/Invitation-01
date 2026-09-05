/* ============================================================
   Online RSVP — dashboard.js
   App.views.dashboard (9 tabs) + App.views.builder (full-screen)
   Plain vanilla JS on top of the window.App core (app.js).
   ============================================================ */
'use strict';

(function () {
  var A = window.App;

  /* ================= shared helpers ================= */

  var STATUS_COLORS = { attending: '#7C8A6E', pending: '#C9A96A', declined: '#B3543F' };

  function statusBadge(status) {
    var map = {
      attending: ['badge-green', 'Attending', 'check'],
      pending: ['badge-amber', 'Pending', 'clock'],
      declined: ['badge-red', 'Declined', 'x']
    };
    var m = map[status] || map.pending;
    return '<span class="badge ' + m[0] + '">' + A.icon(m[2]) + ' ' + m[1] + '</span>';
  }

  function siteUrl(ev) { return location.origin + '/#/site/' + (ev ? ev.slug : ''); }
  function guestLink(ev, token) { return location.origin + '/#/site/' + ev.slug + '?token=' + encodeURIComponent(token); }

  function pageHead(title, sub, actions) {
    return '<div class="page-head"><div class="page-head-txt"><h1 class="page-title">' + title + '</h1>' +
      (sub ? '<p class="page-sub">' + sub + '</p>' : '') + '</div>' +
      (actions ? '<div class="page-actions">' + actions + '</div>' : '') + '</div>';
  }

  function skel(w, h) {
    return '<div class="skeleton" style="width:' + w + ';height:' + h + '"></div>';
  }

  function errorCard(msg) {
    return '<div class="empty" style="padding:50px 20px"><div class="empty-ic">' + A.icon('alert') + '</div>' +
      '<h4>Something went wrong</h4><p>' + A.esc(msg || 'Could not load data.') + '</p>' +
      '<button class="btn btn-outline" onclick="App.rerender()">Try again</button></div>';
  }

  function greeting() {
    var h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  function firstName() {
    var n = (A.state.user && A.state.user.name) || '';
    return n.trim().split(/\s+/)[0] || 'there';
  }

  function copyText(text, okMsg) {
    function done() { A.toast(okMsg || 'Copied to clipboard'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else fallback();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { A.toast('Copy failed', 'error'); }
      ta.remove();
    }
  }

  function field(label, inner, hint) {
    return '<div class="field"><label class="label">' + label + '</label>' + inner +
      (hint ? '<span class="hint">' + hint + '</span>' : '') + '</div>';
  }

  function switchRow(id, label, checked, hint) {
    return '<div class="set-switch-row"><label class="switch"><input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + '><span class="track"></span></label>' +
      '<div><div class="set-switch-label">' + label + '</div>' +
      (hint ? '<div class="hint">' + hint + '</div>' : '') + '</div></div>';
  }

  var TIMEZONES = ['Asia/Dubai', 'Asia/Riyadh', 'Asia/Kolkata', 'Europe/London', 'Europe/Paris',
    'Europe/Berlin', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Australia/Sydney', 'UTC'];

  function tzOptions(sel) {
    return TIMEZONES.map(function (tz) {
      return '<option value="' + tz + '"' + (tz === sel ? ' selected' : '') + '>' + tz.replace('_', ' ') + '</option>';
    }).join('');
  }

  function applyEventUpdate(ev) {
    A.state.currentEvent = ev;
    A.state.events.forEach(function (e, i) {
      if (e.id === ev.id) A.state.events[i] = Object.assign({}, e, ev);
    });
  }

  /* ============================================================
     DASHBOARD VIEW
     ============================================================ */

  var NAV = [
    ['overview', 'Overview', 'home'],
    ['website', 'Website', 'layout'],
    ['guests', 'Guests', 'users'],
    ['rsvp', 'RSVP Form', 'mail-check'],
    ['subevents', 'Sub-Events', 'calendar-days'],
    ['invitations', 'Invitations', 'send'],
    ['payments', 'Payments', 'credit-card'],
    ['analytics', 'Analytics', 'bar-chart'],
    ['settings', 'Settings', 'settings']
  ];

  var NOTIFS = [];

  function shell(activeTab, mainHtml) {
    var ev = A.state.currentEvent;
    var evName = ev ? ev.name : 'Loading…';
    var evCount = ev && ev.guestCount != null ? ev.guestCount : '';
    return '' +
      '<div class="view dash-view">' +
        '<header class="app-topbar">' +
          '<a href="#/" class="tb-logo" aria-label="Online RSVP home"><span class="brand-mark">' + A.icon('heart') + '</span><span class="tb-logo-txt">Online RSVP</span></a>' +
          '<div class="dropdown">' +
            '<button class="btn btn-outline tb-ev" data-dd aria-label="Switch event">' +
              '<span class="tb-ev-name">' + A.esc(evName) + '</span>' +
              (evCount !== '' ? '<span class="badge badge-neutral tb-ev-count">' + evCount + ' ' + A.plural(Number(evCount) || 0, 'guest') + '</span>' : '') +
              A.icon('chevron-down') +
            '</button>' +
            '<div class="dropdown-menu">' +
              '<div class="dropdown-label">Your events</div>' +
              A.state.events.map(function (e) {
                return '<button class="dropdown-item' + (ev && e.id === ev.id ? ' active' : '') + '" data-ev="' + e.id + '">' +
                  '<span class="dot" style="background:' + (e.status === 'published' ? 'var(--sage)' : 'var(--amber)') + '"></span>' +
                  '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + A.esc(e.name) + '</span>' +
                  (e.guestCount != null ? '<span class="tiny muted">' + e.guestCount + '</span>' : '') + '</button>';
              }).join('') +
              '<div class="dropdown-sep"></div>' +
              '<button class="dropdown-item" data-new-ev>' + A.icon('plus') + ' New event</button>' +
            '</div>' +
          '</div>' +
          '<div style="flex:1"></div>' +
          '<div class="dropdown">' +
            '<button class="icon-btn tb-bell" data-dd aria-label="Notifications">' + A.icon('bell') + '<span class="bell-dot" data-bell-dot hidden></span></button>' +
            '<div class="dropdown-menu bell-menu">' +
              '<div class="bell-head"><span class="dropdown-label" style="padding:0">Notifications</span>' +
              '<button class="btn btn-ghost btn-sm" data-mark-read>Mark all read</button></div>' +
              '<div data-bell-list><div class="bell-loading small muted">Loading…</div></div>' +
            '</div>' +
          '</div>' +
          '<div class="dropdown">' +
            '<button class="tb-av-btn" data-dd aria-label="Account menu">' +
              A.avatarHtml(A.state.user.name, 'sm') +
              '<span class="tb-av-name">' + A.esc(firstName()) + '</span>' + A.icon('chevron-down') +
            '</button>' +
            '<div class="dropdown-menu">' +
              '<div class="dropdown-label">' + A.esc(A.state.user.name) + ' · ' + A.esc(A.state.user.email) + '</div>' +
              (ev ? '<button class="dropdown-item" data-view-site>' + A.icon('globe') + ' View public site</button>' : '') +
              (A.state.user.role === 'admin' ? '<button class="dropdown-item" data-nav-admin>' + A.icon('shield-check') + ' Platform admin</button>' : '') +
              '<div class="dropdown-sep"></div>' +
              '<button class="dropdown-item danger" data-logout>' + A.icon('log-out') + ' Log out</button>' +
            '</div>' +
          '</div>' +
        '</header>' +
        '<div class="dash-layout">' +
          '<aside class="dash-sidebar">' +
            '<nav class="dash-nav" aria-label="Dashboard sections">' +
              NAV.map(function (n) {
                return '<button class="dash-nav-item' + (activeTab === n[0] ? ' active' : '') + '" data-nav="' + n[0] + '">' +
                  A.icon(n[2]) + '<span>' + n[1] + '</span></button>';
              }).join('') +
            '</nav>' +
            (ev ?
              '<div class="dash-urlcard">' +
                '<div class="tiny muted" style="font-weight:700;letter-spacing:.05em;text-transform:uppercase">Public URL</div>' +
                '<div class="dash-url tiny" data-url-text>' + A.esc((ev.slug || 'event') + '.onlinersvp.com') + '</div>' +
                '<div class="dash-url-actions">' +
                  '<button class="icon-btn sm" data-copy-url aria-label="Copy public link" title="Copy link">' + A.icon('copy') + '</button>' +
                  '<button class="icon-btn sm" data-open-site aria-label="Open public site" title="Open site">' + A.icon('external-link') + '</button>' +
                '</div>' +
              '</div>' : '') +
          '</aside>' +
          '<main class="dash-main" id="dash-main">' + mainHtml + '</main>' +
        '</div>' +
        '<nav class="dash-bottomnav" aria-label="Mobile navigation">' +
          [['overview', 'Home', 'home'], ['guests', 'Guests', 'users'], ['rsvp', 'RSVP', 'mail-check'], ['invitations', 'Invites', 'send']].map(function (n) {
            return '<button class="bn-item' + (activeTab === n[0] ? ' active' : '') + '" data-nav="' + n[0] + '">' + A.icon(n[2]) + '<span>' + n[1] + '</span></button>';
          }).join('') +
          '<button class="bn-item" data-more>' + A.icon('ellipsis') + '<span>More</span></button>' +
        '</nav>' +
      '</div>';
  }

  function guardView(iconName, title, body, btnHtml) {
    return '<div class="view"><div class="view-body" style="display:flex;align-items:center;justify-content:center;padding:40px 20px">' +
      '<div class="empty" style="max-width:420px"><div class="empty-ic">' + A.icon(iconName) + '</div>' +
      '<h4>' + title + '</h4><p>' + body + '</p>' + (btnHtml || '') + '</div></div></div>';
  }

  function bindShell() {
    A.qsa('[data-nav]').forEach(function (b) {
      b.addEventListener('click', function () { A.navigate('#/app/' + b.getAttribute('data-nav')); });
    });
    A.qsa('[data-ev]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-ev');
        if (A.state.currentEvent && A.state.currentEvent.id === id) return;
        A.toast('Switching event…', 'info');
        A.api('/api/events/' + id).then(function (res) {
          A.state.currentEvent = res.event;
          A.rerender();
        }).catch(function (err) { A.toast(err.message || 'Could not open event', 'error'); });
      });
    });
    var newEv = A.qs('[data-new-ev]');
    if (newEv) newEv.addEventListener('click', function () { A.navigate('#/create'); });

    var vs = A.qs('[data-view-site]');
    if (vs) vs.addEventListener('click', function () { A.navigate('#/site/' + A.state.currentEvent.slug); });
    var ad = A.qs('[data-nav-admin]');
    if (ad) ad.addEventListener('click', function () { A.navigate('#/admin'); });
    var lo = A.qs('[data-logout]');
    if (lo) lo.addEventListener('click', function () {
      A.api('/api/auth/logout', { method: 'POST' }).catch(function () { }).then(function () {
        A.state.user = null; A.state.events = []; A.state.currentEvent = null;
        A.toast('Signed out', 'info');
        A.navigate('#/');
      });
    });

    var cu = A.qs('[data-copy-url]');
    if (cu) cu.addEventListener('click', function () {
      copyText(siteUrl(A.state.currentEvent), 'Public link copied');
    });
    var os = A.qs('[data-open-site]');
    if (os) os.addEventListener('click', function () { A.navigate('#/site/' + A.state.currentEvent.slug); });

    var mr = A.qs('[data-mark-read]');
    if (mr) mr.addEventListener('click', function () {
      A.api('/api/notifications', { method: 'PATCH' }).then(function () {
        NOTIFS.forEach(function (n) { n.read = true; });
        renderBell();
      }).catch(function () { });
    });

    var more = A.qs('[data-more]');
    if (more) more.addEventListener('click', function () {
      var current = (location.hash.match(/#\/app\/(\w+)/) || [])[1] || 'overview';
      var rest = NAV.filter(function (n) {
        return ['overview', 'guests', 'rsvp', 'invitations'].indexOf(n[0]) === -1;
      });
      A.modal.open({
        title: 'More sections',
        body: '<div class="more-grid">' + rest.map(function (n) {
          return '<button class="more-item' + (current === n[0] ? ' active' : '') + '" data-more-nav="' + n[0] + '">' +
            A.icon(n[2]) + '<span>' + n[1] + '</span>' + A.icon('chevron-right') + '</button>';
        }).join('') + '</div>'
      });
      A.qsa('[data-more-nav]').forEach(function (b) {
        b.addEventListener('click', function () { A.modal.close(); A.navigate('#/app/' + b.getAttribute('data-more-nav')); });
      });
    });

    loadNotifications();
  }

  function loadNotifications() {
    A.api('/api/notifications').then(function (res) {
      NOTIFS = res.notifications || [];
      renderBell();
    }).catch(function () { });
  }

  function renderBell() {
    var dot = A.qs('[data-bell-dot]');
    var list = A.qs('[data-bell-list]');
    var unread = NOTIFS.filter(function (n) { return !n.read; }).length;
    if (dot) dot.hidden = unread === 0;
    if (!list) return;
    if (!NOTIFS.length) {
      list.innerHTML = '<div class="bell-empty small muted">' + A.icon('inbox') + ' No notifications yet</div>';
      return;
    }
    list.innerHTML = NOTIFS.map(function (n) {
      return '<div class="notif-item' + (n.read ? '' : ' unread') + '">' +
        '<div class="notif-title">' + A.esc(n.title) + '</div>' +
        (n.body ? '<div class="notif-body">' + A.esc(n.body) + '</div>' : '') +
        '<div class="tiny muted">' + A.timeAgo(n.createdAt) + '</div></div>';
    }).join('');
  }

  /* ---------------- boot + tab loading ---------------- */

  function dashRender(params) {
    var t = params[0] || 'overview';
    if (!A.state.user) {
      return guardView('lock', 'Please sign in', 'Sign in to manage your events, guests and RSVPs.',
        '<button class="btn btn-accent" onclick="App.navigate(\'#/auth\')">Sign in</button>');
    }
    if (!A.state.events.length) {
      return guardView('sparkles', 'Create your first event', 'You have no events yet — create your first beautiful event website in minutes.',
        '<button class="btn btn-accent" onclick="App.navigate(\'#/create\')">Create your first event</button>');
    }
    return shell(t,
      '<div class="tab-skel">' +
        skel('40%', 30) + skel('60%', 14) +
        '<div class="stat-grid" style="margin-top:22px">' + skel('100%', 96) + skel('100%', 96) + skel('100%', 96) + skel('100%', 96) + '</div>' +
        '<div class="card card-pad" style="margin-top:16px">' + skel('100%', 180) + '</div>' +
      '</div>');
  }

  function dashMount(params) {
    var t = params[0] || 'overview';
    if (!A.state.user || !A.state.events.length) return;
    bindShell();
    var main = A.qs('#dash-main');
    if (!main) return;

    function go() {
      if (TABS[t]) TABS[t].bind(main);
      else main.innerHTML = errorCard('Unknown tab: ' + t);
    }

    if (!A.state.currentEvent) {
      A.state.currentEvent = A.state.events[0];
      A.api('/api/events/' + A.state.currentEvent.id).then(function (res) {
        A.state.currentEvent = res.event;
        refreshTopbarEvent();
        go();
      }).catch(function (err) {
        main.innerHTML = errorCard(err.message);
      });
    } else {
      go();
    }
  }

  function refreshTopbarEvent() {
    var ev = A.state.currentEvent;
    if (!ev) return;
    var nameEl = A.qs('.tb-ev-name');
    if (nameEl) nameEl.textContent = ev.name;
    var btn = A.qs('.tb-ev');
    if (btn) {
      var old = A.qs('.tb-ev-count', btn);
      if (old) old.remove();
      if (ev.guestCount != null) {
        btn.insertAdjacentHTML('afterbegin',
          '<span class="badge badge-neutral tb-ev-count">' + ev.guestCount + ' ' + A.plural(ev.guestCount, 'guest') + '</span>');
      }
    }
    var url = A.qs('[data-url-text]');
    if (url) url.textContent = (ev.slug || 'event') + '.onlinersvp.com';
  }

  /* ============================================================
     TAB: OVERVIEW
     ============================================================ */

  function overviewBind(main) {
    var ev = A.state.currentEvent;
    Promise.all([
      A.api('/api/events/' + ev.id + '/analytics'),
      A.api('/api/events/' + ev.id + '/guests')
    ]).then(function (rs) {
      var stats = rs[0].stats;
      var guests = rs[1].guests || [];
      var recent = guests.filter(function (g) { return g.respondedAt; })
        .sort(function (a, b) { return new Date(b.respondedAt) - new Date(a.respondedAt); }).slice(0, 5);
      var days = A.daysUntil(ev.eventDate);
      var published = ev.status === 'published';

      main.innerHTML =
        pageHead(
          greeting() + ', ' + A.esc(firstName()),
          '<span class="badge ' + (published ? 'badge-green' : 'badge-amber') + '">' +
            '<span class="dot" style="background:' + (published ? 'var(--sage)' : 'var(--amber)') + '"></span> ' +
            (published ? 'Published' : (ev.status === 'paused' ? 'Paused' : 'Draft')) + '</span>' +
            ' &nbsp;·&nbsp; ' + A.esc(ev.name) + ' is <strong>' + days + ' ' + A.plural(days, 'day') + '</strong> away',
          '<button class="btn btn-outline" data-ov-view>' + A.icon('eye') + ' View Event</button>' +
          '<button class="btn btn-accent" data-ov-edit>' + A.icon('pencil') + ' Edit Website</button>'
        ) +
        '<div class="stat-grid">' +
          statCard('Total Guests', stats.totalGuests, 'var(--primary)', 'users') +
          statCard('Attending', stats.attending, STATUS_COLORS.attending, 'check') +
          statCard('Pending', stats.pending, STATUS_COLORS.pending, 'clock') +
          statCard('Declined', stats.declined, STATUS_COLORS.declined, 'x') +
        '</div>' +
        '<div class="ov-grid">' +
          '<div class="card card-pad"><div class="card-title">RSVPs — last 30 days</div>' +
            '<div class="ov-rate-row"><div class="stat-label">RSVP rate</div>' +
            '<div class="small" style="font-weight:700">' + stats.rsvpRate + '%</div></div>' +
            '<div class="progress" style="margin-bottom:18px"><span style="width:' + stats.rsvpRate + '%;background:var(--accent)"></span></div>' +
            '<div class="ov-chart" data-ov-chart></div></div>' +
          '<div class="card card-pad"><div class="card-title">Recent RSVPs</div>' +
            (recent.length ? '<div class="recent-list">' + recent.map(function (g) {
              return '<div class="recent-item">' + A.avatarHtml(g.name, 'sm') +
                '<div style="flex:1;min-width:0"><div class="recent-name">' + A.esc(g.name) + '</div>' +
                '<div class="tiny muted">' + (g.partySize || 1) + ' ' + A.plural(g.partySize || 1, 'guest') + '</div></div>' +
                statusBadge(g.status) +
                '<div class="tiny muted" style="min-width:56px;text-align:right">' + A.timeAgo(g.respondedAt) + '</div></div>';
            }).join('') + '</div>' :
            '<div class="empty" style="padding:24px 10px"><div class="empty-ic">' + A.icon('inbox') + '</div><p class="small">No RSVPs yet</p></div>') +
          '</div>' +
        '</div>';

      var chart = A.qs('[data-ov-chart]', main);
      if (chart) {
        chart.style.height = '190px';
        A.chartArea(chart, stats.trend, '#9A7B5B');
      }
      var vv = A.qs('[data-ov-view]', main);
      if (vv) vv.addEventListener('click', function () { A.navigate('#/site/' + ev.slug); });
      var ve = A.qs('[data-ov-edit]', main);
      if (ve) ve.addEventListener('click', function () { A.navigate('#/builder'); });
    }).catch(function (err) { main.innerHTML = errorCard(err.message); });
  }

  function statCard(label, value, color, icon) {
    return '<div class="card card-pad stat-card">' +
      '<div class="stat-label"><span class="dot" style="background:' + color + '"></span> ' + label + '</div>' +
      '<div class="stat-value" style="color:' + color + '">' + value + '</div>' +
      '<div class="stat-sub">' + A.icon(icon) + ' ' + label.toLowerCase() + '</div></div>';
  }

  /* ============================================================
     TAB: WEBSITE
     ============================================================ */

  function websiteBind(main) {
    var ev = A.state.currentEvent;
    var published = ev.status === 'published';
    main.innerHTML =
      pageHead('Website', 'Design, preview and publish your event website.',
        (published
          ? '<button class="btn btn-outline" data-ws-pub>' + A.icon('eye-off') + ' Unpublish</button>'
          : '<button class="btn btn-accent" data-ws-pub>' + A.icon('upload') + ' Publish</button>')) +
      '<div class="ws-grid">' +
        '<div class="card card-pad">' +
          '<div class="ws-preview">' + A.miniPreview(ev.theme, ev.sections) + '</div>' +
          '<div class="ws-preview-actions">' +
            '<button class="btn btn-accent" data-ws-builder>' + A.icon('pencil') + ' Open Website Builder</button>' +
            '<button class="btn btn-outline" data-ws-live>' + A.icon('external-link') + ' View live site</button>' +
          '</div>' +
        '</div>' +
        '<div class="ws-side">' +
          '<div class="card card-pad">' +
            '<div class="card-title">Status</div>' +
            '<p class="small muted" style="margin:8px 0 12px">Your site is currently <strong>' + (published ? 'live' : 'a draft') + '</strong>' +
            (published ? ' — anyone with the link can view it and RSVP.' : '. Publish it to share with guests.') + '</p>' +
            '<div class="ws-url-row"><span class="tiny muted">' + A.esc((ev.slug || 'event') + '.onlinersvp.com') + '</span>' +
            '<button class="icon-btn sm" data-ws-copy aria-label="Copy site link">' + A.icon('copy') + '</button></div>' +
            '<span class="badge ' + (published ? 'badge-green' : 'badge-neutral') + '">' +
              (published ? 'check Published' : 'file Draft') + '</span>' +
          '</div>' +
          '<div class="card card-pad">' +
            '<div class="card-title">Sections</div>' +
            '<p class="small muted" style="margin:8px 0">' + (ev.sections || []).filter(function (s) { return s.visible !== false; }).length +
            ' visible sections on your page.</p>' +
            '<div class="ws-sec-list">' + (ev.sections || []).slice(0, 8).map(function (s) {
              var def = A.getSectionDef(s.type);
              return '<div class="ws-sec-item"><span class="dot" style="background:' + (s.visible !== false ? 'var(--sage)' : 'var(--border)') + '"></span>' +
                A.esc(def ? def.label : s.type) + '</div>';
            }).join('') + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    var pub = A.qs('[data-ws-pub]', main);
    if (pub) pub.addEventListener('click', function () {
      var action = published ? 'unpublish' : 'publish';
      pub.disabled = true;
      A.api('/api/events/' + ev.id + '/publish', { body: { action: action } }).then(function (res) {
        applyEventUpdate(res.event);
        A.toast(action === 'publish' ? 'Event published' : 'Event unpublished');
        websiteBind(main);
      }).catch(function (err) { pub.disabled = false; A.toast(err.message || 'Failed', 'error'); });
    });
    var bld = A.qs('[data-ws-builder]', main);
    if (bld) bld.addEventListener('click', function () { A.navigate('#/builder'); });
    var live = A.qs('[data-ws-live]', main);
    if (live) live.addEventListener('click', function () { A.navigate('#/site/' + ev.slug); });
    var cp = A.qs('[data-ws-copy]', main);
    if (cp) cp.addEventListener('click', function () { copyText(siteUrl(ev), 'Public link copied'); });
  }

  /* ============================================================
     TAB: GUESTS
     ============================================================ */

  var G = { all: [], groups: [], q: '', group: '', status: '', sel: {} };

  function guestsHtml() {
    return '' +
      pageHead('Guests', 'Manage your guest list, groups and invitations.',
        '<button class="btn btn-outline" data-g-import>' + A.icon('upload') + ' Import CSV</button>' +
        '<button class="btn btn-outline" data-g-export>' + A.icon('download') + ' Export CSV</button>' +
        '<button class="btn btn-outline" data-g-groups>' + A.icon('users') + ' Manage Groups</button>' +
        '<button class="btn btn-accent" data-g-add>' + A.icon('user-plus') + ' Add Guest</button>') +
      '<input type="file" accept=".csv,text/csv" data-g-file hidden>' +
      '<div class="g-toolbar">' +
        '<div class="input-wrap g-search">' + A.icon('search') +
          '<input class="input" data-g-q placeholder="Search name or email…" value="' + A.esc(G.q) + '" aria-label="Search guests"></div>' +
        '<select class="select" data-g-group aria-label="Filter by group"><option value="">All groups</option></select>' +
        '<select class="select" data-g-status aria-label="Filter by status">' +
          '<option value="">All statuses</option>' +
          '<option value="attending"' + (G.status === 'attending' ? ' selected' : '') + '>Confirmed</option>' +
          '<option value="pending"' + (G.status === 'pending' ? ' selected' : '') + '>Pending</option>' +
          '<option value="declined"' + (G.status === 'declined' ? ' selected' : '') + '>Declined</option>' +
        '</select>' +
        '<span class="small muted" style="margin-left:auto" data-g-count></span>' +
      '</div>' +
      '<div data-g-bulk></div>' +
      '<div class="table-wrap g-wrap" data-g-wrap>' +
        '<table class="table g-table">' +
          '<thead><tr>' +
            '<th style="width:36px"><input type="checkbox" data-g-all aria-label="Select all guests"></th>' +
            '<th>Guest</th><th>Group</th><th>Status</th><th>Party</th><th>Invited</th><th>Responded</th><th style="width:44px"></th>' +
          '</tr></thead>' +
          '<tbody data-g-tbody><tr><td colspan="8">' + skel('100%', 240) + '</td></tr></tbody>' +
        '</table>' +
      '</div>';
  }

  function guestsBind(main) {
    var ev = A.state.currentEvent;
    Promise.all([
      A.api('/api/events/' + ev.id + '/guests'),
      A.api('/api/events/' + ev.id + '/groups')
    ]).then(function (rs) {
      G.all = rs[0].guests || [];
      G.groups = rs[1].groups || [];
      G.sel = {};
      main.innerHTML = guestsHtml();
      wireGuests(main);
      renderGuestRows();
    }).catch(function (err) { main.innerHTML = errorCard(err.message); });
  }

  function refreshGuests() {
    var ev = A.state.currentEvent;
    return Promise.all([
      A.api('/api/events/' + ev.id + '/guests'),
      A.api('/api/events/' + ev.id + '/groups')
    ]).then(function (rs) {
      G.all = rs[0].guests || [];
      G.groups = rs[1].groups || [];
      fillGroupSelect();
      renderGuestRows();
    });
  }

  function fillGroupSelect() {
    var sel = A.qs('[data-g-group]');
    if (!sel) return;
    var cur = G.group;
    sel.innerHTML = '<option value="">All groups</option>' + G.groups.map(function (gr) {
      return '<option value="' + gr.id + '">' + A.esc(gr.name) + ' (' + (gr.guestCount || 0) + ')</option>';
    }).join('');
    sel.value = cur;
    if (sel.value !== cur) { G.group = ''; sel.value = ''; }
  }

  function groupDot(g) {
    if (!g.groupId) return '<span class="muted tiny">—</span>';
    var gr = null;
    for (var i = 0; i < G.groups.length; i++) if (G.groups[i].id === g.groupId) gr = G.groups[i];
    if (!gr && g.groupName) gr = { name: g.groupName, color: '#9A7B5B' };
    if (!gr) return '<span class="muted tiny">—</span>';
    return '<span style="display:inline-flex;align-items:center;gap:7px">' +
      '<span class="dot" style="background:' + A.esc(gr.color) + '"></span><span class="small">' + A.esc(gr.name) + '</span></span>';
  }

  function guestFiltered() {
    var q = G.q.trim().toLowerCase();
    return G.all.filter(function (g) {
      if (q && (g.name + ' ' + g.email).toLowerCase().indexOf(q) === -1) return false;
      if (G.group && (g.groupId || '') !== G.group) return false;
      if (G.status && g.status !== G.status) return false;
      return true;
    });
  }

  function rowMenu(g) {
    function item(act, ic, label) {
      return '<button class="dropdown-item" data-act="' + act + '" data-id="' + g.id + '">' + A.icon(ic) + ' ' + label + '</button>';
    }
    return '<div class="dropdown">' +
      '<button class="icon-btn sm" data-rowdd aria-label="Actions for ' + A.esc(g.name) + '">' + A.icon('more-vertical') + '</button>' +
      '<div class="dropdown-menu">' +
        item('profile', 'user', 'View profile') +
        item('edit', 'pencil', 'Edit') +
        item('copy', 'link', 'Copy RSVP link') +
        item('qr', 'qr-code', 'Show QR') +
        '<div class="dropdown-sep"></div>' +
        item('mark-attending', 'check', 'Mark as attending') +
        item('mark-pending', 'clock', 'Mark as pending') +
        item('mark-declined', 'x', 'Mark as declined') +
        '<div class="dropdown-sep"></div>' +
        item('remove', 'trash', 'Remove') +
      '</div></div>';
  }

  function renderGuestRows() {
    var tbody = A.qs('[data-g-tbody]');
    var countEl = A.qs('[data-g-count]');
    if (!tbody) return;
    var rows = guestFiltered();
    var selectedCount = Object.keys(G.sel).length;

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty" style="padding:34px 10px">' +
        '<div class="empty-ic">' + A.icon('users') + '</div><h4>No guests found</h4>' +
        '<p class="small">' + (G.all.length ? 'Try changing your search or filters.' : 'Add your first guest or import a CSV.') + '</p></div></td></tr>';
    } else {
      tbody.innerHTML = rows.map(function (g) {
        return '<tr data-guest-id="' + g.id + '">' +
          '<td><input type="checkbox" data-sel="' + g.id + '"' + (G.sel[g.id] ? ' checked' : '') + ' aria-label="Select ' + A.esc(g.name) + '"></td>' +
          '<td><div class="g-who">' + A.avatarHtml(g.name, 'sm') +
            '<div style="min-width:0"><div class="cell-strong g-name">' + A.esc(g.name) + '</div>' +
            '<div class="tiny muted g-email">' + A.esc(g.email || '—') + '</div></div></div></td>' +
          '<td>' + groupDot(g) + '</td>' +
          '<td>' + statusBadge(g.status) + '</td>' +
          '<td>' + g.partySize + '<span class="tiny muted">/' + g.maxParty + '</span></td>' +
          '<td>' + (g.invited ? '<span class="inv-yes">' + A.icon('check') + '</span>' : '<span class="inv-no">' + A.icon('mail') + '</span>') + '</td>' +
          '<td class="tiny muted">' + (g.respondedAt ? A.timeAgo(g.respondedAt) : '—') + '</td>' +
          '<td>' + rowMenu(g) + '</td></tr>';
      }).join('');
    }

    if (countEl) countEl.textContent = rows.length + ' of ' + G.all.length + ' ' + A.plural(G.all.length, 'guest');
    var all = A.qs('[data-g-all]');
    if (all) {
      var selRows = rows.filter(function (g) { return G.sel[g.id]; }).length;
      all.checked = rows.length > 0 && selRows === rows.length;
      all.indeterminate = selRows > 0 && selRows < rows.length;
    }
    updateBulkBar(selectedCount);
  }

  function updateBulkBar(n) {
    var bar = A.qs('[data-g-bulk]');
    if (!bar) return;
    if (!n) { bar.innerHTML = ''; return; }
    bar.innerHTML = '<div class="bulkbar">' +
      '<strong>' + n + ' selected</strong>' +
      '<select class="select select-sm" data-b-group aria-label="Assign to group">' +
        '<option value="">Assign to group…</option>' +
        G.groups.map(function (gr) { return '<option value="' + gr.id + '">' + A.esc(gr.name) + '</option>'; }).join('') +
      '</select>' +
      '<button class="btn btn-outline btn-sm" data-b-invite>' + A.icon('send') + ' Send invitation</button>' +
      '<button class="btn btn-danger-soft btn-sm" data-b-delete>' + A.icon('trash') + ' Delete selected</button>' +
      '<button class="btn btn-ghost btn-sm" data-b-clear>Clear</button>' +
    '</div>';
    var gs = A.qs('[data-b-group]', bar);
    if (gs) gs.addEventListener('change', function () {
      var gid = gs.value;
      if (!gid) return;
      var ids = Object.keys(G.sel);
      Promise.all(ids.map(function (id) {
        return A.api('/api/guests/' + id, { method: 'PATCH', body: { groupId: gid } });
      })).then(function () {
        G.sel = {};
        A.toast('Moved ' + ids.length + ' ' + A.plural(ids.length, 'guest') + ' to group');
        refreshGuests();
      }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
    });
    var inv = A.qs('[data-b-invite]', bar);
    if (inv) inv.addEventListener('click', function () {
      var ids = Object.keys(G.sel);
      Promise.all(ids.map(function (id) {
        return A.api('/api/guests/' + id, { method: 'PATCH', body: { invited: true } });
      })).then(function () {
        G.sel = {};
        A.toast('Invitation queued for ' + ids.length + ' ' + A.plural(ids.length, 'guest'));
        refreshGuests();
      }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
    });
    var del = A.qs('[data-b-delete]', bar);
    if (del) del.addEventListener('click', function () {
      var ids = Object.keys(G.sel);
      A.confirm({
        title: 'Delete guests',
        message: 'Remove <strong>' + ids.length + ' ' + A.plural(ids.length, 'guest') + '</strong> from your list? This cannot be undone.',
        okLabel: 'Delete', danger: true,
        onOk: function () {
          Promise.all(ids.map(function (id) {
            return A.api('/api/guests/' + id, { method: 'DELETE' });
          })).then(function () {
            G.sel = {};
            A.toast(ids.length + ' ' + A.plural(ids.length, 'guest') + ' removed');
            refreshGuests();
          }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
        }
      });
    });
    var clr = A.qs('[data-b-clear]', bar);
    if (clr) clr.addEventListener('click', function () { G.sel = {}; renderGuestRows(); });
  }

  function wireGuests(main) {
    var ev = A.state.currentEvent;
    var wrap = A.qs('[data-g-wrap]', main);
    var search = A.qs('[data-g-q]', main);
    var groupSel = A.qs('[data-g-group]', main);
    var statusSel = A.qs('[data-g-status]', main);
    var addBtn = A.qs('[data-g-add]', main);
    var impBtn = A.qs('[data-g-import]', main);
    var expBtn = A.qs('[data-g-export]', main);
    var grpBtn = A.qs('[data-g-groups]', main);
    var file = A.qs('[data-g-file]', main);
    var all = A.qs('[data-g-all]', main);

    fillGroupSelect();
    groupSel.value = G.group;
    if (groupSel.value !== G.group) { G.group = ''; }

    if (search) search.addEventListener('input', function () { G.q = search.value; renderGuestRows(); });
    if (groupSel) groupSel.addEventListener('change', function () { G.group = groupSel.value; renderGuestRows(); });
    if (statusSel) statusSel.addEventListener('change', function () { G.status = statusSel.value; renderGuestRows(); });
    if (addBtn) addBtn.addEventListener('click', function () { guestModal(null); });
    if (grpBtn) grpBtn.addEventListener('click', function () { groupsModal(); });
    if (impBtn && file) impBtn.addEventListener('click', function () { file.click(); });
    if (file) file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        file.value = '';
        try {
          var rows = A.parseCsv(String(reader.result || ''));
          if (rows.length < 2) { A.toast('CSV needs a header row and at least one guest', 'error'); return; }
          var head = rows[0].map(function (h) { return String(h).trim().toLowerCase(); });
          var iName = head.indexOf('name'), iEmail = head.indexOf('email'), iGroup = head.indexOf('group');
          if (iName === -1 || iEmail === -1) { A.toast('CSV must have "name" and "email" columns', 'error'); return; }
          var guests = [];
          for (var i = 1; i < rows.length; i++) {
            var r = rows[i];
            if (!r[iName] || !r[iEmail]) continue;
            guests.push({
              name: String(r[iName]).trim(),
              email: String(r[iEmail]).trim(),
              group: iGroup !== -1 && r[iGroup] ? String(r[iGroup]).trim() : undefined
            });
          }
          if (!guests.length) { A.toast('No valid guests found in the CSV', 'error'); return; }
          A.api('/api/events/' + ev.id + '/guests', { body: { guests: guests } }).then(function (res) {
            var n = res.guests ? res.guests.length : guests.length;
            A.toast('Imported ' + n + ' ' + A.plural(n, 'guest'));
            refreshGuests();
          }).catch(function (err) { A.toast(err.message || 'Import failed', 'error'); });
        } catch (e) {
          A.toast('Could not read that file', 'error');
        }
      };
      reader.readAsText(f);
    });
    if (expBtn) expBtn.addEventListener('click', function () {
      var rows = [['Name', 'Email', 'Group', 'Status', 'Party Size', 'Max Party', 'Meal', 'Dietary', 'Invited', 'Responded At']];
      guestFiltered().forEach(function (g) {
        rows.push([g.name, g.email, g.groupName || '', g.status, g.partySize, g.maxParty, g.meal || '', g.dietary || '',
          g.invited ? 'yes' : 'no', g.respondedAt || '']);
      });
      A.downloadCsv('guests-' + ev.slug + '.csv', rows);
      A.toast('Guest list exported');
    });
    if (all) all.addEventListener('change', function () {
      var rows = guestFiltered();
      rows.forEach(function (g) { if (all.checked) G.sel[g.id] = true; else delete G.sel[g.id]; });
      renderGuestRows();
    });

    /* delegated events for the whole table (large lists) */
    if (wrap) {
      wrap.addEventListener('change', function (e) {
        var cb = e.target.closest('[data-sel]');
        if (cb) {
          if (cb.checked) G.sel[cb.getAttribute('data-sel')] = true;
          else delete G.sel[cb.getAttribute('data-sel')];
          renderGuestRows();
        }
      });
      wrap.addEventListener('click', function (e) {
        var dd = e.target.closest('[data-rowdd]');
        if (dd) {
          e.stopPropagation();
          var menu = dd.parentElement.querySelector('.dropdown-menu');
          var wasOpen = menu.style.display === 'block';
          A.qsa('.dropdown-menu').forEach(function (m) { m.style.display = 'none'; });
          menu.style.display = wasOpen ? 'none' : 'block';
          return;
        }
        var item = e.target.closest('[data-act]');
        if (item) {
          var act = item.getAttribute('data-act');
          var id = item.getAttribute('data-id');
          var g = null;
          for (var i = 0; i < G.all.length; i++) if (G.all[i].id === id) g = G.all[i];
          if (g) guestAction(act, g);
        }
      });
    }
  }

  function guestAction(act, g) {
    var ev = A.state.currentEvent;
    if (act === 'profile') {
      A.modal.open({
        title: 'Guest profile',
        body:
          '<div class="prof-head">' + A.avatarHtml(g.name, 'lg') +
            '<div><div class="cell-strong" style="font-size:16px">' + A.esc(g.name) + '</div>' +
            '<div class="small muted">' + A.esc(g.email || 'No email') + '</div></div>' + statusBadge(g.status) + '</div>' +
          '<div class="prof-grid">' +
            profRow('Group', g.groupName || '—') +
            profRow('Party size', g.partySize + ' (max ' + g.maxParty + ')') +
            profRow('Meal choice', g.meal || '—') +
            profRow('Dietary', g.dietary || '—') +
            profRow('Invited', g.invited ? 'Yes' + (g.invitedAt ? ' · ' + A.timeAgo(g.invitedAt) : '') : 'No') +
            profRow('Responded', g.respondedAt ? A.fmtDate(g.respondedAt) : '—') +
            profRow('Notes', g.notes || '—') +
            profRow('RSVP link', '<span class="tiny" style="word-break:break-all">' + A.esc(guestLink(ev, g.token)) + '</span>') +
          '</div>',
        wide: true,
        footer:
          '<button class="btn btn-outline" data-p-msg>' + A.icon('message') + ' Send Message</button>' +
          '<button class="btn btn-accent" data-p-edit>' + A.icon('pencil') + ' Edit</button>',
        onMount: function (panel) {
          panel.querySelector('[data-p-msg]').addEventListener('click', function () {
            App.modal.close();
            A.toast('Message sent to ' + g.name);
          });
          panel.querySelector('[data-p-edit]').addEventListener('click', function () {
            guestModal(g);
          });
        }
      });
    } else if (act === 'edit') {
      guestModal(g);
    } else if (act === 'copy') {
      copyText(guestLink(ev, g.token), 'Personalized link copied');
    } else if (act === 'qr') {
      qrModal(g);
    } else if (act === 'remove') {
      A.confirm({
        title: 'Remove guest',
        message: 'Remove <strong>' + A.esc(g.name) + '</strong> from your guest list? This cannot be undone.',
        okLabel: 'Remove', danger: true,
        onOk: function () {
          A.api('/api/guests/' + g.id, { method: 'DELETE' }).then(function () {
            A.toast(g.name + ' removed');
            refreshGuests();
          }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
        }
      });
    } else if (act.indexOf('mark-') === 0) {
      var st = act.replace('mark-', '');
      A.api('/api/guests/' + g.id, { method: 'PATCH', body: { status: st } }).then(function () {
        A.toast(g.name + ' marked as ' + st);
        refreshGuests();
      }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
    }
  }

  function profRow(label, value) {
    return '<div><div class="stat-label">' + label + '</div><div class="small">' + value + '</div></div>';
  }

  function qrModal(g) {
    var ev = A.state.currentEvent;
    var link = guestLink(ev, g.token);
    var qrSrc = '/api/qr?text=' + encodeURIComponent(link) + '&dark=%239A7B5B';
    A.modal.open({
      title: 'RSVP QR — ' + A.esc(g.name),
      body:
        '<div class="qr-wrap"><img src="' + qrSrc + '" alt="RSVP QR code for ' + A.esc(g.name) + '" width="220" height="220"></div>' +
        '<p class="small muted center" style="margin-top:10px">Guests scan to open their personalized RSVP page.</p>' +
        '<p class="tiny muted center" style="word-break:break-all">' + A.esc(link) + '</p>',
        footer: '<button class="btn btn-accent btn-block" data-qr-dl>' + A.icon('download') + ' Download PNG</button>',
      onMount: function (panel) {
        panel.querySelector('[data-qr-dl]').addEventListener('click', function () {
          downloadQrPng(link, 'qr-' + (g.name || 'guest').toLowerCase().replace(/\s+/g, '-') + '.png');
        });
      }
    });
  }

  function downloadQrPng(text, filename) {
    var qrUrl = '/api/qr?text=' + encodeURIComponent(text) + '&dark=%239A7B5B';
    fetch(qrUrl).then(function (r) { return r.text(); }).then(function (svg) {
      var blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var img = new Image();
      img.onload = function () {
        try {
          var c = document.createElement('canvas');
          c.width = 512; c.height = 512;
          var ctx = c.getContext('2d');
          ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 512, 512);
          ctx.drawImage(img, 0, 0, 512, 512);
          URL.revokeObjectURL(url);
          c.toBlob(function (pb) {
            var a = document.createElement('a');
            a.href = URL.createObjectURL(pb); a.download = filename; a.click();
            setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
            A.toast('QR code downloaded');
          }, 'image/png');
        } catch (e) { fallbackSvg(qrUrl, filename); }
      };
      img.onerror = function () { fallbackSvg(qrUrl, filename); };
      img.src = url;
    }).catch(function () {
      A.toast('Could not generate QR', 'error');
    });
    function fallbackSvg(u, fn) {
      var a = document.createElement('a');
      a.href = u; a.download = fn.replace(/\.png$/, '.svg'); a.click();
    }
  }

  function guestModal(existing) {
    var ev = A.state.currentEvent;
    var g = existing || {};
    var isEdit = !!existing;
    A.modal.open({
      title: isEdit ? 'Edit guest' : 'Add guest',
      wide: true,
      body:
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Name <span class="req">*</span></label><input class="input" id="gf-name" value="' + A.esc(g.name || '') + '" placeholder="Jane Doe"></div>' +
          '<div class="field"><label class="label">Email <span class="req">*</span></label><input class="input" id="gf-email" type="email" value="' + A.esc(g.email || '') + '" placeholder="jane@example.com"></div>' +
        '</div>' +
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Group</label><select class="select" id="gf-group">' +
            '<option value="">No group</option>' +
            G.groups.map(function (gr) {
              return '<option value="' + gr.id + '"' + (g.groupId === gr.id ? ' selected' : '') + '>' + A.esc(gr.name) + '</option>';
            }).join('') +
          '</select></div>' +
          '<div class="field"><label class="label">Status</label><select class="select" id="gf-status">' +
            ['pending', 'attending', 'declined'].map(function (s) {
              return '<option value="' + s + '"' + ((g.status || 'pending') === s ? ' selected' : '') + '>' +
                s.charAt(0).toUpperCase() + s.slice(1) + '</option>';
            }).join('') +
          '</select></div>' +
        '</div>' +
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Party size</label><input class="input" id="gf-party" type="number" min="0" max="20" value="' + (g.partySize != null ? g.partySize : 1) + '"></div>' +
          '<div class="field"><label class="label">Max party</label><input class="input" id="gf-maxparty" type="number" min="1" max="20" value="' + (g.maxParty != null ? g.maxParty : 2) + '"></div>' +
        '</div>' +
        field('Notes', '<textarea class="textarea" id="gf-notes" placeholder="Allergies, plus-one details…">' + A.esc(g.notes || '') + '</textarea>'),
      footer:
        '<button class="btn btn-outline" data-gf-cancel>Cancel</button>' +
        '<button class="btn btn-accent" data-gf-save>' + (isEdit ? 'Save changes' : 'Add guest') + '</button>',
      onMount: function (panel) {
        panel.querySelector('[data-gf-cancel]').addEventListener('click', function () { App.modal.close(); });
        panel.querySelector('[data-gf-save]').addEventListener('click', function () {
          var name = panel.querySelector('#gf-name').value.trim();
          var email = panel.querySelector('#gf-email').value.trim();
          if (!name || !email) { A.toast('Name and email are required', 'error'); return; }
          var status = panel.querySelector('#gf-status').value;
          var partySize = Number(panel.querySelector('#gf-party').value) || 1;
          var payload = {
            name: name, email: email,
            groupId: panel.querySelector('#gf-group').value || null,
            maxParty: Number(panel.querySelector('#gf-maxparty').value) || 2,
            notes: panel.querySelector('#gf-notes').value.trim() || null
          };
          var btn = panel.querySelector('[data-gf-save]');
          btn.disabled = true;
          var p = isEdit
            ? A.api('/api/guests/' + g.id, { method: 'PATCH', body: payload })
            : A.api('/api/events/' + ev.id + '/guests', { body: payload });
          p.then(function (res) {
            var gid = isEdit ? g.id : (res.guest && res.guest.id);
            var extra = { status: status, partySize: partySize };
            var needsPatch = !isEdit && (status !== 'pending' || partySize !== 1);
            var finish = function () {
              App.modal.close();
              A.toast(isEdit ? 'Guest updated' : name + ' added');
              refreshGuests();
            };
            if (needsPatch && gid) {
              A.api('/api/guests/' + gid, { method: 'PATCH', body: extra }).then(finish, finish);
            } else finish();
          }).catch(function (err) {
            btn.disabled = false;
            A.toast(err.message || 'Could not save guest', 'error');
          });
        });
      }
    });
  }

  function groupsModal() {
    function body() {
      return '<div class="gm-list">' +
        (G.groups.length ? G.groups.map(function (gr) {
          return '<div class="gm-row" data-gid="' + gr.id + '">' +
            '<span class="dot" style="background:' + A.esc(gr.color) + ';width:12px;height:12px"></span>' +
            '<span class="gm-name cell-strong">' + A.esc(gr.name) + '</span>' +
            '<span class="tiny muted">' + (gr.guestCount || 0) + ' ' + A.plural(gr.guestCount || 0, 'guest') + '</span>' +
            '<button class="icon-btn sm" data-gm-edit aria-label="Edit group">' + A.icon('pencil') + '</button>' +
            '<button class="icon-btn sm" data-gm-del aria-label="Delete group">' + A.icon('trash') + '</button>' +
          '</div>';
        }).join('') : '<p class="small muted">No groups yet — create your first one below.</p>') +
        '</div>' +
        '<div class="gm-create">' +
          '<input class="input" id="gm-name" placeholder="New group name (e.g. Family)">' +
          '<input type="color" class="color-input" id="gm-color" value="#9A7B5B" aria-label="Group color">' +
          '<button class="btn btn-accent" data-gm-add>' + A.icon('plus') + ' Add</button>' +
        '</div>';
    }
    var panel = A.modal.open({
      title: 'Manage groups',
      body: body(),
      onMount: function (p) { wire(p); }
    });

    function reload() {
      refreshGuests().then(function () {
        A.qs('.modal-body', panel).innerHTML = body();
        wire(panel);
      });
    }
    function wire(p) {
      var add = p.querySelector('[data-gm-add]');
      if (add) add.addEventListener('click', function () {
        var name = p.querySelector('#gm-name').value.trim();
        if (!name) { A.toast('Group name is required', 'error'); return; }
        A.api('/api/events/' + A.state.currentEvent.id + '/groups', {
          body: { name: name, color: p.querySelector('#gm-color').value }
        }).then(function () { A.toast('Group created'); reload(); })
          .catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
      });
      A.qsa('[data-gm-edit]', p).forEach(function (b) {
        b.addEventListener('click', function () {
          var row = b.closest('[data-gid]');
          var gr = null;
          for (var i = 0; i < G.groups.length; i++) if (G.groups[i].id === row.getAttribute('data-gid')) gr = G.groups[i];
          if (!gr) return;
          row.innerHTML =
            '<input class="input input-sm" value="' + A.esc(gr.name) + '" data-gm-newname aria-label="Group name">' +
            '<input type="color" class="color-input" value="' + A.esc(gr.color) + '" data-gm-newcolor aria-label="Group color">' +
            '<button class="btn btn-accent btn-sm" data-gm-save>Save</button>' +
            '<button class="btn btn-ghost btn-sm" data-gm-cancel>Cancel</button>';
          row.querySelector('[data-gm-save]').addEventListener('click', function () {
            A.api('/api/groups/' + gr.id, {
              method: 'PATCH',
              body: { name: row.querySelector('[data-gm-newname]').value.trim(), color: row.querySelector('[data-gm-newcolor]').value }
            }).then(function () { A.toast('Group updated'); reload(); })
              .catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
          });
          row.querySelector('[data-gm-cancel]').addEventListener('click', function () { reload(); });
        });
      });
      A.qsa('[data-gm-del]', p).forEach(function (b) {
        b.addEventListener('click', function () {
          var row = b.closest('[data-gid]');
          var gr = null;
          for (var i = 0; i < G.groups.length; i++) if (G.groups[i].id === row.getAttribute('data-gid')) gr = G.groups[i];
          if (!gr) return;
          A.confirm({
            title: 'Delete group',
            message: 'Delete group <strong>' + A.esc(gr.name) + '</strong>? Guests in it will keep their RSVPs but lose the group.',
            okLabel: 'Delete', danger: true,
            onOk: function () {
              A.api('/api/groups/' + gr.id, { method: 'DELETE' }).then(function () {
                A.toast('Group deleted');
                reload();
              }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
            }
          });
        });
      });
    }
  }

  /* ============================================================
     TAB: RSVP FORM BUILDER
     ============================================================ */

  var R = { arr: [], dirty: false };

  var Q_TYPES = [
    ['yesno', 'Yes / No'], ['text', 'Text'], ['textarea', 'Paragraph'], ['number', 'Number'],
    ['select', 'Dropdown'], ['radio', 'Multiple choice'], ['checkbox', 'Checkboxes'], ['meal', 'Meal choice'], ['date', 'Date']
  ];
  var Q_ICONS = { yesno: 'check-circle', text: 'type', textarea: 'file', number: 'bar-chart', select: 'chevron-down', radio: 'check', checkbox: 'list-checks', meal: 'gift', date: 'calendar' };
  var MEAL_DEFAULTS = ['Chicken', 'Beef', 'Fish', 'Vegetarian'];

  function qTypeLabel(t) {
    for (var i = 0; i < Q_TYPES.length; i++) if (Q_TYPES[i][0] === t) return Q_TYPES[i][1];
    return t;
  }

  function rsvpBind(main) {
    var ev = A.state.currentEvent;
    A.api('/api/events/' + ev.id + '/questions').then(function (res) {
      R.arr = res.questions || [];
      R.dirty = false;
      main.innerHTML =
        pageHead('RSVP Form', 'Choose which questions guests answer when they RSVP.',
          '<span class="dirty-dot" data-r-dirty' + (R.dirty ? '' : ' hidden') + '>Unsaved changes</span>' +
          '<button class="btn btn-accent" data-r-save disabled>' + A.icon('save') + ' Save Changes</button>') +
        '<div class="rsvp-grid">' +
          '<div>' +
            '<div class="card card-pad">' +
              '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
                '<div class="card-title">Questions <span class="tiny muted" data-r-count></span></div>' +
                '<button class="btn btn-outline btn-sm" data-r-add>' + A.icon('plus') + ' Add question</button>' +
              '</div>' +
              '<div class="q-list" data-r-list></div>' +
            '</div>' +
          '</div>' +
          '<div class="rsvp-preview-col">' +
            '<div class="card card-pad pv-card" data-r-preview></div>' +
          '</div>' +
        '</div>';
      renderQList();
      renderPv();
      wireRsvp(main);
    }).catch(function (err) { main.innerHTML = errorCard(err.message); });
  }

  function wireRsvp(main) {
    var saveBtn = A.qs('[data-r-save]', main);
    var addBtn = A.qs('[data-r-add]', main);

    if (saveBtn) saveBtn.addEventListener('click', function () {
      var payload = R.arr.map(function (q) {
        return { label: q.label, type: q.type, required: !!q.required, options: q.options || [], showIfAttending: !!q.showIfAttending };
      });
      saveBtn.disabled = true;
      A.api('/api/events/' + A.state.currentEvent.id + '/questions', { method: 'PUT', body: { questions: payload } })
        .then(function (res) {
          R.arr = res.questions || [];
          R.dirty = false;
          markDirty();
          renderQList();
          renderPv();
          A.toast('RSVP form saved');
        })
        .catch(function (err) { saveBtn.disabled = false; A.toast(err.message || 'Save failed', 'error'); });
    });
    if (addBtn) addBtn.addEventListener('click', function () { questionModal(null); });

    var list = A.qs('[data-r-list]', main);
    if (list) list.addEventListener('click', function (e) {
      var item = e.target.closest('[data-qid]');
      if (!item) return;
      var idx = -1;
      for (var i = 0; i < R.arr.length; i++) if (R.arr[i].id === item.getAttribute('data-qid')) idx = i;
      if (idx === -1) return;
      var act = e.target.closest('[data-qact]');
      if (!act) return;
      var a = act.getAttribute('data-qact');
      if (a === 'up' && idx > 0) {
        var tmp = R.arr[idx - 1]; R.arr[idx - 1] = R.arr[idx]; R.arr[idx] = tmp;
        markDirty(); renderQList(); renderPv();
      } else if (a === 'down' && idx < R.arr.length - 1) {
        var t2 = R.arr[idx + 1]; R.arr[idx + 1] = R.arr[idx]; R.arr[idx] = t2;
        markDirty(); renderQList(); renderPv();
      } else if (a === 'edit') {
        questionModal(R.arr[idx]);
      } else if (a === 'del') {
        A.confirm({
          title: 'Delete question',
          message: 'Remove <strong>' + A.esc(R.arr[idx].label) + '</strong> from the RSVP form?',
          okLabel: 'Delete', danger: true,
          onOk: function () {
            R.arr.splice(idx, 1);
            markDirty(); renderQList(); renderPv();
          }
        });
      }
    });
  }

  function markDirty() {
    R.dirty = true;
    var dot = A.qs('[data-r-dirty]');
    var btn = A.qs('[data-r-save]');
    if (dot) dot.hidden = false;
    if (btn) btn.disabled = false;
  }

  function renderQList() {
    var list = A.qs('[data-r-list]');
    if (!list) return;
    var cnt = A.qs('[data-r-count]');
    if (cnt) cnt.textContent = '· ' + R.arr.length + ' ' + A.plural(R.arr.length, 'question');
    if (!R.arr.length) {
      list.innerHTML = '<div class="empty" style="padding:30px 10px"><div class="empty-ic">' + A.icon('list-checks') + '</div>' +
        '<h4>No questions yet</h4><p class="small">Add meal choices, dietary needs, song requests…</p></div>';
      return;
    }
    list.innerHTML = R.arr.map(function (q) {
      return '<div class="q-item" data-qid="' + q.id + '">' +
        '<span class="q-ic">' + A.icon(Q_ICONS[q.type] || 'type') + '</span>' +
        '<div class="q-main"><div class="q-label">' + A.esc(q.label) + (q.required ? ' <span class="req">*</span>' : '') + '</div>' +
          '<div class="q-meta"><span class="badge badge-neutral">' + A.esc(qTypeLabel(q.type)) + '</span>' +
          (q.showIfAttending ? '<span class="badge badge-accent">Only if attending</span>' : '') + '</div></div>' +
        '<div class="q-actions">' +
          '<button class="icon-btn sm" data-qact="up" aria-label="Move up"' + (R.arr[0] === q ? ' disabled' : '') + '>' + A.icon('arrow-up') + '</button>' +
          '<button class="icon-btn sm" data-qact="down" aria-label="Move down"' + (R.arr[R.arr.length - 1] === q ? ' disabled' : '') + '>' + A.icon('arrow-down') + '</button>' +
          '<button class="icon-btn sm" data-qact="edit" aria-label="Edit question">' + A.icon('pencil') + '</button>' +
          '<button class="icon-btn sm" data-qact="del" aria-label="Delete question">' + A.icon('trash') + '</button>' +
        '</div></div>';
    }).join('');
  }

  function renderPv() {
    var pv = A.qs('[data-r-preview]');
    if (!pv) return;
    pv.innerHTML =
      '<div class="pv-badge">' + A.icon('eye') + ' Live preview</div>' +
      '<div class="pv-title font-display">Will you attend?</div>' +
      '<label class="radio-row"><input type="radio" name="pv-attend" value="yes" checked> <span>Joyfully accept</span></label>' +
      '<label class="radio-row"><input type="radio" name="pv-attend" value="no"> <span>Regretfully decline</span></label>' +
      '<div data-pv-qs></div>' +
      '<div class="pv-party"><div class="label">Party size</div>' +
        '<div class="stepper"><button class="icon-btn sm" data-pv-minus aria-label="Fewer guests">' + A.icon('minus') + '</button>' +
        '<input class="input" type="number" value="1" min="1" max="10" data-pv-party aria-label="Party size">' +
        '<button class="icon-btn sm" data-pv-plus aria-label="More guests">' + A.icon('plus') + '</button></div></div>';

    function draw(attending) {
      var box = A.qs('[data-pv-qs]', pv);
      if (!box) return;
      var visible = R.arr.filter(function (q) { return !q.showIfAttending || attending; });
      box.innerHTML = visible.length ? visible.map(function (q) { return pvQuestion(q); }).join('') :
        '<p class="small muted" style="margin:14px 0">No additional questions.</p>';
      var chips = A.qsa('[data-mealchip]', box);
      chips.forEach(function (c) {
        c.addEventListener('click', function () { c.classList.toggle('active'); });
      });
    }
    draw(true);
    A.qsa('input[name="pv-attend"]', pv).forEach(function (r) {
      r.addEventListener('change', function () { draw(r.value === 'yes'); });
    });
    var partyInput = A.qs('[data-pv-party]', pv);
    var minus = A.qs('[data-pv-minus]', pv);
    var plus = A.qs('[data-pv-plus]', pv);
    if (minus) minus.addEventListener('click', function () { partyInput.value = Math.max(1, Number(partyInput.value) - 1); });
    if (plus) plus.addEventListener('click', function () { partyInput.value = Math.min(10, Number(partyInput.value) + 1); });
  }

  function pvQuestion(q) {
    var opts = (q.options && q.options.length ? q.options : ['Option 1', 'Option 2']);
    var head = '<div class="pv-q"><div class="label">' + A.esc(q.label) + (q.required ? ' <span class="req">*</span>' : '') + '</div>';
    var ctl = '';
    if (q.type === 'yesno') {
      ctl = '<label class="radio-row"><input type="radio" name="q-' + q.id + '"> <span>Yes</span></label>' +
        '<label class="radio-row"><input type="radio" name="q-' + q.id + '"> <span>No</span></label>';
    } else if (q.type === 'text') {
      ctl = '<input class="input" placeholder="Your answer">';
    } else if (q.type === 'textarea') {
      ctl = '<textarea class="textarea" placeholder="Your answer"></textarea>';
    } else if (q.type === 'number') {
      ctl = '<input class="input" type="number" placeholder="0">';
    } else if (q.type === 'select') {
      ctl = '<select class="select"><option value="">Choose…</option>' + opts.map(function (o) { return '<option>' + A.esc(o) + '</option>'; }).join('') + '</select>';
    } else if (q.type === 'radio') {
      ctl = opts.map(function (o) { return '<label class="radio-row"><input type="radio" name="q-' + q.id + '"> <span>' + A.esc(o) + '</span></label>'; }).join('');
    } else if (q.type === 'checkbox') {
      ctl = opts.map(function (o) { return '<label class="checkbox-row"><input type="checkbox"> <span>' + A.esc(o) + '</span></label>'; }).join('');
    } else if (q.type === 'meal') {
      ctl = '<div class="meal-chips">' + opts.map(function (o) { return '<button type="button" class="chip" data-mealchip>' + A.esc(o) + '</button>'; }).join('') + '</div>';
    } else if (q.type === 'date') {
      ctl = '<input class="input" type="date">';
    }
    return head + ctl + '</div>';
  }

  function questionModal(existing) {
    var q = existing ? {
      id: existing.id, label: existing.label, type: existing.type, required: existing.required,
      showIfAttending: existing.showIfAttending, options: (existing.options || []).slice()
    } : { id: 'tmp_' + Date.now(), label: '', type: 'text', required: false, showIfAttending: false, options: [] };
    var isEdit = !!existing;
    var needsOptions = ['select', 'radio', 'checkbox', 'meal'].indexOf(q.type) !== -1;

    A.modal.open({
      title: isEdit ? 'Edit question' : 'Add question',
      body:
        field('Question <span class="req">*</span>', '<input class="input" id="qf-label" value="' + A.esc(q.label) + '" placeholder="e.g. What meal would you like?">') +
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Answer type</label><select class="select" id="qf-type">' +
            Q_TYPES.map(function (t) { return '<option value="' + t[0] + '"' + (q.type === t[0] ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="field"><label class="label">Options</label>' +
            '<div id="qf-opts" style="display:flex;flex-direction:column;gap:8px;' + (needsOptions ? '' : 'display:none') + '">' +
              '<div data-qf-opt-rows style="display:flex;flex-direction:column;gap:8px"></div>' +
              '<button type="button" class="btn btn-outline btn-sm" data-qf-addopt>' + A.icon('plus') + ' Add option</button>' +
            '</div>' +
            '<span class="hint" data-qf-nopts' + (needsOptions ? ' hidden' : '') + '>This question type has no options.</span>' +
          '</div>' +
        '</div>' +
        switchRow('qf-req', 'Required', q.required, 'Guests must answer this question.') +
        switchRow('qf-cond', 'Only show if attending Yes', q.showIfAttending, 'Hide this question when guests decline.'),
      footer:
        '<button class="btn btn-outline" data-qf-cancel>Cancel</button>' +
        '<button class="btn btn-accent" data-qf-save>' + (isEdit ? 'Save question' : 'Add question') + '</button>',
      onMount: function (panel) {
        var rows = panel.querySelector('[data-qf-opt-rows]');
        function addRow(val) {
          var div = document.createElement('div');
          div.className = 'opt-row';
          div.innerHTML = '<input class="input" value="' + A.esc(val || '') + '" placeholder="Option label" aria-label="Option">' +
            '<button type="button" class="icon-btn sm" data-opt-del aria-label="Remove option">' + A.icon('x') + '</button>';
          div.querySelector('[data-opt-del]').addEventListener('click', function () { div.remove(); });
          rows.appendChild(div);
        }
        if (needsOptions) (q.options.length ? q.options : (q.type === 'meal' ? MEAL_DEFAULTS : [''])).forEach(addRow);

        panel.querySelector('#qf-type').addEventListener('change', function () {
          var t = panel.querySelector('#qf-type').value;
          var needs = ['select', 'radio', 'checkbox', 'meal'].indexOf(t) !== -1;
          panel.querySelector('#qf-opts').style.display = needs ? 'flex' : 'none';
          panel.querySelector('[data-qf-nopts]').hidden = needs;
          if (needs && !rows.children.length) (t === 'meal' ? MEAL_DEFAULTS : ['']).forEach(addRow);
        });
        panel.querySelector('[data-qf-addopt]').addEventListener('click', function () { addRow(''); });
        panel.querySelector('[data-qf-cancel]').addEventListener('click', function () { App.modal.close(); });
        panel.querySelector('[data-qf-save]').addEventListener('click', function () {
          var label = panel.querySelector('#qf-label').value.trim();
          if (!label) { A.toast('Question label is required', 'error'); return; }
          var t = panel.querySelector('#qf-type').value;
          var needs = ['select', 'radio', 'checkbox', 'meal'].indexOf(t) !== -1;
          var options = needs
            ? A.qsa('input', rows).map(function (i) { return i.value.trim(); }).filter(Boolean)
            : [];
          q.label = label; q.type = t;
          q.required = panel.querySelector('#qf-req').checked;
          q.showIfAttending = panel.querySelector('#qf-cond').checked;
          q.options = options;
          if (!isEdit) R.arr.push(q);
          App.modal.close();
          markDirty();
          renderQList();
          renderPv();
        });
      }
    });
  }

  /* ============================================================
     TAB: SUB-EVENTS
     ============================================================ */

  var SE = { list: [], groups: [] };

  function subEventsBind(main) {
    var ev = A.state.currentEvent;
    Promise.all([
      A.api('/api/events/' + ev.id + '/sub-events'),
      A.api('/api/events/' + ev.id + '/groups')
    ]).then(function (rs) {
      SE.list = rs[0].subEvents || [];
      SE.groups = rs[1].groups || [];
      main.innerHTML =
        pageHead('Sub-Events', 'Rehearsal dinners, brunches, after-parties — keep every moment organized.',
          '<button class="btn btn-accent" data-se-add>' + A.icon('plus') + ' Add sub-event</button>') +
        '<div class="se-grid" data-se-grid>' +
          (SE.list.length ? SE.list.map(seCard).join('') :
            '<div class="empty" style="grid-column:1/-1;padding:46px 20px"><div class="empty-ic">' + A.icon('calendar-days') + '</div>' +
            '<h4>No sub-events yet</h4><p class="small">Add a welcome dinner, ceremony or after-party.</p>' +
            '<button class="btn btn-accent" data-se-add2>' + A.icon('plus') + ' Add sub-event</button></div>') +
        '</div>';
      var grid = A.qs('[data-se-grid]', main);
      grid.addEventListener('click', function (e) {
        var add2 = e.target.closest('[data-se-add2]');
        if (add2) { seModal(null); return; }
        var edit = e.target.closest('[data-se-edit]');
        if (edit) {
          var s = SE.list.filter(function (x) { return x.id === edit.getAttribute('data-se-edit'); })[0];
          if (s) seModal(s);
          return;
        }
        var del = e.target.closest('[data-se-del]');
        if (del) {
          var s2 = SE.list.filter(function (x) { return x.id === del.getAttribute('data-se-del'); })[0];
          if (!s2) return;
          A.confirm({
            title: 'Delete sub-event',
            message: 'Delete <strong>' + A.esc(s2.name) + '</strong>?',
            okLabel: 'Delete', danger: true,
            onOk: function () {
              A.api('/api/sub-events/' + s2.id, { method: 'DELETE' }).then(function () {
                A.toast('Sub-event deleted');
                subEventsBind(main);
              }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
            }
          });
        }
      });
      var addBtn = A.qs('[data-se-add]', main);
      if (addBtn) addBtn.addEventListener('click', function () { seModal(null); });
    }).catch(function (err) { main.innerHTML = errorCard(err.message); });
  }

  function seCard(s) {
    var when = A.fmtDate(s.date) + (s.startTime ? ' · ' + A.fmtTime(s.startTime) + (s.endTime ? ' – ' + A.fmtTime(s.endTime) : '') : '');
    var dots = (s.groupIds || []).map(function (gid) {
      var gr = null;
      for (var i = 0; i < SE.groups.length; i++) if (SE.groups[i].id === gid) gr = SE.groups[i];
      return gr ? '<span class="dot" style="background:' + A.esc(gr.color) + '" title="' + A.esc(gr.name) + '"></span>' : '';
    }).filter(Boolean).join('');
    return '<div class="card card-pad se-card">' +
      '<div class="se-head"><div class="se-name cell-strong">' + A.esc(s.name) + '</div>' +
        (s.rsvpRequired ? '<span class="badge badge-accent">' + A.icon('mail-check') + ' RSVP required</span>' : '') + '</div>' +
      '<div class="se-when small">' + A.icon('calendar-days') + ' ' + A.esc(when) + '</div>' +
      (s.venue ? '<div class="se-when small">' + A.icon('map-pin') + ' ' + A.esc(s.venue) + '</div>' : '') +
      (s.dressCode ? '<div style="margin-top:8px"><span class="badge badge-neutral">' + A.icon('star') + ' ' + A.esc(s.dressCode) + '</span></div>' : '') +
      (s.description ? '<p class="small muted se-desc">' + A.esc(s.description) + '</p>' : '') +
      (dots ? '<div class="se-groups"><span class="tiny muted">Invited groups:</span> ' + dots + '</div>' : '') +
      '<div class="se-actions">' +
        '<button class="btn btn-outline btn-sm" data-se-edit="' + s.id + '">' + A.icon('pencil') + ' Edit</button>' +
        '<button class="btn btn-danger-soft btn-sm" data-se-del="' + s.id + '">' + A.icon('trash') + ' Delete</button>' +
      '</div></div>';
  }

  function seModal(existing) {
    var ev = A.state.currentEvent;
    var s = existing || {};
    var selIds = (s.groupIds || []).slice();
    var isEdit = !!existing;
    A.modal.open({
      title: isEdit ? 'Edit sub-event' : 'Add sub-event',
      wide: true,
      body:
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Name <span class="req">*</span></label><input class="input" id="sf-name" value="' + A.esc(s.name || '') + '" placeholder="Rehearsal Dinner"></div>' +
          '<div class="field"><label class="label">Date <span class="req">*</span></label><input class="input" id="sf-date" type="date" value="' + A.esc(s.date || '') + '"></div>' +
        '</div>' +
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Start time</label><input class="input" id="sf-start" type="time" value="' + A.esc(s.startTime || '18:00') + '"></div>' +
          '<div class="field"><label class="label">End time</label><input class="input" id="sf-end" type="time" value="' + A.esc(s.endTime || '') + '"></div>' +
        '</div>' +
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Venue</label><input class="input" id="sf-venue" value="' + A.esc(s.venue || '') + '" placeholder="Location"></div>' +
          '<div class="field"><label class="label">Dress code</label><input class="input" id="sf-dress" value="' + A.esc(s.dressCode || '') + '" placeholder="e.g. Black tie"></div>' +
        '</div>' +
        field('Description', '<textarea class="textarea" id="sf-desc" placeholder="Details about this moment…">' + A.esc(s.description || '') + '</textarea>') +
        field('Invited groups', '<div class="chip-row" data-sf-groups>' +
          SE.groups.map(function (gr) {
            return '<button type="button" class="chip' + (selIds.indexOf(gr.id) !== -1 ? ' active' : '') + '" data-sfg="' + gr.id + '">' +
              '<span class="dot" style="background:' + A.esc(gr.color) + '"></span> ' + A.esc(gr.name) + '</button>';
          }).join('') + (SE.groups.length ? '' : '<span class="hint">No groups yet — all guests will be invited.</span>') + '</div>') +
        switchRow('sf-rsvp', 'RSVP required', s.rsvpRequired !== false, 'Guests must confirm attendance for this sub-event.'),
      footer:
        '<button class="btn btn-outline" data-sf-cancel>Cancel</button>' +
        '<button class="btn btn-accent" data-sf-save>' + (isEdit ? 'Save changes' : 'Add sub-event') + '</button>',
      onMount: function (panel) {
        A.qsa('[data-sfg]', panel).forEach(function (c) {
          c.addEventListener('click', function () {
            var id = c.getAttribute('data-sfg');
            var i = selIds.indexOf(id);
            if (i === -1) { selIds.push(id); c.classList.add('active'); }
            else { selIds.splice(i, 1); c.classList.remove('active'); }
          });
        });
        panel.querySelector('[data-sf-cancel]').addEventListener('click', function () { App.modal.close(); });
        panel.querySelector('[data-sf-save]').addEventListener('click', function () {
          var name = panel.querySelector('#sf-name').value.trim();
          var date = panel.querySelector('#sf-date').value;
          if (!name || !date) { A.toast('Name and date are required', 'error'); return; }
          var payload = {
            name: name, date: date,
            startTime: panel.querySelector('#sf-start').value,
            endTime: panel.querySelector('#sf-end').value || null,
            venue: panel.querySelector('#sf-venue').value.trim() || null,
            description: panel.querySelector('#sf-desc').value.trim() || null,
            dressCode: panel.querySelector('#sf-dress').value.trim() || null,
            rsvpRequired: panel.querySelector('#sf-rsvp').checked,
            groupIds: selIds
          };
          var p = isEdit
            ? A.api('/api/sub-events/' + s.id, { method: 'PATCH', body: payload })
            : A.api('/api/events/' + ev.id + '/sub-events', { body: payload });
          p.then(function () {
            App.modal.close();
            A.toast(isEdit ? 'Sub-event updated' : 'Sub-event added');
            subEventsBind(A.qs('#dash-main'));
          }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
        });
      }
    });
  }

  /* ============================================================
     TAB: INVITATIONS
     ============================================================ */

  var I = { list: [], guests: [] };

  var CAMP_TYPES = [
    ['save_the_date', 'Save the Date'], ['invitation', 'Invitation'], ['reminder', 'Reminder'],
    ['confirmation', 'Confirmation'], ['update', 'Update'], ['thank_you', 'Thank You'], ['custom', 'Custom']
  ];
  function campTypeLabel(t) {
    for (var i = 0; i < CAMP_TYPES.length; i++) if (CAMP_TYPES[i][0] === t) return CAMP_TYPES[i][1];
    return t;
  }

  function emailVars(ev, g) {
    var parts = (g && g.name ? g.name : 'Guest').trim().split(/\s+/);
    return {
      'guest.first_name': parts[0] || 'Guest',
      'guest.last_name': parts.length > 1 ? parts[parts.length - 1] : '',
      'guest.name': (g && g.name) || 'Guest',
      'event.name': ev.name,
      'event.date': A.fmtDate(ev.eventDate),
      'event.venue': ev.venue || 'TBA',
      'event.rsvp_url': guestLink(ev, g ? g.token : 'sample-token')
    };
  }

  function invitationsBind(main) {
    var ev = A.state.currentEvent;
    Promise.all([
      A.api('/api/events/' + ev.id + '/campaigns'),
      A.api('/api/events/' + ev.id + '/guests')
    ]).then(function (rs) {
      I.list = rs[0].campaigns || [];
      I.guests = rs[1].guests || [];
      main.innerHTML =
        pageHead('Invitations', 'Send save-the-dates, invitations and reminders with tracking.',
          '<button class="btn btn-accent" data-c-new>' + A.icon('plus') + ' New campaign</button>') +
        '<div class="camp-grid" data-camp-grid>' +
          (I.list.length ? I.list.map(campCard).join('') :
            '<div class="empty" style="grid-column:1/-1;padding:46px 20px"><div class="empty-ic">' + A.icon('send') + '</div>' +
            '<h4>No campaigns yet</h4><p class="small">Create your first email campaign.</p>' +
            '<button class="btn btn-accent" data-c-new2>' + A.icon('plus') + ' New campaign</button></div>') +
        '</div>';

      var grid = A.qs('[data-camp-grid]', main);
      grid.addEventListener('click', function (e) {
        var dd = e.target.closest('[data-rowdd]');
        if (dd) {
          e.stopPropagation();
          var menu = dd.parentElement.querySelector('.dropdown-menu');
          var wasOpen = menu.style.display === 'block';
          A.qsa('.dropdown-menu').forEach(function (m) { m.style.display = 'none'; });
          menu.style.display = wasOpen ? 'none' : 'block';
          return;
        }
        var n2 = e.target.closest('[data-c-new2]');
        if (n2) { campaignModal(null); return; }
        var prev = e.target.closest('[data-camp-prev]');
        if (prev) {
          var c = findCamp(prev.getAttribute('data-camp-prev'));
          if (c) previewModal(c);
          return;
        }
        var act = e.target.closest('[data-camp-act]');
        if (!act) return;
        var camp = findCamp(act.getAttribute('data-cid'));
        if (!camp) return;
        campaignAction(act.getAttribute('data-camp-act'), camp, main);
      });

      var nb = A.qs('[data-c-new]', main);
      if (nb) nb.addEventListener('click', function () { campaignModal(null); });
    }).catch(function (err) { main.innerHTML = errorCard(err.message); });
  }

  function findCamp(id) {
    for (var i = 0; i < I.list.length; i++) if (I.list[i].id === id) return I.list[i];
    return null;
  }

  function campCard(c) {
    var statusMap = {
      sent: ['badge-green', 'check', 'Sent'],
      scheduled: ['badge-amber', 'clock', 'Scheduled'],
      draft: ['badge-neutral', 'file', 'Draft']
    };
    var sm = statusMap[c.status] || statusMap.draft;
    return '<div class="card card-pad camp-card">' +
      '<div class="camp-head">' +
        '<span class="badge badge-accent">' + A.icon('mail') + ' ' + A.esc(campTypeLabel(c.type)) + '</span>' +
        '<span class="badge ' + sm[0] + '">' + A.icon(sm[1]) + ' ' + sm[2] + '</span>' +
      '</div>' +
      '<div class="camp-name cell-strong">' + A.esc(c.name) + '</div>' +
      (c.subject ? '<div class="small muted">“' + A.esc(c.subject) + '”</div>' : '') +
      (c.scheduledAt && c.status === 'scheduled' ? '<div class="tiny muted" style="margin-top:6px">' + A.icon('clock') + ' Scheduled for ' + A.fmtDate(c.scheduledAt) + '</div>' : '') +
      '<div class="camp-stats">' +
        campStat('send', 'Sent', c.sentCount) +
        campStat('eye', 'Opened', c.openedCount) +
        campStat('click', 'Clicked', c.clickedCount) +
      '</div>' +
      '<div class="camp-foot">' +
        '<span class="tiny muted">' + (c.sentAt ? 'Sent ' + A.timeAgo(c.sentAt) : 'Created ' + A.timeAgo(c.createdAt)) + '</span>' +
        '<div class="dropdown">' +
          '<button class="icon-btn sm" data-rowdd aria-label="Campaign actions">' + A.icon('more-vertical') + '</button>' +
          '<div class="dropdown-menu">' +
            '<button class="dropdown-item" data-camp-act="preview" data-cid="' + c.id + '">' + A.icon('eye') + ' Preview</button>' +
            (c.status !== 'sent' ? '<button class="dropdown-item" data-camp-act="send" data-cid="' + c.id + '">' + A.icon('send') + ' Send now</button>' : '') +
            (c.status !== 'sent' ? '<button class="dropdown-item" data-camp-act="schedule" data-cid="' + c.id + '">' + A.icon('clock') + ' Schedule…</button>' : '') +
            (c.status === 'scheduled' ? '<button class="dropdown-item" data-camp-act="cancel" data-cid="' + c.id + '">' + A.icon('x') + ' Cancel schedule</button>' : '') +
            '<button class="dropdown-item" data-camp-act="edit" data-cid="' + c.id + '">' + A.icon('pencil') + ' Edit</button>' +
            '<div class="dropdown-sep"></div>' +
            '<button class="dropdown-item danger" data-camp-act="delete" data-cid="' + c.id + '">' + A.icon('trash') + ' Delete</button>' +
          '</div></div>' +
      '</div></div>';
  }

  function campStat(icon, label, val) {
    return '<div class="camp-stat"><span class="camp-stat-ic">' + A.icon(icon) + '</span>' +
      '<div><div class="cell-strong small">' + val + '</div><div class="tiny muted">' + label + '</div></div></div>';
  }

  function campaignAction(act, c, main) {
    if (act === 'preview') { previewModal(c); return; }
    if (act === 'send') {
      A.confirm({
        title: 'Send campaign',
        message: 'Send <strong>' + A.esc(c.name) + '</strong> to all guests now?',
        okLabel: 'Send now',
        onOk: function () {
          A.api('/api/campaigns/' + c.id, { method: 'PATCH', body: { action: 'send' } }).then(function () {
            A.toast('Campaign sent');
            invitationsBind(main);
          }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
        }
      });
    } else if (act === 'schedule') {
      A.modal.open({
        title: 'Schedule campaign',
        body: field('Send at', '<input class="input" id="sch-at" type="datetime-local">'),
        footer:
          '<button class="btn btn-outline" data-sch-cancel>Cancel</button>' +
          '<button class="btn btn-accent" data-sch-ok>Schedule</button>',
        onMount: function (panel) {
          panel.querySelector('[data-sch-cancel]').addEventListener('click', function () { App.modal.close(); });
          panel.querySelector('[data-sch-ok]').addEventListener('click', function () {
            var v = panel.querySelector('#sch-at').value;
            if (!v) { A.toast('Pick a date and time', 'error'); return; }
            A.api('/api/campaigns/' + c.id, { method: 'PATCH', body: { action: 'schedule', scheduledAt: new Date(v).toISOString() } })
              .then(function () { App.modal.close(); A.toast('Campaign scheduled'); invitationsBind(main); })
              .catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
          });
        }
      });
    } else if (act === 'cancel') {
      A.api('/api/campaigns/' + c.id, { method: 'PATCH', body: { action: 'cancel' } }).then(function () {
        A.toast('Schedule cancelled', 'info');
        invitationsBind(main);
      }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
    } else if (act === 'edit') {
      campaignModal(c);
    } else if (act === 'delete') {
      A.confirm({
        title: 'Delete campaign',
        message: 'Delete <strong>' + A.esc(c.name) + '</strong>?',
        okLabel: 'Delete', danger: true,
        onOk: function () {
          A.api('/api/campaigns/' + c.id, { method: 'DELETE' }).then(function () {
            A.toast('Campaign deleted');
            invitationsBind(main);
          }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
        }
      });
    }
  }

  function campaignModal(existing) {
    var ev = A.state.currentEvent;
    var c = existing || {};
    var isEdit = !!existing;
    A.modal.open({
      title: isEdit ? 'Edit campaign' : 'New campaign',
      wide: true,
      body:
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Name <span class="req">*</span></label><input class="input" id="cf-name" value="' + A.esc(c.name || '') + '" placeholder="Invitation — first wave"></div>' +
          '<div class="field"><label class="label">Type</label><select class="select" id="cf-type">' +
            CAMP_TYPES.map(function (t) { return '<option value="' + t[0] + '"' + ((c.type || 'invitation') === t[0] ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('') +
          '</select></div>' +
        '</div>' +
        field('Subject', '<input class="input" id="cf-subject" value="' + A.esc(c.subject || '') + '" placeholder="You are invited!">') +
        field('Email body',
          '<textarea class="textarea" id="cf-body" style="min-height:130px" placeholder="Dear {{guest.first_name}}, …">' + A.esc(c.body || '') + '</textarea>' +
          '<div class="var-chips">' + A.EMAIL_VARIABLES.map(function (v) {
            return '<button type="button" class="chip" data-var="' + A.esc(v) + '">' + A.esc(v) + '</button>';
          }).join('') + '</div>',
          'Click a variable to insert it at the cursor.') +
        (isEdit ? '' : '<div class="field"><label class="label">Delivery</label>' +
          '<div class="radio-col">' +
          '<label class="radio-row"><input type="radio" name="cf-deliver" value="now" checked> <span>Send now</span></label>' +
          '<label class="radio-row"><input type="radio" name="cf-deliver" value="schedule"> <span>Schedule for later</span></label>' +
          '<label class="radio-row"><input type="radio" name="cf-deliver" value="draft"> <span>Save as draft</span></label>' +
          '</div>' +
          '<input class="input" id="cf-when" type="datetime-local" style="display:none;margin-top:8px"></div>'),
      footer:
        '<button class="btn btn-outline" data-cf-cancel>Cancel</button>' +
        '<button class="btn btn-accent" data-cf-save>' + (isEdit ? 'Save changes' : 'Create campaign') + '</button>',
      onMount: function (panel) {
        var ta = panel.querySelector('#cf-body');
        A.qsa('[data-var]', panel).forEach(function (chip) {
          chip.addEventListener('click', function () {
            var v = chip.getAttribute('data-var');
            var pos = ta.selectionStart != null ? ta.selectionStart : ta.value.length;
            ta.value = ta.value.slice(0, pos) + v + ta.value.slice(ta.selectionEnd || pos);
            ta.focus();
            ta.setSelectionRange(pos + v.length, pos + v.length);
          });
        });
        var when = panel.querySelector('#cf-when');
        if (when) A.qsa('input[name="cf-deliver"]', panel).forEach(function (r) {
          r.addEventListener('change', function () {
            when.style.display = r.checked && r.value === 'schedule' ? 'block' : 'none';
          });
        });
        panel.querySelector('[data-cf-cancel]').addEventListener('click', function () { App.modal.close(); });
        panel.querySelector('[data-cf-save]').addEventListener('click', function () {
          var name = panel.querySelector('#cf-name').value.trim();
          if (!name) { A.toast('Campaign name is required', 'error'); return; }
          var bodyData = {
            name: name,
            type: panel.querySelector('#cf-type').value,
            subject: panel.querySelector('#cf-subject').value.trim(),
            body: ta.value
          };
          if (isEdit) {
            A.api('/api/campaigns/' + c.id, { method: 'PATCH', body: bodyData }).then(function () {
              App.modal.close(); A.toast('Campaign updated'); invitationsBind(A.qs('#dash-main'));
            }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
            return;
          }
          var mode = 'draft';
          A.qsa('input[name="cf-deliver"]', panel).forEach(function (r) { if (r.checked) mode = r.value; });
          if (mode === 'now') {
            bodyData.send = true;
          } else if (mode === 'schedule') {
            if (!when.value) { A.toast('Pick a date and time', 'error'); return; }
            bodyData.scheduledAt = new Date(when.value).toISOString();
          }
          A.api('/api/events/' + ev.id + '/campaigns', { body: bodyData }).then(function () {
            App.modal.close();
            A.toast(mode === 'now' ? 'Campaign sent' : mode === 'schedule' ? 'Campaign scheduled' : 'Draft saved');
            invitationsBind(A.qs('#dash-main'));
          }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
        });
      }
    });
  }

  function previewModal(c) {
    var ev = A.state.currentEvent;
    var g = I.guests[0] || { name: 'Jane Doe', token: 'sample-token' };
    var vars = emailVars(ev, g);
    var subject = A.renderEmailVars(c.subject || c.name, vars);
    var bodyText = A.renderEmailVars(c.body || '(No body — add your message in the editor.)', vars);
    A.modal.open({
      title: 'Email preview',
      wide: true,
      body:
        '<div class="email-prev">' +
          '<div class="email-chrome"><span class="cdot" style="background:#E8A9A2"></span><span class="cdot" style="background:#EBC98E"></span><span class="cdot" style="background:#A9C4A0"></span></div>' +
          '<div class="email-meta"><div><span class="stat-label">From</span><div class="small">' + A.esc(ev.hostNames || 'Your hosts') + ' &lt;' + A.esc(ev.contactEmail || 'hello@example.com') + '&gt;</div></div>' +
          '<div style="margin-top:8px"><span class="stat-label">Subject</span><div class="cell-strong">' + A.esc(subject) + '</div></div></div>' +
          '<div class="email-body">' + A.esc(bodyText).replace(/\n/g, '<br>') + '</div>' +
          '<div class="email-cta"><a class="btn btn-accent" href="' + A.esc(siteUrl(ev)) + '" target="_blank" rel="noopener">' + A.icon('mail-check') + ' RSVP Now</a></div>' +
          '<p class="tiny muted center" style="margin-top:14px">Variables resolved for ' + A.esc(g.name || 'first guest') + '.</p>' +
        '</div>'
    });
  }

  /* ============================================================
     TAB: PAYMENTS
     ============================================================ */

  var PAY = { list: [] };
  var PAY_TYPES = [['donation', 'Donation'], ['ticket', 'Ticket'], ['gift', 'Gift'], ['registry', 'Registry']];

  function paymentsBind(main) {
    var ev = A.state.currentEvent;
    A.api('/api/events/' + ev.id + '/payments').then(function (res) {
      PAY.list = res.payments || [];
      var total = PAY.list.reduce(function (s, p) { return s + Number(p.amount || 0); }, 0);
      main.innerHTML =
        pageHead('Payments', 'Track gifts, tickets and donations for your event.',
          '<button class="btn btn-outline" data-pay-export>' + A.icon('download') + ' Export CSV</button>' +
          '<button class="btn btn-accent" data-pay-add>' + A.icon('plus') + ' Record payment</button>') +
        '<div class="pay-top">' +
          '<div class="card card-pad stat-card pay-total-card">' +
            '<div class="stat-label">' + A.icon('wallet') + ' Total collected</div>' +
            '<div class="stat-value">' + A.money(total) + '</div>' +
            '<div class="stat-sub">across ' + PAY.list.length + ' ' + A.plural(PAY.list.length, 'transaction') + '</div>' +
          '</div>' +
        '</div>' +
        '<div data-pay-table></div>';
      renderPayTable();
      var add = A.qs('[data-pay-add]', main);
      if (add) add.addEventListener('click', function () { paymentModal(main); });
      var exp = A.qs('[data-pay-export]', main);
      if (exp) exp.addEventListener('click', function () {
        var rows = [['Guest', 'Type', 'Amount', 'Status', 'Method', 'Date']];
        PAY.list.forEach(function (p) {
          rows.push([p.guestName, p.type, p.amount, p.status, p.method, p.createdAt ? p.createdAt.slice(0, 10) : '']);
        });
        A.downloadCsv('payments-' + ev.slug + '.csv', rows);
        A.toast('Payments exported');
      });
    }).catch(function (err) { main.innerHTML = errorCard(err.message); });
  }

  function renderPayTable() {
    var box = A.qs('[data-pay-table]');
    if (!box) return;
    if (!PAY.list.length) {
      box.innerHTML = '<div class="empty" style="padding:46px 20px"><div class="empty-ic">' + A.icon('credit-card') + '</div>' +
        '<h4>No transactions yet</h4><p class="small">Record your first payment or gift.</p></div>';
      return;
    }
    var typeBadge = function (t) {
      for (var i = 0; i < PAY_TYPES.length; i++) if (PAY_TYPES[i][0] === t) return t;
      return t;
    };
    box.innerHTML = '<div class="table-wrap"><table class="table">' +
      '<thead><tr><th>Guest</th><th>Type</th><th>Amount</th><th>Status</th><th>Method</th><th>Date</th></tr></thead>' +
      '<tbody>' + PAY.list.map(function (p) {
        return '<tr><td class="cell-strong">' + A.esc(p.guestName) + '</td>' +
          '<td><span class="badge badge-accent">' + A.esc(typeBadge(p.type).charAt(0).toUpperCase() + typeBadge(p.type).slice(1)) + '</span></td>' +
          '<td class="cell-strong">' + A.money(p.amount) + '</td>' +
          '<td><span class="badge badge-green">' + A.icon('check') + ' ' + A.esc(p.status || 'succeeded') + '</span></td>' +
          '<td class="small muted">' + A.esc(p.method || '—') + '</td>' +
          '<td class="small muted">' + (p.createdAt ? A.fmtDateShort(p.createdAt) : '—') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function paymentModal(main) {
    A.modal.open({
      title: 'Record payment',
      body:
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Guest name</label><input class="input" id="pf-name" placeholder="Who paid?"></div>' +
          '<div class="field"><label class="label">Type</label><select class="select" id="pf-type">' +
            PAY_TYPES.map(function (t) { return '<option value="' + t[0] + '">' + t[1] + '</option>'; }).join('') +
          '</select></div>' +
        '</div>' +
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Amount <span class="req">*</span></label><input class="input" id="pf-amount" type="number" min="0" step="0.01" placeholder="0.00"></div>' +
          '<div class="field"><label class="label">Method</label><select class="select" id="pf-method">' +
            ['stripe', 'cash', 'bank transfer'].map(function (m) { return '<option>' + m + '</option>'; }).join('') +
          '</select></div>' +
        '</div>',
      footer:
        '<button class="btn btn-outline" data-pf-cancel>Cancel</button>' +
        '<button class="btn btn-accent" data-pf-save>Record payment</button>',
      onMount: function (panel) {
        panel.querySelector('[data-pf-cancel]').addEventListener('click', function () { App.modal.close(); });
        panel.querySelector('[data-pf-save]').addEventListener('click', function () {
          var amount = Number(panel.querySelector('#pf-amount').value);
          if (!amount || amount <= 0) { A.toast('Enter a valid amount', 'error'); return; }
          A.api('/api/events/' + A.state.currentEvent.id + '/payments', {
            body: {
              guestName: panel.querySelector('#pf-name').value.trim() || 'Anonymous',
              type: panel.querySelector('#pf-type').value,
              amount: amount,
              method: panel.querySelector('#pf-method').value
            }
          }).then(function () {
            App.modal.close();
            A.toast('Payment recorded');
            paymentsBind(main);
          }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
        });
      }
    });
  }

  /* ============================================================
     TAB: ANALYTICS
     ============================================================ */

  function analyticsBind(main) {
    var ev = A.state.currentEvent;
    Promise.all([
      A.api('/api/events/' + ev.id + '/analytics'),
      A.api('/api/events/' + ev.id + '/guests')
    ]).then(function (rs) {
      var st = rs[0].stats;
      var guests = rs[1].guests || [];
      var submitted = st.attending + st.declined;

      var meals = {};
      guests.forEach(function (g) {
        if (g.meal) meals[g.meal] = (meals[g.meal] || 0) + 1;
      });
      var mealItems = Object.keys(meals).map(function (k) { return { label: k, value: meals[k], color: '#9A7B5B' }; })
        .sort(function (a, b) { return b.value - a.value; });

      var openRate = st.emails.sent ? Math.round((st.emails.opened / st.emails.sent) * 100) : 0;
      var clickRate = st.emails.sent ? Math.round((st.emails.clicked / st.emails.sent) * 100) : 0;

      main.innerHTML =
        pageHead('Analytics', 'Everything happening around your event, at a glance.') +
        '<div class="stat-grid stat-grid-5">' +
          statCard('Invited', st.invited, 'var(--accent)', 'send') +
          statCard('Submitted', submitted, 'var(--primary)', 'mail-check') +
          statCard('Attending', st.attending, STATUS_COLORS.attending, 'check') +
          statCard('Declined', st.declined, STATUS_COLORS.declined, 'x') +
          statCard('Pending', st.pending, STATUS_COLORS.pending, 'clock') +
        '</div>' +
        '<div class="an-grid">' +
          '<div class="card card-pad">' +
            '<div class="card-title">RSVP trend — 30 days</div>' +
            '<div class="ov-rate-row" style="margin-top:10px"><div class="stat-label">RSVP rate</div>' +
            '<div class="small" style="font-weight:700">' + st.rsvpRate + '%</div></div>' +
            '<div class="progress" style="margin-bottom:6px"><span style="width:' + st.rsvpRate + '%;background:var(--accent)"></span></div>' +
            '<div class="tiny muted" style="margin-bottom:12px">' + st.pageViews.toLocaleString() + ' page views on your site</div>' +
            '<div class="ov-chart an-chart" data-an-area></div>' +
          '</div>' +
          '<div class="card card-pad">' +
            '<div class="card-title">Response breakdown</div>' +
            '<div data-an-donut style="margin-top:14px"></div>' +
          '</div>' +
        '</div>' +
        '<div class="an-grid2">' +
          '<div class="card card-pad">' +
            '<div class="card-title">' + A.icon('mail') + ' Email performance</div>' +
            '<div class="email-perf">' +
              emailPerfRow('send', 'Emails sent', st.emails.sent, 100) +
              emailPerfRow('eye', 'Opened', st.emails.opened, openRate) +
              emailPerfRow('click', 'Clicked', st.emails.clicked, clickRate) +
            '</div>' +
          '</div>' +
          '<div class="card card-pad">' +
            '<div class="card-title">' + A.icon('gift') + ' Meal choices</div>' +
            '<div data-an-meals style="margin-top:16px"></div>' +
          '</div>' +
        '</div>';

      var area = A.qs('[data-an-area]', main);
      if (area) { area.style.height = '220px'; A.chartArea(area, st.trend, '#9A7B5B'); }
      var donut = A.qs('[data-an-donut]', main);
      if (donut) {
        A.chartDonut(donut, [
          { label: 'Attending', value: st.attending, color: STATUS_COLORS.attending },
          { label: 'Pending', value: st.pending, color: STATUS_COLORS.pending },
          { label: 'Declined', value: st.declined, color: STATUS_COLORS.declined }
        ], String(st.totalGuests), 'guests');
      }
      var mealsEl = A.qs('[data-an-meals]', main);
      if (mealsEl) A.chartBarsH(mealsEl, mealItems);
    }).catch(function (err) { main.innerHTML = errorCard(err.message); });
  }

  function emailPerfRow(icon, label, value, pct) {
    return '<div class="ep-row"><span class="ep-ic">' + A.icon(icon) + '</span>' +
      '<div style="flex:1"><div style="display:flex;justify-content:space-between" class="small"><span class="cell-strong">' + label + '</span>' +
      '<span class="muted">' + value + (pct === 100 ? '' : ' · ' + pct + '%') + '</span></div>' +
      '<div class="progress" style="margin-top:5px"><span style="width:' + pct + '%;background:' +
      (icon === 'send' ? 'var(--accent)' : icon === 'eye' ? 'var(--sage)' : 'var(--amber)') + '"></span></div></div></div>';
  }

  /* ============================================================
     TAB: SETTINGS
     ============================================================ */

  var ST = { tab: 'general' };

  function settingsBind(main) {
    ST.tab = ST.tab || 'general';
    main.innerHTML =
      pageHead('Settings', 'Event details, privacy, domain and danger zone.') +
      '<div class="tabs" data-st-tabs>' +
        [['general', 'General'], ['privacy', 'RSVP & Privacy'], ['notify', 'Notifications & Domain'], ['danger', 'Danger']].map(function (t) {
          return '<button class="tab' + (ST.tab === t[0] ? ' active' : '') + '" data-st="' + t[0] + '">' + t[1] + '</button>';
        }).join('') +
      '</div>' +
      '<div data-st-body style="margin-top:20px"></div>';

    var tabs = A.qs('[data-st-tabs]', main);
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('[data-st]');
      if (!b) return;
      ST.tab = b.getAttribute('data-st');
      A.qsa('[data-st]', tabs).forEach(function (x) { x.classList.toggle('active', x === b); });
      renderStBody();
    });
    renderStBody();
  }

  function renderStBody() {
    var body = A.qs('[data-st-body]');
    if (!body) return;
    if (ST.tab === 'general') stGeneral(body);
    else if (ST.tab === 'privacy') stPrivacy(body);
    else if (ST.tab === 'notify') stNotify(body);
    else stDanger(body);
  }

  function saveSettings(patch, btn, okMsg) {
    return A.api('/api/events/' + A.state.currentEvent.id, { method: 'PATCH', body: patch })
      .then(function (res) {
        applyEventUpdate(res.event);
        refreshTopbarEvent();
        A.toast(okMsg || 'Settings saved');
        if (btn) btn.disabled = false;
      })
      .catch(function (err) {
        if (btn) btn.disabled = false;
        A.toast(err.message || 'Save failed', 'error');
      });
  }

  function stGeneral(body) {
    var ev = A.state.currentEvent;
    body.innerHTML =
      '<div class="card card-pad" style="max-width:760px">' +
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Event name</label><input class="input" id="s-name" value="' + A.esc(ev.name) + '"></div>' +
          '<div class="field"><label class="label">Public URL</label>' +
            '<div class="slug-row"><input class="input" id="s-slug" value="' + A.esc(ev.slug) + '" readonly>' +
            '<button class="icon-btn" id="s-slug-copy" aria-label="Copy URL">' + A.icon('copy') + '</button>' +
            '<button class="icon-btn" id="s-slug-open" aria-label="Open site">' + A.icon('external-link') + '</button></div>' +
            '<span class="hint">Your event lives at ' + A.esc(ev.slug) + '.onlinersvp.com</span></div>' +
        '</div>' +
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Event date</label><input class="input" id="s-date" type="date" value="' + A.esc((ev.eventDate || '').slice(0, 10)) + '"></div>' +
          '<div class="field"><label class="label">Timezone</label><select class="select" id="s-tz">' + tzOptions(ev.timezone) + '</select></div>' +
        '</div>' +
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Start time</label><input class="input" id="s-start" type="time" value="' + A.esc(ev.startTime || '') + '"></div>' +
          '<div class="field"><label class="label">End time</label><input class="input" id="s-end" type="time" value="' + A.esc(ev.endTime || '') + '"></div>' +
        '</div>' +
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Venue</label><input class="input" id="s-venue" value="' + A.esc(ev.venue || '') + '" placeholder="Venue name"></div>' +
          '<div class="field"><label class="label">Address</label><input class="input" id="s-addr" value="' + A.esc(ev.address || '') + '" placeholder="Street, city"></div>' +
        '</div>' +
        field('Description', '<textarea class="textarea" id="s-desc">' + A.esc(ev.description || '') + '</textarea>') +
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Host names</label><input class="input" id="s-hosts" value="' + A.esc(ev.hostNames || '') + '" placeholder="John &amp; Emily"></div>' +
          '<div class="field"><label class="label">Contact email</label><input class="input" id="s-cemail" type="email" value="' + A.esc(ev.contactEmail || '') + '"></div>' +
        '</div>' +
        field('Contact phone', '<input class="input" id="s-cphone" value="' + A.esc(ev.contactPhone || '') + '">') +
        '<button class="btn btn-accent" data-s-save>' + A.icon('save') + ' Save changes</button>' +
      '</div>';

    body.querySelector('#s-slug-copy').addEventListener('click', function () { copyText(siteUrl(ev), 'Public link copied'); });
    body.querySelector('#s-slug-open').addEventListener('click', function () { A.navigate('#/site/' + ev.slug); });
    var btn = body.querySelector('[data-s-save]');
    btn.addEventListener('click', function () {
      var name = body.querySelector('#s-name').value.trim();
      if (!name) { A.toast('Event name is required', 'error'); return; }
      btn.disabled = true;
      saveSettings({
        name: name,
        eventDate: body.querySelector('#s-date').value,
        startTime: body.querySelector('#s-start').value,
        endTime: body.querySelector('#s-end').value,
        timezone: body.querySelector('#s-tz').value,
        venue: body.querySelector('#s-venue').value.trim(),
        address: body.querySelector('#s-addr').value.trim(),
        description: body.querySelector('#s-desc').value.trim(),
        hostNames: body.querySelector('#s-hosts').value.trim(),
        contactEmail: body.querySelector('#s-cemail').value.trim(),
        contactPhone: body.querySelector('#s-cphone').value.trim()
      }, btn);
    });
  }

  function stPrivacy(body) {
    var ev = A.state.currentEvent;
    var s = ev.settings || {};
    body.innerHTML =
      '<div class="card card-pad" style="max-width:640px">' +
        '<div class="card-title">Who can RSVP?</div>' +
        '<div class="radio-col" style="margin:12px 0 4px">' +
          '<label class="radio-row"><input type="radio" name="s-mode" value="public"' + (s.rsvpMode !== 'password' && s.rsvpMode !== 'guestlist' ? ' checked' : '') + '> <span><strong>Public</strong> — anyone with the link can RSVP</span></label>' +
          '<label class="radio-row"><input type="radio" name="s-mode" value="password"' + (s.rsvpMode === 'password' ? ' checked' : '') + '> <span><strong>Password</strong> — guests need a password</span></label>' +
          '<label class="radio-row"><input type="radio" name="s-mode" value="guestlist"' + (s.rsvpMode === 'guestlist' ? ' checked' : '') + '> <span><strong>Guest list</strong> — only guests with a personal link</span></label>' +
        '</div>' +
        '<div class="field" data-s-pw-wrap style="margin-top:10px;display:' + (s.rsvpMode === 'password' ? 'flex' : 'none') + '">' +
          '<label class="label">RSVP password</label><input class="input" id="s-pw" value="' + A.esc(s.rsvpPassword || '') + '" placeholder="Choose a password">' +
        '</div>' +
        '<hr class="soft-hr">' +
        '<div class="form-grid">' +
          '<div class="field"><label class="label">RSVP deadline</label><input class="input" id="s-deadline" type="date" value="' + A.esc((s.rsvpDeadline || '').slice(0, 10)) + '"></div>' +
          '<div class="field"><label class="label">Max party size</label><input class="input" id="s-max" type="number" min="1" max="20" value="' + (s.maxGuests != null ? s.maxGuests : 5) + '"></div>' +
        '</div>' +
        switchRow('s-plusone', 'Allow plus-ones', s.allowPlusOne !== false, 'Guests can bring additional people up to the max party size.') +
        switchRow('s-edit', 'Allow guests to edit their RSVP', s.allowEdit !== false, 'Guests can revisit their link and change answers.') +
        switchRow('s-index', 'Allow search engines to index the site', s.indexable !== false, '') +
        '<button class="btn btn-accent" data-sp-save>' + A.icon('save') + ' Save changes</button>' +
      '</div>';

    var pwWrap = body.querySelector('[data-s-pw-wrap]');
    A.qsa('input[name="s-mode"]', body).forEach(function (r) {
      r.addEventListener('change', function () {
        pwWrap.style.display = r.checked && r.value === 'password' ? 'flex' : 'none';
      });
    });
    var btn = body.querySelector('[data-sp-save]');
    btn.addEventListener('click', function () {
      var mode = 'public';
      A.qsa('input[name="s-mode"]', body).forEach(function (r) { if (r.checked) mode = r.value; });
      btn.disabled = true;
      saveSettings({
        settings: Object.assign({}, s, {
          rsvpMode: mode,
          rsvpPassword: body.querySelector('#s-pw').value,
          rsvpDeadline: body.querySelector('#s-deadline').value,
          maxGuests: Number(body.querySelector('#s-max').value) || 5,
          allowPlusOne: body.querySelector('#s-plusone').checked,
          allowEdit: body.querySelector('#s-edit').checked,
          indexable: body.querySelector('#s-index').checked
        })
      }, btn);
    });
  }

  function stNotify(body) {
    var ev = A.state.currentEvent;
    var s = ev.settings || {};
    body.innerHTML =
      '<div class="card card-pad" style="max-width:640px">' +
        '<div class="card-title">' + A.icon('bell') + ' Notifications</div>' +
        '<div style="margin:12px 0 4px">' +
          switchRow('s-notify', 'Notify me on every RSVP', s.notifyEveryRsvp !== false, 'Get an alert the moment a guest responds.') +
          switchRow('s-daily', 'Daily summary email', !!s.dailySummary, 'One digest each morning with the latest activity.') +
        '</div>' +
        '<button class="btn btn-accent" data-sn-save>' + A.icon('save') + ' Save changes</button>' +
      '</div>' +
      '<div class="card card-pad" style="max-width:640px;margin-top:16px" data-domain-card>' + domainCardHtml(s) + '</div>';

    var btn = body.querySelector('[data-sn-save]');
    btn.addEventListener('click', function () {
      btn.disabled = true;
      saveSettings({
        settings: Object.assign({}, s, {
          notifyEveryRsvp: body.querySelector('#s-notify').checked,
          dailySummary: body.querySelector('#s-daily').checked
        })
      }, btn);
    });
    wireDomain(body);
  }

  function domainCardHtml(s) {
    var connected = s.domainStatus && s.domainStatus !== 'none';
    return '<div class="card-title">' + A.icon('globe') + ' Custom domain</div>' +
      (connected
        ? '<div class="domain-row"><span class="cell-strong">' + A.esc(s.customDomain) + '</span>' +
          '<span class="badge ' + (s.domainStatus === 'verified' ? 'badge-green' : 'badge-amber') + '" data-domain-badge>' +
          (s.domainStatus === 'verified' ? A.icon('check') + ' Verified' : A.icon('clock') + ' Pending') + '</span></div>' +
          dnsTable() +
          '<button class="btn btn-danger-soft btn-sm" data-domain-remove>' + A.icon('trash') + ' Remove domain</button>'
        : '<p class="small muted" style="margin:8px 0 12px">Connect your own domain (like johnandemily.com) — we verify it automatically.</p>' +
          '<div class="domain-connect"><input class="input" id="s-domain" placeholder="yourdomain.com" value="' + A.esc(s.customDomain || '') + '">' +
          '<button class="btn btn-accent" data-domain-connect>Connect</button></div>');
  }

  function dnsTable() {
    return '<div class="table-wrap" style="margin:14px 0"><table class="table">' +
      '<thead><tr><th>Type</th><th>Name</th><th>Value</th></tr></thead>' +
      '<tbody><tr><td class="cell-strong">CNAME</td><td>www</td><td class="tiny">cname.onlinersvp.com</td></tr></tbody>' +
      '</table></div><p class="tiny muted">DNS changes can take up to 24 hours to propagate.</p>';
  }

  function wireDomain(body) {
    var card = body.querySelector('[data-domain-card]');
    if (!card) return;
    var connect = card.querySelector('[data-domain-connect]');
    if (connect) connect.addEventListener('click', function () {
      var input = card.querySelector('#s-domain');
      var v = input.value.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (!v) { A.toast('Enter a domain first', 'error'); return; }
      connect.disabled = true;
      saveSettings({ settings: Object.assign({}, A.state.currentEvent.settings, { customDomain: v, domainStatus: 'pending' }) }, null, 'Connecting domain…')
        .then(function () {
          card.innerHTML = domainCardHtml(A.state.currentEvent.settings);
          wireDomain(body);
          setTimeout(function () {
            saveSettings({ settings: Object.assign({}, A.state.currentEvent.settings, { domainStatus: 'verified' }) }, null, 'Domain verified')
              .then(function () {
                card.innerHTML = domainCardHtml(A.state.currentEvent.settings);
                wireDomain(body);
              });
          }, 1500);
        });
    });
    var remove = card.querySelector('[data-domain-remove]');
    if (remove) remove.addEventListener('click', function () {
      A.confirm({
        title: 'Remove domain',
        message: 'Disconnect <strong>' + A.esc(A.state.currentEvent.settings.customDomain) + '</strong>? Your site stays live at the onlinersvp.com address.',
        okLabel: 'Remove', danger: true,
        onOk: function () {
          saveSettings({ settings: Object.assign({}, A.state.currentEvent.settings, { customDomain: '', domainStatus: 'none' }) }, null, 'Domain removed')
            .then(function () {
              card.innerHTML = domainCardHtml(A.state.currentEvent.settings);
              wireDomain(body);
            });
        }
      });
    });
  }

  function stDanger(body) {
    var ev = A.state.currentEvent;
    var paused = ev.status === 'paused';
    body.innerHTML =
      '<div class="card card-pad danger-card" style="max-width:640px">' +
        '<div class="card-title">' + A.icon('alert') + ' ' + (paused ? 'Paused' : 'Pause event') + '</div>' +
        '<p class="small muted" style="margin:8px 0 14px">' + (paused
          ? 'Your site is temporarily hidden from guests.'
          : 'Temporarily hide your site — guests will see a friendly “coming soon” page.') + '</p>' +
        (paused
          ? '<button class="btn btn-accent" data-dz-unpause>' + A.icon('zap') + ' Unpause event</button>'
          : '<button class="btn btn-outline" data-dz-pause>' + A.icon('clock') + ' Pause event</button>') +
      '</div>' +
      '<div class="card card-pad danger-card" style="max-width:640px;margin-top:16px">' +
        '<div class="card-title">' + A.icon('inbox') + ' Archive event</div>' +
        '<p class="small muted" style="margin:8px 0 14px">Move this event to your archive. It stays accessible but read-only.</p>' +
        '<button class="btn btn-outline" data-dz-archive>' + A.icon('file') + ' Archive event</button>' +
      '</div>' +
      '<div class="card card-pad danger-card zone-red" style="max-width:640px;margin-top:16px">' +
        '<div class="card-title">' + A.icon('trash') + ' Delete event</div>' +
        '<p class="small muted" style="margin:8px 0 14px">Permanently delete <strong>' + A.esc(ev.name) + '</strong>, its guests, RSVPs and payments. This cannot be undone.</p>' +
        '<button class="btn btn-danger" data-dz-delete>' + A.icon('trash') + ' Delete this event</button>' +
      '</div>';

    var pause = body.querySelector('[data-dz-pause]');
    if (pause) pause.addEventListener('click', function () {
      A.api('/api/events/' + ev.id + '/publish', { body: { action: 'pause' } }).then(function (res) {
        applyEventUpdate(res.event);
        A.toast('Event paused', 'info');
        renderStBody();
      }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
    });
    var unpause = body.querySelector('[data-dz-unpause]');
    if (unpause) unpause.addEventListener('click', function () {
      A.api('/api/events/' + ev.id + '/publish', { body: { action: 'publish' } }).then(function (res) {
        applyEventUpdate(res.event);
        A.toast('Event is live again');
        renderStBody();
      }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
    });
    var archive = body.querySelector('[data-dz-archive]');
    if (archive) archive.addEventListener('click', function () {
      A.api('/api/events/' + ev.id + '/publish', { body: { action: 'archive' } }).then(function (res) {
        applyEventUpdate(res.event);
        A.toast('Event archived', 'info');
        renderStBody();
      }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
    });
    var del = body.querySelector('[data-dz-delete]');
    if (del) del.addEventListener('click', function () {
      A.modal.open({
        title: 'Delete event',
        body:
          '<p class="small muted">This will permanently delete <strong>' + A.esc(ev.name) + '</strong> and all its data.</p>' +
          '<div class="field" style="margin-top:12px"><label class="label">Type the event name to confirm</label>' +
          '<input class="input" id="dz-confirm" placeholder="' + A.esc(ev.name) + '" autocomplete="off"></div>',
        footer:
          '<button class="btn btn-outline" data-dz-cancel>Cancel</button>' +
          '<button class="btn btn-danger" data-dz-ok disabled>Delete forever</button>',
        onMount: function (panel) {
          var input = panel.querySelector('#dz-confirm');
          var ok = panel.querySelector('[data-dz-ok]');
          input.addEventListener('input', function () {
            ok.disabled = input.value !== ev.name;
          });
          panel.querySelector('[data-dz-cancel]').addEventListener('click', function () { App.modal.close(); });
          ok.addEventListener('click', function () {
            ok.disabled = true;
            A.api('/api/events/' + ev.id, { method: 'DELETE' }).then(function () {
              App.modal.close();
              A.toast('Event deleted', 'info');
              A.state.events = A.state.events.filter(function (e) { return e.id !== ev.id; });
              A.state.currentEvent = null;
              if (A.state.events.length) {
                A.navigate('#/app');
              } else {
                A.navigate('#/create');
              }
            }).catch(function (err) {
              ok.disabled = false;
              A.toast(err.message || 'Delete failed', 'error');
            });
          });
        }
      });
    });
  }

  /* ---------------- tab registry ---------------- */

  var TABS = {
    overview: { bind: overviewBind },
    website: { bind: websiteBind },
    guests: { bind: guestsBind },
    rsvp: { bind: rsvpBind },
    subevents: { bind: subEventsBind },
    invitations: { bind: invitationsBind },
    payments: { bind: paymentsBind },
    analytics: { bind: analyticsBind },
    settings: { bind: settingsBind }
  };

  A.views.dashboard = { render: dashRender, mount: dashMount };
  /* Router note: parseHash() resolves '#/app/<tab>' to view name 'app'
     (parts[0]), so alias it — App.views.dashboard remains the canonical
     registration per the shared contract. */
  A.views.app = A.views.dashboard;

  /* ============================================================
     BUILDER VIEW
     ============================================================ */

  var B = null;

  var CONTENT_FIELDS = {
    heading: { label: 'Heading', type: 'text' },
    subheading: { label: 'Subheading', type: 'text' },
    dateText: { label: 'Date text', type: 'text' },
    locationText: { label: 'Location text', type: 'text' },
    buttonText: { label: 'Button text', type: 'text' },
    body: { label: 'Body', type: 'textarea' },
    note: { label: 'Extra note', type: 'textarea' },
    image: { label: 'Image URL', type: 'image' },
    subtitle: { label: 'Subtitle', type: 'text' },
    text: { label: 'Text', type: 'textarea' },
    email: { label: 'Email', type: 'text' },
    phone: { label: 'Phone', type: 'text' }
  };

  function defFields(type) {
    var def = A.getSectionDef(type);
    var keys = def ? Object.keys(def.defaultContent || {}) : [];
    return keys.map(function (k) {
      var f = CONTENT_FIELDS[k] || { label: k.charAt(0).toUpperCase() + k.slice(1), type: 'text' };
      return { key: k, label: f.label, type: f.type };
    });
  }

  var CATEGORIES = [['basic', 'Basic'], ['event', 'Event'], ['media', 'Media'], ['guestinfo', 'Guest Information']];
  var FONTS = ['Cormorant Garamond', 'Playfair Display', 'Inter', 'Georgia', 'Arial'];

  function builderRender() {
    var ev = A.state.currentEvent;
    if (!ev) {
      return '<div class="view"><div class="view-body" style="display:flex;align-items:center;justify-content:center">' +
        '<div class="empty"><div class="empty-ic">' + A.icon('layout') + '</div><h4>No event selected</h4>' +
        '<p>Open a dashboard first, then edit its website.</p>' +
        '<button class="btn btn-accent" onclick="App.navigate(\'#/app\')">Go to dashboard</button></div></div></div>';
    }
    return '<div class="bld-root" data-bld-root>' +
      '<div class="bld-topbar">' +
        '<button class="icon-btn" data-bld-back aria-label="Back to website settings">' + A.icon('arrow-left') + '</button>' +
        '<span class="brand-mark" aria-hidden="true">' + A.icon('heart') + '</span>' +
        '<div class="bld-evname"><div class="cell-strong">' + A.esc(ev.name) + '</div>' +
          '<div class="tiny muted" data-bld-status>Unsaved</div></div>' +
        '<div class="bld-dev" role="group" aria-label="Preview device">' +
          '<button data-dev="desktop" class="active" aria-label="Desktop preview">' + A.icon('monitor') + '</button>' +
          '<button data-dev="tablet" aria-label="Tablet preview">' + A.icon('tablet') + '</button>' +
          '<button data-dev="mobile" aria-label="Mobile preview">' + A.icon('smartphone') + '</button>' +
        '</div>' +
        '<div style="flex:1"></div>' +
        '<button class="btn btn-ghost btn-sm" data-bld-undo>' + A.icon('undo') + ' Undo</button>' +
        '<button class="btn btn-ghost btn-sm" data-bld-theme-toggle>' + A.icon('palette') + ' Theme</button>' +
        '<button class="btn btn-outline btn-sm" data-bld-save>' + A.icon('save') + ' Save</button>' +
        '<span data-bld-pub-slot></span>' +
      '</div>' +
      '<div class="bld-body">' +
        '<aside class="bld-left" data-bld-left></aside>' +
        '<div class="bld-canvas-wrap" data-bld-canvas-wrap>' +
          '<div class="bld-page" data-bld-page></div>' +
        '</div>' +
        '<aside class="bld-right" data-bld-right></aside>' +
      '</div>' +
    '</div>';
  }

  function builderMount() {
    var ev = A.state.currentEvent;
    if (!ev) { A.navigate('#/app'); return; }

    B = {
      ev: ev,
      sections: JSON.parse(JSON.stringify(ev.sections && ev.sections.length ? ev.sections : defaultSections())),
      theme: Object.assign({}, A.DEFAULT_THEME, ev.theme || {}),
      sel: null,
      device: 'desktop',
      leftTab: 'sections',
      hist: [],
      saveT: null,
      subEvents: [],
      cdIv: null,
      saving: false
    };

    var root = A.qs('[data-bld-root]');
    if (!root) return;

    A.api('/api/events/' + ev.id + '/sub-events').then(function (res) {
      B.subEvents = res.subEvents || [];
      renderCanvas();
    }).catch(function () { });

    /* topbar */
    A.qs('[data-bld-back]').addEventListener('click', function () { A.navigate('#/app/website'); });
    A.qs('[data-bld-save]').addEventListener('click', function () { bSave(); });
    A.qs('[data-bld-undo]').addEventListener('click', function () { bUndo(); });
    A.qs('[data-bld-theme-toggle]').addEventListener('click', function () {
      B.leftTab = 'theme';
      renderLeft();
    });
    A.qsa('[data-dev]').forEach(function (b) {
      b.addEventListener('click', function () {
        B.device = b.getAttribute('data-dev');
        A.qsa('[data-dev]').forEach(function (x) { x.classList.toggle('active', x === b); });
        renderCanvas();
      });
    });
    renderPublish();

    /* keyboard undo */
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        bUndo();
      }
    }
    document.addEventListener('keydown', onKey);
    A.addCleanup(function () { document.removeEventListener('keydown', onKey); });
    A.addCleanup(function () {
      if (B && B.saveT) clearTimeout(B.saveT);
      if (B && B.cdIv) clearInterval(B.cdIv);
    });

    /* left pane */
    var left = A.qs('[data-bld-left]');
    left.addEventListener('click', function (e) {
      var tab = e.target.closest('[data-bld-ltab]');
      if (tab) {
        B.leftTab = tab.getAttribute('data-bld-ltab');
        renderLeft();
        return;
      }
      var add = e.target.closest('[data-bld-add]');
      if (add) {
        pushHist();
        var sec = A.createSection(add.getAttribute('data-bld-add'));
        B.sections.push(sec);
        B.sel = sec.id;
        afterChange();
        return;
      }
      var item = e.target.closest('[data-bld-secitem]');
      if (item) {
        var id = item.getAttribute('data-bld-secitem');
        var act = e.target.closest('[data-bld-sact]');
        if (!act) { B.sel = id; renderLeft(); renderRight(); renderCanvas(); return; }
        var a = act.getAttribute('data-bld-sact');
        if (a === 'eye') {
          pushHist();
          B.sections.forEach(function (s) { if (s.id === id) s.visible = s.visible === false; });
          afterChange();
        } else if (a === 'up' || a === 'down') {
          var idx = -1;
          B.sections.forEach(function (s, i) { if (s.id === id) idx = i; });
          var to = a === 'up' ? idx - 1 : idx + 1;
          if (idx !== -1 && to >= 0 && to < B.sections.length) {
            pushHist();
            B.sections = A.reorderSections(B.sections, id, to);
            afterChange();
          }
        } else if (a === 'del') {
          var s2 = null;
          B.sections.forEach(function (s) { if (s.id === id) s2 = s; });
          if (!s2) return;
          A.confirm({
            title: 'Delete section',
            message: 'Remove the <strong>' + A.esc((A.getSectionDef(s2.type) || {}).label || s2.type) + '</strong> section from your page?',
            okLabel: 'Delete', danger: true,
            onOk: function () {
              pushHist();
              B.sections = B.sections.filter(function (s) { return s.id !== id; });
              if (B.sel === id) B.sel = null;
              afterChange();
            }
          });
        }
      }
    });

    /* canvas */
    var page = A.qs('[data-bld-page]');
    var wrapEl = A.qs('[data-bld-canvas-wrap]');
    page.addEventListener('click', function (e) {
      var sec = e.target.closest('[data-bsec]');
      if (!sec) return;
      var changed = B.sel !== sec.getAttribute('data-bsec');
      B.sel = sec.getAttribute('data-bsec');
      if (changed) { renderCanvas(); renderRight(); renderLeft(); }
    });
    page.addEventListener('dblclick', function (e) {
      var sec = e.target.closest('[data-bsec]');
      if (!sec) return;
      B.sel = sec.getAttribute('data-bsec');
      renderCanvas(); renderRight(); renderLeft();
      var first = A.qs('input, textarea, select', A.qs('[data-bld-right]'));
      if (first) first.focus();
    });

    /* right pane (delegated — survives panel re-renders) */
    var right = A.qs('[data-bld-right]');
    function onPanelInput(e) {
      var el = e.target.closest('[data-cf],[data-df],[data-th]');
      if (!el) return;
      var sec = selSection();
      if (el.hasAttribute('data-cf') && sec) {
        pushHist();
        sec.content[el.getAttribute('data-cf')] = el.value;
        bTouch();
      } else if (el.hasAttribute('data-df') && sec) {
        pushHist();
        var k = el.getAttribute('data-df');
        if (k === 'overlay') sec.settings.overlay = Number(el.value);
        else sec.settings[k] = el.value;
        bTouch();
      } else if (el.hasAttribute('data-th')) {
        pushHist();
        B.theme[el.getAttribute('data-th')] = el.type === 'range' ? Number(el.value) : el.value;
        var hex = el.getAttribute('data-thex');
        if (hex) {
          A.qsa('[data-thex="' + hex + '"]').forEach(function (sib) {
            if (sib !== el) sib.value = el.value;
          });
        }
        bTouch();
      }
    }
    right.addEventListener('input', onPanelInput);
    right.addEventListener('change', onPanelInput);

    renderLeft();
    renderRight();
    renderCanvas();
  }

  function defaultSections() {
    return ['hero', 'countdown', 'rsvp', 'footer'].map(function (t) { return A.createSection(t); });
  }

  function selSection() {
    if (!B || !B.sel) return null;
    var out = null;
    B.sections.forEach(function (s) { if (s.id === B.sel) out = s; });
    return out;
  }

  function pushHist() {
    B.hist.push(JSON.stringify({ sections: B.sections, theme: B.theme }));
    if (B.hist.length > 30) B.hist.shift();
  }

  function afterChange() {
    renderLeft();
    renderRight();
    renderCanvas();
    bTouch();
  }

  function bTouch() {
    B.dirty = true;
    setStatus('Unsaved');
    if (B.saveT) clearTimeout(B.saveT);
    B.saveT = setTimeout(function () { bSave(); }, 900);
  }

  function setStatus(txt, cls) {
    var el = A.qs('[data-bld-status]');
    if (el) {
      el.textContent = txt;
      el.className = 'tiny muted' + (cls ? ' ' + cls : '');
    }
  }

  function bSave() {
    if (B.saveT) { clearTimeout(B.saveT); B.saveT = null; }
    if (B.saving) return;
    B.saving = true;
    setStatus('Saving…');
    A.api('/api/events/' + B.ev.id, { method: 'PATCH', body: { sections: B.sections, theme: B.theme } })
      .then(function (res) {
        B.saving = false;
        B.dirty = false;
        B.ev = Object.assign({}, B.ev, res.event);
        A.state.currentEvent = B.ev;
        setStatus('Saved ✓', 'saved');
        renderPublish();
      })
      .catch(function (err) {
        B.saving = false;
        setStatus('Unsaved');
        A.toast(err.message || 'Save failed', 'error');
      });
  }

  function bUndo() {
    if (!B.hist.length) { A.toast('Nothing to undo', 'info'); return; }
    var snap = JSON.parse(B.hist.pop());
    B.sections = snap.sections;
    B.theme = snap.theme;
    renderLeft();
    renderRight();
    renderCanvas();
    bTouch();
  }

  function renderPublish() {
    var slot = A.qs('[data-bld-pub-slot]');
    if (!slot) return;
    var published = B.ev.status === 'published';
    slot.innerHTML = published
      ? '<span class="badge badge-green" style="margin-right:8px">' + A.icon('check') + ' Published</span>' +
        '<button class="btn btn-outline btn-sm" data-bld-unpub>Unpublish</button>'
      : '<button class="btn btn-accent btn-sm" data-bld-pub>' + A.icon('upload') + ' Publish</button>';
    var pub = slot.querySelector('[data-bld-pub]');
    if (pub) pub.addEventListener('click', function () { bPublish('publish'); });
    var un = slot.querySelector('[data-bld-unpub]');
    if (un) un.addEventListener('click', function () { bPublish('unpublish'); });
  }

  function bPublish(action) {
    A.api('/api/events/' + B.ev.id + '/publish', { body: { action: action } }).then(function (res) {
      B.ev = Object.assign({}, B.ev, res.event);
      A.state.currentEvent = B.ev;
      A.toast(action === 'publish' ? 'Event published' : 'Event unpublished');
      renderPublish();
    }).catch(function (err) { A.toast(err.message || 'Failed', 'error'); });
  }

  function renderLeft() {
    var left = A.qs('[data-bld-left]');
    if (!left) return;
    var catNames = {};
    CATEGORIES.forEach(function (c) { catNames[c[0]] = c[1]; });

    var html = '<div class="bld-ltabs">' +
      '<button class="bld-ltab' + (B.leftTab === 'sections' ? ' active' : '') + '" data-bld-ltab="sections">Sections</button>' +
      '<button class="bld-ltab' + (B.leftTab === 'theme' ? ' active' : '') + '" data-bld-ltab="theme">Theme</button>' +
    '</div>';

    if (B.leftTab === 'sections') {
      html += '<div class="bld-left-scroll">' +
        '<div class="bld-list">' +
        B.sections.map(function (s, i) {
          var def = A.getSectionDef(s.type) || { label: s.type, icon: 'layout' };
          var hidden = s.visible === false;
          return '<div class="bld-sec-item' + (B.sel === s.id ? ' sel' : '') + '" data-bld-secitem="' + s.id + '">' +
            '<span class="bld-sec-ic">' + A.icon(def.icon) + '</span>' +
            '<span class="bld-sec-label">' + A.esc(def.label) + '</span>' +
            '<button class="icon-btn sm' + (hidden ? ' dim' : '') + '" data-bld-sact="eye" aria-label="' + (hidden ? 'Show' : 'Hide') + ' section">' + A.icon(hidden ? 'eye-off' : 'eye') + '</button>' +
            '<button class="icon-btn sm" data-bld-sact="up" aria-label="Move up"' + (i === 0 ? ' disabled' : '') + '>' + A.icon('arrow-up') + '</button>' +
            '<button class="icon-btn sm" data-bld-sact="down" aria-label="Move down"' + (i === B.sections.length - 1 ? ' disabled' : '') + '>' + A.icon('arrow-down') + '</button>' +
            '<button class="icon-btn sm" data-bld-sact="del" aria-label="Delete section">' + A.icon('trash') + '</button>' +
          '</div>';
        }).join('') +
        '</div>' +
        '<div class="bld-add-head tiny muted">Add section</div>' +
        CATEGORIES.map(function (cat) {
          var defs = A.SECTION_DEFS.filter(function (d) { return d.category === cat[0]; });
          if (!defs.length) return '';
          return '<div class="bld-cat"><div class="bld-cat-label tiny muted">' + cat[1] + '</div>' +
            '<div class="bld-add-grid">' + defs.map(function (d) {
              return '<button class="bld-add-btn" data-bld-add="' + d.type + '" title="' + A.esc(d.description || d.label) + '">' +
                A.icon(d.icon) + '<span>' + A.esc(d.label) + '</span></button>';
            }).join('') + '</div></div>';
        }).join('') +
      '</div>';
    } else {
      var t = B.theme;
      html += '<div class="bld-left-scroll">' +
        themeControls(t) +
      '</div>';
    }
    left.innerHTML = html;
  }

  function themeControls(t) {
    function colorRow(key, label) {
      return '<div class="th-row"><label class="label">' + label + '</label>' +
        '<div class="th-color"><input type="color" class="color-input" value="' + A.esc(t[key] || '#000000') + '" data-th="' + key + '" data-thex="' + key + '" aria-label="' + label + ' color">' +
        '<input class="input input-sm" value="' + A.esc(t[key] || '') + '" data-th="' + key + '" data-thex="' + key + '" aria-label="' + label + ' hex"></div></div>';
    }
    return '' +
      '<div class="bld-cat"><div class="bld-cat-label tiny muted">Colors</div>' +
        colorRow('primary', 'Primary') + colorRow('secondary', 'Secondary') +
        colorRow('text', 'Text') + colorRow('background', 'Background') +
      '</div>' +
      '<div class="bld-cat"><div class="bld-cat-label tiny muted">Typography</div>' +
        '<div class="field"><label class="label">Heading font</label><select class="select" data-th="headingFont">' +
          FONTS.map(function (f) { return '<option' + (t.headingFont === f ? ' selected' : '') + '>' + f + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label class="label">Body font</label><select class="select" data-th="bodyFont">' +
          FONTS.map(function (f) { return '<option' + (t.bodyFont === f ? ' selected' : '') + '>' + f + '</option>'; }).join('') + '</select></div>' +
      '</div>' +
      '<div class="bld-cat"><div class="bld-cat-label tiny muted">Buttons & shape</div>' +
        '<div class="field"><label class="label">Button style</label><select class="select" data-th="buttonStyle">' +
          ['rounded', 'square', 'pill'].map(function (b) { return '<option value="' + b + '"' + (t.buttonStyle === b ? ' selected' : '') + '>' + b + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label class="label">Corner radius <span class="tiny muted" data-th-radval>' + (t.borderRadius || 0) + 'px</span></label>' +
          '<input type="range" min="0" max="24" step="1" value="' + (t.borderRadius || 0) + '" data-th="borderRadius" class="range" aria-label="Corner radius"></div>' +
        '<div class="field"><label class="label">Section spacing <span class="tiny muted" data-th-spval>' + (t.spacing || 1) + '×</span></label>' +
          '<input type="range" min="0.75" max="1.5" step="0.25" value="' + (t.spacing || 1) + '" data-th="spacing" class="range" aria-label="Section spacing"></div>' +
      '</div>';
  }

  function renderRight() {
    var right = A.qs('[data-bld-right]');
    if (!right) return;
    var sec = selSection();
    if (!sec) {
      right.innerHTML = '<div class="bld-right-empty">' +
        '<div class="empty-ic">' + A.icon('panel-bottom') + '</div>' +
        '<h4 class="small" style="font-weight:700">No section selected</h4>' +
        '<p class="tiny muted">Click a section on the canvas to edit its content and design.</p></div>';
      return;
    }
    var def = A.getSectionDef(sec.type) || { label: sec.type };
    var st = sec.settings || {};
    var hasBgImage = !!st.bgImage;
    right.innerHTML =
      '<div class="bld-right-head"><span class="badge badge-accent">' + A.icon('pencil') + ' Section</span>' +
        '<div class="cell-strong" style="margin-top:6px">' + A.esc(def.label) + '</div></div>' +
      '<div class="bld-right-scroll">' +
        '<div class="bld-cat"><div class="bld-cat-label tiny muted">Content</div>' +
          defFields(sec.type).map(function (f) {
            var val = sec.content && sec.content[f.key] != null ? sec.content[f.key] : '';
            if (f.type === 'textarea') {
              return '<div class="field"><label class="label">' + f.label + '</label>' +
                '<textarea class="textarea" data-cf="' + f.key + '" style="min-height:70px">' + A.esc(val) + '</textarea></div>';
            }
            return '<div class="field"><label class="label">' + f.label + '</label>' +
              '<input class="input" data-cf="' + f.key + '" value="' + A.esc(val) + '"></div>';
          }).join('') +
        '</div>' +
        '<div class="bld-cat"><div class="bld-cat-label tiny muted">Design</div>' +
          '<div class="form-grid">' +
            '<div class="field"><label class="label">Padding</label><select class="select" data-df="padding">' +
              ['sm', 'md', 'lg'].map(function (p) { return '<option value="' + p + '"' + ((st.padding || 'md') === p ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></div>' +
            '<div class="field"><label class="label">Align</label><select class="select" data-df="align">' +
              ['center', 'left'].map(function (p) { return '<option value="' + p + '"' + ((st.align || 'center') === p ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></div>' +
          '</div>' +
          '<div class="field"><label class="label">Background color</label>' +
            '<input type="color" class="color-input" value="' + A.esc(st.bg || '#FFFFFF') + '" data-df="bg" aria-label="Section background"></div>' +
          '<div class="field"><label class="label">Background image URL</label>' +
            '<input class="input" data-df="bgImage" value="' + A.esc(st.bgImage || '') + '" placeholder="https://… or /images/…"></div>' +
          '<div class="field" data-overlay-wrap style="display:' + (hasBgImage ? 'block' : 'none') + '">' +
            '<label class="label">Overlay darkness <span class="tiny muted" data-ov-val>' + (st.overlay != null ? st.overlay : 38) + '%</span></label>' +
            '<input type="range" min="0" max="100" value="' + (st.overlay != null ? st.overlay : 38) + '" data-df="overlay" class="range" aria-label="Overlay darkness"></div>' +
        '</div>' +
      '</div>';
  }

  /* ---------------- builder canvas: real section previews ---------------- */

  function btnRadius(theme) {
    return theme.buttonStyle === 'pill' ? '99px' : theme.buttonStyle === 'square' ? '0px' : (theme.borderRadius || 8) + 'px';
  }

  function secWrap(s, theme, inner, extraStyle) {
    var st = s.settings || {};
    var pad = { sm: 28, md: 56, lg: 96 }[st.padding || 'md'] * (theme.spacing || 1);
    var style = 'padding:' + Math.round(pad) + 'px ' + Math.round(pad * 0.8) + 'px;text-align:' + (st.align || 'center') + ';' + (extraStyle ? extraStyle.replace(/;?$/, ';') : '');
    if (st.bg) style += 'background:' + st.bg + ';';
    if (st.bgImage) {
      var ov = (st.overlay != null ? st.overlay : 38) / 100;
      style += 'background-image:linear-gradient(rgba(0,0,0,' + ov + '),rgba(0,0,0,' + ov + ')),url(' + st.bgImage + ');background-size:cover;background-position:center;';
    }
    return '<div class="bld-sec' + (B.sel === s.id ? ' sel' : '') + '" data-bsec="' + s.id + '" style="' + style + '">' + inner + '</div>';
  }

  function h(style, text) {
    return '<h2 style="font-family:\'' + B.theme.headingFont + '\',serif;' + (style || '') + '">' + A.esc(text || '') + '</h2>';
  }

  function renderSectionFull(s, theme, ev) {
    var c = s.content || {};
    var t = theme;
    switch (s.type) {
      case 'hero': {
        var st = s.settings || {};
        var dark = st.bgImage ? '#fff' : t.text;
        var inner =
          '<div style="display:flex;flex-direction:column;align-items:center;gap:14px;min-height:340px;justify-content:center;color:' + dark + '">' +
            h('font-size:44px;font-weight:600;line-height:1.05;letter-spacing:-.01em', c.heading) +
            '<p style="font-size:17px;opacity:.85">' + A.esc(c.subheading || '') + '</p>' +
            '<p style="font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:600">' + A.esc(c.dateText || '') +
              (c.locationText ? ' · ' + A.esc(c.locationText) : '') + '</p>' +
            (c.buttonText ? '<span style="display:inline-block;background:' + t.primary + ';color:#fff;padding:13px 30px;border-radius:' + btnRadius(t) + ';font-weight:600;font-size:14.5px">' + A.esc(c.buttonText) + '</span>' : '') +
          '</div>';
        return secWrap(s, t, inner, st.bgImage ? 'color:#fff' : '');
      }
      case 'countdown': {
        var boxes = [[ '--', 'Days' ], [ '--', 'Hours' ], [ '--', 'Minutes' ], [ '--', 'Seconds' ]];
        var inner2 = h('font-size:26px;font-weight:600', c.heading) +
          '<div class="bld-cd" data-bcd data-bcd-date="' + A.esc(ev.eventDate || '') + 'T' + A.esc(ev.startTime || '00:00') + ':00" style="display:flex;gap:12px;justify-content:center;margin-top:18px">' +
          boxes.map(function (b) {
            return '<div class="bld-cd-box" style="background:' + t.secondary + ';color:' + t.primary + ';border-radius:' + btnRadius(t) + '">' +
              '<div class="bld-cd-num">' + b[0] + '</div><div class="bld-cd-lab">' + b[1] + '</div></div>';
          }).join('') + '</div>';
        return secWrap(s, t, inner2);
      }
      case 'details': {
        var cells = [
          ['calendar', 'Date', A.fmtDate(ev.eventDate)],
          ['clock', 'Time', A.fmtTime(ev.startTime) + (ev.endTime ? ' – ' + A.fmtTime(ev.endTime) : '')],
          ['map-pin', 'Venue', ev.venue || 'TBA'],
          ['star', 'Address', ev.address || ev.venue || '—']
        ];
        var inner3 = h('font-size:26px;font-weight:600', c.heading) +
          (c.note ? '<p class="small muted" style="margin-top:6px">' + A.esc(c.note) + '</p>' : '') +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:22px;max-width:560px;margin-left:auto;margin-right:auto">' +
          cells.map(function (cell) {
            return '<div style="background:' + t.secondary + ';border-radius:14px;padding:18px 14px;display:flex;flex-direction:column;align-items:center;gap:6px">' +
              '<span style="color:' + t.primary + '">' + A.icon(cell[0]) + '</span>' +
              '<span class="tiny" style="letter-spacing:.08em;text-transform:uppercase;opacity:.6;font-weight:700">' + cell[1] + '</span>' +
              '<span class="small" style="font-weight:600">' + A.esc(cell[2]) + '</span></div>';
          }).join('') + '</div>';
        return secWrap(s, t, inner3);
      }
      case 'schedule': {
        var rows = (B.subEvents || []);
        var inner4 = h('font-size:26px;font-weight:600', c.heading) +
          '<div style="max-width:560px;margin:20px auto 0;text-align:left">' +
          (rows.length ? rows.map(function (se) {
            return '<div style="display:flex;gap:14px;padding:13px 0;border-bottom:1px solid rgba(0,0,0,.08)">' +
              '<span class="dot" style="background:' + t.primary + ';margin-top:7px"></span>' +
              '<div><div class="cell-strong small">' + A.esc(se.name) + '</div>' +
              '<div class="tiny muted">' + A.fmtDateShort(se.date) + (se.startTime ? ' · ' + A.fmtTime(se.startTime) : '') + (se.venue ? ' · ' + A.esc(se.venue) : '') + '</div></div></div>';
          }).join('') : '<p class="small muted" style="text-align:center">Add sub-events to build your schedule.</p>') + '</div>';
        return secWrap(s, t, inner4);
      }
      case 'gallery': {
        var imgs = (ev.gallery || []);
        if (!imgs.length) imgs = [{ url: '/images/wedding-gallery-1.jpg' }, { url: '/images/wedding-gallery-2.jpg' }, { url: '/images/wedding-gallery-3.jpg' }, { url: '/images/wedding-gallery-4.jpg' }];
        var inner5 = h('font-size:26px;font-weight:600', c.heading) +
          (c.subtitle ? '<p class="small muted">' + A.esc(c.subtitle) + '</p>' : '') +
          '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:20px;max-width:640px;margin-left:auto;margin-right:auto">' +
          imgs.slice(0, 6).map(function (g) {
            return '<div style="aspect-ratio:1;border-radius:12px;background:#ECEAE3 url(' + A.esc(g.url || '') + ') center/cover"></div>';
          }).join('') + '</div>';
        return secWrap(s, t, inner5);
      }
      case 'story': {
        var img = c.image || ev.description && '/images/wedding-story.jpg' || '/images/wedding-story.jpg';
        var inner6 = '<div style="display:flex;gap:28px;align-items:center;max-width:640px;margin:0 auto;text-align:left;flex-wrap:wrap">' +
          '<div style="flex:1;min-width:220px;aspect-ratio:4/3;border-radius:16px;background:#ECEAE3 url(' + A.esc(img) + ') center/cover"></div>' +
          '<div style="flex:1.2;min-width:220px">' + h('font-size:28px;font-weight:600', c.heading) +
          '<p style="margin-top:10px;opacity:.8;line-height:1.7">' + A.esc(c.body || '') + '</p></div></div>';
        return secWrap(s, t, inner6);
      }
      case 'map': {
        var inner7 = h('font-size:26px;font-weight:600', c.heading) +
          '<div style="margin-top:18px;border-radius:16px;background:' + t.secondary + ';padding:44px 20px;display:flex;flex-direction:column;align-items:center;gap:8px;color:' + t.primary + '">' +
          A.icon('map-pin') + '<div class="small" style="font-weight:600;color:' + t.text + '">' + A.esc(ev.venue || 'Venue address') + '</div>' +
          '<div class="tiny muted">' + A.esc(ev.address || '') + '</div></div>';
        return secWrap(s, t, inner7);
      }
      case 'accommodation': {
        var accs = (ev.accommodations || []);
        var inner8 = h('font-size:26px;font-weight:600', c.heading) +
          (c.subtitle ? '<p class="small muted">' + A.esc(c.subtitle) + '</p>' : '') +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:20px">' +
          (accs.length ? accs.map(function (a) {
            return '<div style="border:1px solid rgba(0,0,0,.08);border-radius:14px;padding:18px;text-align:left">' +
              '<div style="color:' + t.primary + '">' + A.icon('building') + '</div>' +
              '<div class="cell-strong small" style="margin-top:8px">' + A.esc(a.name) + '</div>' +
              '<div class="tiny muted">' + A.esc(a.distance || '') + (a.price ? ' · from ' + A.esc(a.price) : '') + '</div>' +
              (a.description ? '<p class="tiny muted" style="margin-top:6px">' + A.esc(a.description) + '</p>' : '') + '</div>';
          }).join('') : '<p class="small muted">Add accommodations from the event data.</p>') + '</div>';
        return secWrap(s, t, inner8);
      }
      case 'registry': {
        var regs = (ev.registryItems || []);
        var inner9 = h('font-size:26px;font-weight:600', c.heading) +
          (c.subtitle ? '<p class="small muted">' + A.esc(c.subtitle) + '</p>' : '') +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:20px">' +
          (regs.length ? regs.map(function (r) {
            var pct = r.target ? Math.min(100, Math.round((r.raised / r.target) * 100)) : 0;
            return '<div style="border:1px solid rgba(0,0,0,.08);border-radius:14px;padding:18px;text-align:left">' +
              '<div style="color:' + t.primary + '">' + A.icon('gift') + '</div>' +
              '<div class="cell-strong small" style="margin-top:8px">' + A.esc(r.name) + '</div>' +
              '<div class="tiny muted">' + A.esc(r.description || '') + '</div>' +
              '<div class="progress" style="margin-top:10px"><span style="width:' + pct + '%;background:' + t.primary + '"></span></div>' +
              '<div class="tiny muted" style="margin-top:5px">' + A.money(r.raised || 0) + ' of ' + A.money(r.target || 0) + '</div></div>';
          }).join('') : '<p class="small muted">Add registry items from the event data.</p>') + '</div>';
        return secWrap(s, t, inner9);
      }
      case 'rsvp': {
        var inner10 =
          '<div style="background:' + t.secondary + ';border-radius:18px;padding:' + Math.round(48 * (t.spacing || 1)) + 'px 24px">' +
            h('font-size:30px;font-weight:600', c.heading) +
            '<p class="small" style="opacity:.75;margin-top:6px">' + A.esc(c.subtitle || '') + '</p>' +
            '<span style="display:inline-block;margin-top:16px;background:' + t.primary + ';color:#fff;padding:13px 32px;border-radius:' + btnRadius(t) + ';font-weight:600">' + A.esc(c.buttonText || 'RSVP Now') + '</span>' +
          '</div>';
        return secWrap(s, t, inner10);
      }
      case 'text': {
        var inner11 = h('font-size:28px;font-weight:600', c.heading) +
          '<p style="max-width:560px;margin:12px auto 0;opacity:.8;line-height:1.75">' + A.esc(c.body || '') + '</p>';
        return secWrap(s, t, inner11);
      }
      case 'contact': {
        var inner12 = h('font-size:24px;font-weight:600', c.heading) +
          '<div style="display:flex;gap:22px;justify-content:center;flex-wrap:wrap;margin-top:14px">' +
          (c.email ? '<span class="small" style="display:inline-flex;gap:7px;align-items:center;color:' + t.primary + '">' + A.icon('mail') + A.esc(c.email) + '</span>' : '') +
          (c.phone ? '<span class="small" style="display:inline-flex;gap:7px;align-items:center;color:' + t.primary + '">' + A.icon('phone') + A.esc(c.phone) + '</span>' : '') +
          (ev.contactEmail && !c.email ? '<span class="small" style="display:inline-flex;gap:7px;align-items:center;color:' + t.primary + '">' + A.icon('mail') + A.esc(ev.contactEmail) + '</span>' : '') +
          '</div>';
        return secWrap(s, t, inner12);
      }
      case 'divider':
        return secWrap(s, t, '<div style="height:1px;background:rgba(0,0,0,.14);max-width:220px;margin:0 auto"></div>');
      case 'footer': {
        var inner13 = '<div style="text-align:center">' +
          '<div class="small" style="opacity:.92">' + A.esc(c.text || '') + '</div>' +
          '<div class="tiny" style="opacity:.55;margin-top:6px">Powered by Online RSVP</div></div>';
        return '<div class="bld-sec' + (B.sel === s.id ? ' sel' : '') + '" data-bsec="' + s.id + '" style="background:' + t.primary + ';color:#fff;padding:30px 20px;text-align:center">' + inner13 + '</div>';
      }
      default:
        return secWrap(s, t, '<p class="small muted">Unknown section type: ' + A.esc(s.type) + '</p>');
    }
  }

  function renderCanvas() {
    var page = A.qs('[data-bld-page]');
    if (!page || !B) return;
    if (B.cdIv) { clearInterval(B.cdIv); B.cdIv = null; }
    var t = B.theme;
    page.setAttribute('data-device', B.device);
    page.style.background = t.background;
    page.style.color = t.text;
    page.style.fontFamily = "'" + t.bodyFont + "', sans-serif";
    page.innerHTML = B.sections.filter(function (s) { return s.visible !== false; })
      .map(function (s) { return renderSectionFull(s, t, B.ev); }).join('') ||
      '<div style="padding:80px 20px;text-align:center" class="muted">No visible sections — add one from the left panel.</div>';

    /* live countdown in canvas */
    var cd = page.querySelector('[data-bcd]');
    var cdTarget = cd ? new Date(cd.getAttribute('data-bcd-date')).getTime() : NaN;
    if (cd && !isNaN(cdTarget)) {
      var target = cdTarget;
      var nums = cd.querySelectorAll('.bld-cd-num');
      function tick() {
        var diff = Math.max(0, target - Date.now());
        var vals = [
          Math.floor(diff / 86400000),
          Math.floor((diff % 86400000) / 3600000),
          Math.floor((diff % 3600000) / 60000),
          Math.floor((diff % 60000) / 1000)
        ];
        for (var i = 0; i < nums.length && i < 4; i++) nums[i].textContent = vals[i] < 10 ? '0' + vals[i] : String(vals[i]);
      }
      tick();
      B.cdIv = setInterval(tick, 1000);
    }
  }

  A.views.builder = { render: builderRender, mount: builderMount };

})();
