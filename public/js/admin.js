/* ============================================================
   Online RSVP — admin.js
   App.views.admin — super-admin panel (hash #/admin).
   Extends window.App (app.js). No imports, no frameworks.
   Endpoint:
     GET /api/admin/stats → { stats, recentUsers, recentEvents, trend }
       stats: { users, events, publishedEvents, rsvps, revenue,
                paymentsCount, templates, emailsSent, activeDomains, storageGb }
       trend: [{ week, users, events }] (12 weeks)
   Also: GET /api/templates → { templates: TemplateRecord[] }
   ============================================================ */
'use strict';

(function () {
  var esc = function (s) { return App.esc(s); };

  /* ---------------- Module state ---------------- */
  var adm = {
    tab: 'dashboard',
    stats: null,        // full response body
    loading: true,
    denied: false,      // 403 from API while signed in
    err: null,
    templates: null,    // TemplateRecord[] | null
    tplLoading: false,
    tplFailed: false,
    userSearch: '',
    flags: { registrations: true, maintenance: false }
  };

  var NAV = [
    ['dashboard', 'Dashboard', 'bar-chart'],
    ['users', 'Users', 'users'],
    ['events', 'Events', 'calendar-days'],
    ['templates', 'Templates', 'palette'],
    ['payments', 'Payments', 'credit-card'],
    ['emails', 'Emails', 'mail'],
    ['reports', 'Reports', 'trending-up'],
    ['settings', 'Settings', 'settings']
  ];

  // Fallback swatches (matches seeded templates) if /api/templates is unavailable.
  var FALLBACK_TEMPLATES = [
    { name: 'Eucalyptus', category: 'Wedding', style: 'Botanical', featured: true, tags: ['greenery', 'elegant'], theme: { primary: '#7C8A6E', secondary: '#F2F4EE' } },
    { name: 'Modern Minimal', category: 'Wedding', style: 'Minimal', featured: false, tags: ['clean', 'modern'], theme: { primary: '#181816', secondary: '#F5F5F2' } },
    { name: 'White Rose', category: 'Wedding', style: 'Romantic', featured: true, tags: ['floral', 'soft'], theme: { primary: '#B98A8E', secondary: '#FBF4F2' } },
    { name: 'Luxury Gold', category: 'Wedding', style: 'Luxury', featured: false, tags: ['gold', 'dark'], theme: { primary: '#C9A96A', secondary: '#1C1A17' } },
    { name: 'Golden Hour', category: 'Birthday', style: 'Warm', featured: false, tags: ['party', 'sunset'], theme: { primary: '#C97B2D', secondary: '#FDF6EC' } },
    { name: 'Little Star', category: 'Baby', style: 'Playful', featured: false, tags: ['baby', 'cute'], theme: { primary: '#A38FB8', secondary: '#F7F4FB' } },
    { name: 'Summit', category: 'Corporate', style: 'Corporate', featured: false, tags: ['conference', 'pro'], theme: { primary: '#2F6B4F', secondary: '#F0F4F1' } },
    { name: 'Midnight Gala', category: 'Party', style: 'Dramatic', featured: true, tags: ['gala', 'evening'], theme: { primary: '#B85C5C', secondary: '#1A1517' } }
  ];

  function cssColor(v, fb) {
    var s = String(v == null ? '' : v).replace(/["'`<>{};\\]/g, '').trim();
    return s || fb;
  }

  /* ---------------- Badges ---------------- */
  function roleBadge(role) {
    return role === 'admin'
      ? '<span class="badge badge-red">' + App.icon('shield') + ' Admin</span>'
      : '<span class="badge badge-neutral">User</span>';
  }
  function statusBadge(status) {
    switch (status) {
      case 'published': return '<span class="badge badge-green">Published</span>';
      case 'paused': return '<span class="badge badge-amber">Paused</span>';
      case 'archived': return '<span class="badge badge-muted">Archived</span>';
      default: return '<span class="badge badge-neutral">Draft</span>';
    }
  }

  /* ---------------- Guard ---------------- */
  function isAdmin() {
    return !!App.state.user && App.state.user.role === 'admin';
  }

  function guardCard(title, msgHtml) {
    return '<div class="adm-root"><div class="adm-guard"><div class="card adm-guard-card">' +
      '<div class="empty" style="max-width:none">' +
        '<div class="adm-guard-ic">' + App.icon('shield') + '</div>' +
        '<h4>' + esc(title) + '</h4>' +
        '<p>' + msgHtml + '</p>' +
        '<button class="btn btn-accent" data-adm-home style="margin-top:14px">Back to home</button>' +
      '</div></div></div></div>';
  }

  /* ---------------- Shell ---------------- */
  function shellHtml() {
    return '<div class="adm-root">' +
      '<header class="adm-top">' +
        '<a href="#/" class="adm-brand" aria-label="Online RSVP home"><span class="adm-brand-mark">' + App.icon('heart') + '</span><span>Online RSVP</span></a>' +
        '<span class="adm-top-sep" aria-hidden="true"></span>' +
        '<span class="adm-top-title">Platform Administration</span>' +
        '<span class="badge badge-red adm-admin-badge">' + App.icon('shield') + ' ADMIN</span>' +
        '<span class="adm-top-spacer"></span>' +
        '<button class="btn btn-outline btn-sm" data-adm-exit>' + App.icon('log-out') + ' Exit</button>' +
      '</header>' +
      '<div class="adm-layout">' +
        '<nav class="adm-side" aria-label="Admin sections">' + NAV.map(function (n) {
          return '<button class="adm-nav-item' + (adm.tab === n[0] ? ' active' : '') + '" data-adm-tab="' + n[0] + '">' + App.icon(n[2]) + ' <span>' + n[1] + '</span></button>';
        }).join('') + '</nav>' +
        '<main class="adm-content" data-adm-content>' + contentHtml() + '</main>' +
      '</div>' +
    '</div>';
  }

  /* ---------------- Content sections ---------------- */
  function kpi(ic, label, value, sub) {
    return '<div class="card stat-card">' +
      '<div class="adm-kpi-top"><span class="adm-kpi-ic">' + App.icon(ic) + '</span><span class="stat-label">' + esc(label) + '</span></div>' +
      '<div class="stat-value">' + esc(String(value)) + '</div>' +
      '<div class="stat-sub">' + esc(sub) + '</div>' +
    '</div>';
  }

  function skeletonContent() {
    return '<div class="adm-kpis">' +
        '<div class="skeleton adm-sk-card" style="height:104px"></div>' +
        '<div class="skeleton adm-sk-card" style="height:104px"></div>' +
        '<div class="skeleton adm-sk-card" style="height:104px"></div>' +
        '<div class="skeleton adm-sk-card" style="height:104px"></div>' +
      '</div>' +
      '<div class="adm-grid-2">' +
        '<div class="skeleton" style="height:230px;border-radius:12px"></div>' +
        '<div class="skeleton" style="height:230px;border-radius:12px"></div>' +
      '</div>' +
      '<div class="skeleton" style="height:180px;border-radius:12px"></div>';
  }

  function errorContent() {
    return '<div class="card"><div class="empty" style="padding:56px 20px">' +
      '<div class="empty-ic">' + App.icon('alert') + '</div>' +
      '<h4>Could not load platform stats</h4>' +
      '<p>' + esc(adm.err || 'Unexpected error') + '</p>' +
      '<button class="btn btn-accent" data-adm-retry>' + App.icon('refresh') + ' Try again</button>' +
    '</div></div>';
  }

  function deniedContent() {
    return '<div class="card"><div class="empty" style="padding:56px 20px">' +
      '<div class="empty-ic">' + App.icon('shield') + '</div>' +
      '<h4>Sign in as an admin</h4>' +
      '<p>Your current session does not have platform administrator rights.</p>' +
      '<div class="hint">Demo admin — admin@onlinersvp.com / admin1234</div>' +
      '<button class="btn btn-accent" data-adm-home style="margin-top:14px">Back to home</button>' +
    '</div></div>';
  }

  function usersTable(list) {
    return '<table class="table"><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>' +
      (list || []).map(function (u) {
        return '<tr>' +
          '<td><div class="adm-cell-user">' + App.avatarHtml(u.name, 'sm') + '<span class="cell-strong">' + esc(u.name) + '</span></div></td>' +
          '<td class="muted">' + esc(u.email) + '</td>' +
          '<td>' + roleBadge(u.role) + '</td>' +
          '<td class="muted">' + esc(App.fmtDateShort(u.createdAt)) + '</td>' +
        '</tr>';
      }).join('') + '</tbody></table>';
  }

  function ownerName(ownerId) {
    var ru = (adm.stats && adm.stats.recentUsers) || [];
    for (var i = 0; i < ru.length; i++) {
      if (ru[i].id === ownerId) return ru[i].name;
    }
    return '—';
  }

  function eventsTable(list) {
    return '<table class="table"><thead><tr><th>Event</th><th>Owner</th><th>Status</th><th>Guests</th><th>Created</th><th></th></tr></thead><tbody>' +
      (list || []).map(function (e) {
        return '<tr>' +
          '<td class="cell-strong">' + esc(e.name) + '</td>' +
          '<td class="muted">' + esc(ownerName(e.ownerId)) + '</td>' +
          '<td>' + statusBadge(e.status) + '</td>' +
          '<td>' + Number(e.guestCount || 0) + '</td>' +
          '<td class="muted">' + esc(App.fmtDateShort(e.createdAt)) + '</td>' +
          '<td>' + (e.slug
            ? '<button class="icon-btn sm" data-adm-site="' + esc(e.slug) + '" aria-label="View public site" title="View public site">' + App.icon('external-link') + '</button>'
            : '') + '</td>' +
        '</tr>';
      }).join('') + '</tbody></table>';
  }

  function filteredUsers() {
    var q = adm.userSearch.trim().toLowerCase();
    var list = (adm.stats && adm.stats.recentUsers) || [];
    if (!q) return list;
    return list.filter(function (u) {
      return (String(u.name) + ' ' + String(u.email)).toLowerCase().indexOf(q) >= 0;
    });
  }

  function dashboardHtml() {
    var s = (adm.stats && adm.stats.stats) || {};
    var recentUsers = (adm.stats && adm.stats.recentUsers) || [];
    var recentEvents = (adm.stats && adm.stats.recentEvents) || [];
    return '<div class="adm-page-head"><h2>Dashboard</h2><p class="muted small">Platform-wide overview — live from the database.</p></div>' +
      '<div class="adm-kpis">' +
        kpi('users', 'Total users', s.users || 0, '+1 this week · static demo delta') +
        kpi('calendar-days', 'Active events', s.publishedEvents || 0, 'of ' + (s.events || 0) + ' total events') +
        kpi('mail-check', 'Total RSVPs', s.rsvps || 0, 'confirmed attendances') +
        kpi('wallet', 'Revenue', App.money(s.revenue || 0), (s.paymentsCount || 0) + ' transactions') +
      '</div>' +
      '<div class="adm-grid-2">' +
        '<div class="card card-pad"><div class="adm-card-head"><h4>New users</h4><span class="badge badge-neutral">12 weeks</span></div><div class="adm-chart" data-chart-users></div></div>' +
        '<div class="card card-pad"><div class="adm-card-head"><h4>Events created</h4><span class="badge badge-neutral">12 weeks</span></div><div class="adm-chart-bars" data-chart-events></div></div>' +
      '</div>' +
      '<div class="adm-grid-2">' +
        '<div class="card card-pad"><div class="adm-card-head"><h4>Recent users</h4><span class="muted tiny">latest 6</span></div>' +
          '<div class="adm-table-wrap">' + (recentUsers.length ? usersTable(recentUsers) : '<p class="muted small" style="padding:16px">No users yet.</p>') + '</div></div>' +
        '<div class="card card-pad"><div class="adm-card-head"><h4>Recent events</h4><span class="muted tiny">latest 6</span></div>' +
          '<div class="adm-table-wrap">' + (recentEvents.length ? eventsTable(recentEvents) : '<p class="muted small" style="padding:16px">No events yet.</p>') + '</div></div>' +
      '</div>';
  }

  function usersHtml() {
    var s = (adm.stats && adm.stats.stats) || {};
    var list = filteredUsers();
    return '<div class="adm-page-head"><h2>Users</h2><p class="muted small">Registered accounts on the platform.</p></div>' +
      '<div class="card card-pad">' +
        '<div class="field" style="max-width:340px"><label class="label" for="adm-user-search">Search users</label>' +
        '<input class="input" id="adm-user-search" type="search" placeholder="Name or email…" value="' + esc(adm.userSearch) + '"></div>' +
        '<div class="adm-table-wrap" style="margin-top:12px" data-user-table>' +
          (list.length ? usersTable(list) : '<p class="muted small" style="padding:16px">No users match your search.</p>') +
        '</div>' +
        '<p class="tiny muted" style="margin-top:10px" data-user-count>' + list.length + ' shown · latest ' + ((adm.stats && adm.stats.recentUsers) || []).length + ' of ' + (s.users || 0) + ' registered users</p>' +
      '</div>';
  }

  function eventsHtml() {
    var list = (adm.stats && adm.stats.recentEvents) || [];
    return '<div class="adm-page-head"><h2>Events</h2><p class="muted small">Latest events across the platform.</p></div>' +
      '<div class="card card-pad">' +
        '<div class="adm-table-wrap">' +
          (list.length ? eventsTable(list) : '<p class="muted small" style="padding:16px">No events created yet.</p>') +
        '</div>' +
        '<p class="tiny muted" style="margin-top:10px">Status: published = live · draft = hidden · paused = temporarily offline · archived = closed.</p>' +
      '</div>';
  }

  function templatesHtml() {
    var list = adm.templates || FALLBACK_TEMPLATES;
    var rows = list.map(function (t) {
      var th = t.theme || {};
      return '<div class="adm-tpl-row">' +
        '<span class="adm-swatch" style="background:' + cssColor(th.primary, '#E7E5DF') + '" aria-hidden="true"><span style="background:' + cssColor(th.secondary, '#FFFFFF') + '"></span></span>' +
        '<div class="adm-tpl-info"><span class="cell-strong">' + esc(t.name) + '</span>' +
          '<span class="tiny muted">' + ((t.tags || []).slice(0, 3).map(esc).join(' · ') || '—') + '</span></div>' +
        '<span class="badge badge-neutral">' + esc(t.category || '—') + '</span>' +
        '<span class="badge badge-accent">' + esc(t.style || '—') + '</span>' +
        (t.featured ? '<span class="badge badge-amber">' + App.icon('star') + ' Featured</span>' : '') +
      '</div>';
    }).join('');
    return '<div class="adm-page-head"><h2>Templates</h2><p class="muted small">' + list.length + ' published designs available to all users.</p></div>' +
      '<div class="card card-pad">' +
        '<div class="adm-tpl-list">' + rows + '</div>' +
        '<div class="adm-note" style="margin-top:14px">' + App.icon('info') + '<span>Templates are managed by the platform team — they are read-only in this build.</span></div>' +
      '</div>';
  }

  function paymentsHtml() {
    var s = (adm.stats && adm.stats.stats) || {};
    var avg = s.paymentsCount ? (Number(s.revenue) || 0) / s.paymentsCount : 0;
    return '<div class="adm-page-head"><h2>Payments</h2><p class="muted small">Transaction volume across all events.</p></div>' +
      '<div class="adm-kpis adm-kpis-2">' +
        kpi('wallet', 'Total revenue', App.money(s.revenue || 0), 'all events, all time') +
        kpi('credit-card', 'Transactions', s.paymentsCount || 0, 'simulated gateway') +
        kpi('trending-up', 'Average value', App.money(Math.round(avg * 100) / 100), 'per transaction') +
        kpi('activity', 'RSVP-driven', s.rsvps || 0, 'confirmed attendances') +
      '</div>' +
      '<div class="adm-note">' + App.icon('info') + '<span>These are demo transactions — payment processing is simulated in this build.</span></div>';
  }

  function emailsHtml() {
    var s = (adm.stats && adm.stats.stats) || {};
    var sent = Number(s.emailsSent) || 0;
    var gb = Number(s.storageGb) || 0;
    var pct = Math.min(100, Math.round(gb));
    return '<div class="adm-page-head"><h2>Emails</h2><p class="muted small">Delivery and media storage at a glance.</p></div>' +
      '<div class="adm-kpis adm-kpis-2">' +
        '<div class="card stat-card"><span class="stat-label">Emails sent</span><div class="stat-value adm-big-num">' + sent.toLocaleString('en-US') + '</div><div class="stat-sub">platform-wide, all time</div></div>' +
        '<div class="card stat-card"><span class="stat-label">Media storage</span>' +
          '<div style="margin:8px 0 6px"><div class="progress" style="height:10px"><span style="width:' + pct + '%"></span></div></div>' +
          '<div class="stat-sub">' + gb + ' GB of 100 GB used</div></div>' +
      '</div>' +
      '<div class="adm-note">' + App.icon('info') + '<span>Email delivery is simulated in this build — campaigns track sent/opened/clicked stats locally.</span></div>';
  }

  function reportsHtml() {
    var s = (adm.stats && adm.stats.stats) || {};
    var events = Number(s.events) || 0;
    var pubPct = events ? Math.round(((Number(s.publishedEvents) || 0) / events) * 100) : 0;
    var storagePct = Math.min(100, Math.round(Number(s.storageGb) || 0));
    var domains = Number(s.activeDomains) || 0;
    function bar(label, pct, sub, color) {
      return '<div class="adm-bar-row"><div class="adm-bar-head"><span>' + esc(label) + '</span><span class="adm-bar-sub">' + esc(sub) + '</span></div>' +
        '<div class="progress" style="height:10px"><span style="width:' + pct + '%;background:' + color + '"></span></div></div>';
    }
    return '<div class="adm-page-head"><h2>Reports</h2><p class="muted small">Platform health summary.</p></div>' +
      '<div class="adm-grid-2">' +
        '<div class="card card-pad adm-report-p">' +
          '<p>The platform currently hosts <strong>' + (s.events || 0) + '</strong> events created by <strong>' + (s.users || 0) + '</strong> users, with <strong>' + (s.rsvps || 0) + '</strong> confirmed RSVPs collected.</p>' +
          '<p><strong>' + (s.publishedEvents || 0) + '</strong> of those events are published and live for guests — the rest are drafts, paused or archived.</p>' +
          '<p>' + (s.paymentsCount || 0) + ' payments processed totalling <strong>' + esc(App.money(s.revenue || 0)) + '</strong>, and ' + (Number(s.emailsSent) || 0).toLocaleString('en-US') + ' invitation emails delivered platform-wide.</p>' +
        '</div>' +
        '<div class="card card-pad"><h4 style="margin:0 0 14px;font-size:14px">Capacity &amp; adoption</h4><div class="adm-bars">' +
          bar('Media storage', storagePct, (Number(s.storageGb) || 0) + '% of 100 GB', '#9A7B5B') +
          bar('Published share', pubPct, (s.publishedEvents || 0) + ' of ' + events + ' events live', '#7C8A6E') +
          bar('Custom domains', Math.min(100, Math.round(domains / 200 * 100)), domains + ' connected (demo baseline 200)', '#C9A96A') +
        '</div></div>' +
      '</div>';
  }

  function settingsHtml() {
    function row(label, desc, key) {
      var on = !!adm.flags[key];
      return '<div class="card card-pad adm-set-row">' +
        '<div><h4>' + esc(label) + '</h4><p class="muted small">' + esc(desc) + '</p></div>' +
        '<label class="switch"><input type="checkbox" data-adm-flag="' + key + '"' + (on ? ' checked' : '') + ' aria-label="' + esc(label) + '"><span class="track"></span></label>' +
      '</div>';
    }
    return '<div class="adm-page-head"><h2>Settings</h2><p class="muted small">Platform-level preferences.</p></div>' +
      '<div class="adm-set-list">' +
        row('New registrations', 'Allow new users to create accounts on the platform.', 'registrations') +
        row('Maintenance mode', 'Temporarily take the public site offline for maintenance.', 'maintenance') +
      '</div>' +
      '<div class="adm-note" style="margin-top:14px;max-width:640px">' + App.icon('info') + '<span>Platform preferences are stored locally in this demo build — they reset on reload.</span></div>';
  }

  function contentHtml() {
    if (adm.denied) return deniedContent();
    if (adm.err) return errorContent();
    if (adm.loading) return skeletonContent();
    switch (adm.tab) {
      case 'users': return usersHtml();
      case 'events': return eventsHtml();
      case 'templates': return templatesHtml();
      case 'payments': return paymentsHtml();
      case 'emails': return emailsHtml();
      case 'reports': return reportsHtml();
      case 'settings': return settingsHtml();
      default: return dashboardHtml();
    }
  }

  /* ---------------- Bindings ---------------- */
  function bindContent(content) {
    App.qsa('[data-adm-retry]', content).forEach(function (btn) {
      btn.addEventListener('click', function () { loadStats(); });
    });
    App.qsa('[data-adm-home]', content).forEach(function (btn) {
      btn.addEventListener('click', function () { App.navigate('#/'); });
    });
    App.qsa('[data-adm-site]', content).forEach(function (btn) {
      btn.addEventListener('click', function () {
        App.navigate('#/site/' + btn.getAttribute('data-adm-site'));
      });
    });

    // Dashboard charts
    var trend = (adm.stats && adm.stats.trend) || [];
    var cu = App.qs('[data-chart-users]', content);
    if (cu) {
      App.chartArea(cu, trend.map(function (w) { return { date: w.week, count: Number(w.users) || 0 }; }), '#9A7B5B');
    }
    var ce = App.qs('[data-chart-events]', content);
    if (ce) {
      App.chartBarsH(ce, trend.map(function (w) {
        return { label: 'Wk of ' + String(w.week || '').slice(5).replace('-', '/'), value: Number(w.events) || 0, color: '#7C8A6E' };
      }));
    }

    // Users search (re-render only the table region to keep focus)
    var search = App.qs('#adm-user-search', content);
    if (search) {
      search.addEventListener('input', function () {
        adm.userSearch = search.value;
        var list = filteredUsers();
        var wrapEl = App.qs('[data-user-table]', content);
        if (wrapEl) wrapEl.innerHTML = list.length ? usersTable(list) : '<p class="muted small" style="padding:16px">No users match your search.</p>';
        var count = App.qs('[data-user-count]', content);
        if (count) count.textContent = list.length + ' shown · latest ' + ((adm.stats && adm.stats.recentUsers) || []).length + ' of ' + (((adm.stats && adm.stats.stats) || {}).users || 0) + ' registered users';
      });
    }

    // Settings switches
    App.qsa('[data-adm-flag]', content).forEach(function (input) {
      input.addEventListener('change', function () {
        var key = input.getAttribute('data-adm-flag');
        var on = input.checked;
        adm.flags[key] = on;
        if (key === 'registrations') App.toast('New registrations ' + (on ? 'enabled' : 'disabled'), on ? 'success' : 'info');
        else App.toast('Maintenance mode ' + (on ? 'enabled' : 'disabled'), on ? 'info' : 'success');
      });
    });
  }

  function refreshContent() {
    var content = App.qs('[data-adm-content]');
    if (!content) return;
    content.innerHTML = contentHtml();
    bindContent(content);
    if (adm.tab === 'templates' && !adm.templates && !adm.tplLoading && !adm.tplFailed) {
      loadTemplates();
    }
  }

  function refreshSidebar() {
    App.qsa('.adm-nav-item').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-adm-tab') === adm.tab);
    });
  }

  function loadStats() {
    adm.loading = true;
    adm.err = null;
    adm.denied = false;
    refreshContent();
    App.api('/api/admin/stats')
      .then(function (res) {
        adm.stats = res || null;
        adm.loading = false;
        refreshContent();
      })
      .catch(function (err) {
        adm.loading = false;
        if (err && err.status === 403) adm.denied = true;
        else adm.err = (err && err.message) || 'Request failed';
        refreshContent();
      });
  }

  function loadTemplates() {
    adm.tplLoading = true;
    refreshContent();
    App.api('/api/templates')
      .then(function (res) {
        adm.templates = (res && res.templates) || [];
        adm.tplLoading = false;
        refreshContent();
      })
      .catch(function () {
        adm.tplLoading = false;
        adm.tplFailed = true; // fall back to static rows
        refreshContent();
      });
  }

  /* ---------------- View ---------------- */
  App.views.admin = {
    render: function () {
      if (!App.state.user) {
        return guardCard('Admin access required', 'Please sign in with an administrator account to view the platform admin panel.');
      }
      if (!isAdmin()) {
        return guardCard('Admin access required', 'This area is restricted to platform administrators.');
      }
      return shellHtml();
    },

    mount: function () {
      // Guard views: bind the home buttons only.
      App.qsa('[data-adm-home]').forEach(function (btn) {
        btn.addEventListener('click', function () { App.navigate('#/'); });
      });
      if (!isAdmin()) return;

      App.qsa('[data-adm-exit]').forEach(function (btn) {
        btn.addEventListener('click', function () { App.navigate('#/'); });
      });
      App.qsa('[data-adm-tab]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          adm.tab = btn.getAttribute('data-adm-tab') || 'dashboard';
          refreshSidebar();
          refreshContent();
        });
      });
      loadStats();
    }
  };
})();
