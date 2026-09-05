/* ============================================================
   Online RSVP — app.js
   Core runtime: state, hash router, api, icons, toasts, modals,
   charts, mini-preview, section defs + MARKETING / AUTH / WIZARD views.
   Loaded first; dashboard.js / public.js / admin.js extend App.views.
   ============================================================ */
'use strict';

(function () {
  /* ---------------- Icons (lucide-style, inline SVG) ---------------- */
  var P = {
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-up': '<path d="m18 15-6-6-6 6"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    'calendar-days': '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
    'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    'mail-check': '<path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 19 2 2 4-4"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    'bar-chart': '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
    'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    'credit-card': '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
    layout: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    images: '<path d="M18 22H4a2 2 0 0 1-2-2V6"/><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"/><rect width="16" height="16" x="6" y="2" rx="2"/>',
    type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
    'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    'list-checks': '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
    minus: '<line x1="5" x2="19" y1="12" y2="12"/>',
    'panel-bottom': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 15h18"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
    gem: '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
    cake: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/>',
    baby: '<path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>',
    briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    'party-popper': '<path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33v0c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82v0c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/>',
    ellipsis: '<circle cx="12" cy="12" r="10"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/>',
    'more-vertical': '<circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    'qr-code': '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16h.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    click: '<path d="M9 9l5 12 1.8-5.2L21 14Z"/><path d="M7.2 2.2 8 5.1"/><path d="m5.1 8-2.9-.8"/><path d="M14 4.1 12 6"/><path d="m6 12-1.9 2"/>',
    monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
    tablet: '<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="12" x2="12.01" y1="18" y2="18"/>',
    smartphone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
    save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
    grip: '<circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>',
    loader: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    key: '<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>'
  };

  function icon(name, cls) {
    var body = P[name] || P.ellipsis;
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }

  /* ---------------- Core ---------------- */
  var App = window.App = {
    version: '1.0.0',
    state: {
      user: null,
      events: [],
      currentEvent: null,
      hydrated: false,
      authMode: 'login',
      wizardTemplateId: null,
      publicEvent: null
    },
    views: {},
    _cleanups: [],
    DEFAULT_THEME: {
      primary: '#9A7B5B', secondary: '#F6F1EA', text: '#272727', background: '#FFFFFF',
      headingFont: 'Cormorant Garamond', bodyFont: 'Inter', buttonStyle: 'rounded',
      borderRadius: 8, spacing: 1
    },
    ICON_PATHS: P
  };

  App.icon = icon;
  App.qs = function (sel, root) { return (root || document).querySelector(sel); };
  App.qsa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  App.esc = function (s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  App.escAttr = App.esc;

  App.fmtDate = function (iso) {
    if (!iso) return '';
    var d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  App.fmtDateShort = function (iso) {
    if (!iso) return '';
    var d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  App.fmtTime = function (t) {
    if (!t) return '';
    var parts = t.split(':'), h = Number(parts[0]), m = Number(parts[1] || 0);
    if (isNaN(h)) return t;
    var suffix = h >= 12 ? 'PM' : 'AM';
    var hour = h % 12 === 0 ? 12 : h % 12;
    return hour + ':' + String(m).padStart(2, '0') + ' ' + suffix;
  };
  App.daysUntil = function (dateIso) {
    if (!dateIso) return 0;
    var target = new Date(dateIso + 'T12:00:00');
    return Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86400000));
  };
  App.money = function (n) {
    return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };
  App.timeAgo = function (iso) {
    if (!iso) return '—';
    var s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    if (s < 86400 * 30) return Math.floor(s / 86400) + 'd ago';
    return App.fmtDateShort(iso);
  };
  App.initials = function (name) {
    var parts = String(name || '?').trim().split(/\s+/);
    var a = (parts[0] || '?').charAt(0), b = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (a + b).toUpperCase();
  };
  App.avatarHtml = function (name, size) {
    return '<span class="avatar' + (size ? ' ' + size : '') + '" title="' + App.esc(name) + '">' + App.esc(App.initials(name)) + '</span>';
  };
  App.plural = function (n, one, many) { return n === 1 ? one : (many || one + 's'); };

  /* ---------------- API ---------------- */
  App.api = function (path, opts) {
    opts = opts || {};
    var init = { method: opts.method || (opts.body ? 'POST' : 'GET'), cache: 'no-store' };
    if (opts.body !== undefined) {
      init.headers = { 'Content-Type': 'application/json' };
      init.body = JSON.stringify(opts.body);
    }
    return fetch(path, init).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        var msg = 'Request failed (' + res.status + ')';
        if (data && typeof data === 'object' && data.error) msg = String(data.error);
        if (!res.ok) { var err = new Error(msg); err.status = res.status; throw err; }
        return data;
      });
    });
  };

  /* ---------------- Toasts ---------------- */
  App.toast = function (msg, type) {
    type = type || 'success';
    var root = document.getElementById('toaster');
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.setAttribute('role', 'status');
    var ic = type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info';
    el.innerHTML = icon(ic) + '<span>' + App.esc(msg) + '</span>';
    root.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.remove(); }, 300);
    }, 3400);
  };

  /* ---------------- Modal ---------------- */
  App.modal = {
    el: null,
    open: function (opts) {
      this.close();
      var root = document.getElementById('modal-root');
      var panel = document.createElement('div');
      panel.className = 'modal-panel' + (opts.wide ? ' wide' : '') + (opts.xl ? ' xl' : '');
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.innerHTML =
        '<div class="modal-head"><h3 class="modal-title">' + (opts.title || '') + '</h3>' +
        '<button class="icon-btn sm" data-modal-close aria-label="Close dialog">' + icon('x') + '</button></div>' +
        '<div class="modal-body">' + (opts.body || '') + '</div>' +
        (opts.footer ? '<div class="modal-foot">' + opts.footer + '</div>' : '');
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.appendChild(panel);
      overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) App.modal.close(); });
      panel.querySelector('[data-modal-close]').addEventListener('click', function () { App.modal.close(); });
      root.appendChild(overlay);
      this.el = overlay;
      if (typeof opts.onMount === 'function') opts.onMount(panel);
      var first = panel.querySelector('input, textarea, select, button.btn');
      if (first) first.focus();
      return panel;
    },
    close: function () {
      if (this.el) { this.el.remove(); this.el = null; }
    },
    isOpen: function () { return !!this.el; }
  };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') App.modal.close();
  });

  App.confirm = function (opts) {
    App.modal.open({
      title: opts.title || 'Are you sure?',
      body: '<p class="muted" style="font-size:14px">' + (opts.message || '') + '</p>',
      footer:
        '<button class="btn btn-outline" data-cancel>Cancel</button>' +
        '<button class="btn ' + (opts.danger ? 'btn-danger' : 'btn-accent') + '" data-ok>' + App.esc(opts.okLabel || 'Confirm') + '</button>',
      onMount: function (panel) {
        panel.querySelector('[data-cancel]').addEventListener('click', function () { App.modal.close(); });
        panel.querySelector('[data-ok]').addEventListener('click', function () {
          App.modal.close();
          if (opts.onOk) opts.onOk();
        });
      }
    });
  };

  /* ---------------- Dropdowns ---------------- */
  App.bindDropdowns = function (root) {
    App.qsa('[data-dd]', root).forEach(function (btn) {
      var menu = btn.parentElement.querySelector('.dropdown-menu');
      if (!menu) return;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = menu.style.display === 'block';
        App.qsa('.dropdown-menu').forEach(function (m) { m.style.display = 'none'; });
        menu.style.display = open ? 'none' : 'block';
      });
      menu.addEventListener('click', function () { menu.style.display = 'none'; });
    });
  };
  document.addEventListener('click', function () {
    App.qsa('.dropdown-menu').forEach(function (m) { m.style.display = 'none'; });
  });

  /* ---------------- Charts (tiny SVG helpers) ---------------- */
  App.chartArea = function (el, data, color) {
    if (!el) return;
    color = color || '#9A7B5B';
    data = data || [];
    var W = 600, H = 170, pad = 8;
    var max = Math.max(1, Math.max.apply(null, data.map(function (d) { return d.count; })));
    var step = data.length > 1 ? (W - pad * 2) / (data.length - 1) : 0;
    var pts = data.map(function (d, i) {
      return [pad + i * step, H - 20 - (d.count / max) * (H - 42)];
    });
    var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var area = line + ' L ' + (W - pad) + ' ' + (H - 20) + ' L ' + pad + ' ' + (H - 20) + ' Z';
    var id = 'grad' + Math.random().toString(36).slice(2, 8);
    el.innerHTML =
      '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" style="width:100%;height:100%;display:block">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + color + '" stop-opacity=".28"/><stop offset="100%" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>' +
      '<line x1="' + pad + '" y1="' + (H - 20) + '" x2="' + (W - pad) + '" y2="' + (H - 20) + '" stroke="#E7E5DF" stroke-width="1"/>' +
      '<path d="' + area + '" fill="url(#' + id + ')"/>' +
      '<path d="' + line + '" fill="none" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      (pts.length ? '<circle cx="' + pts[pts.length - 1][0] + '" cy="' + pts[pts.length - 1][1] + '" r="4" fill="' + color + '"/>' : '') +
      '</svg>';
  };

  App.chartDonut = function (el, segs, centerTop, centerSub) {
    if (!el) return;
    var total = segs.reduce(function (a, s) { return a + s.value; }, 0) || 1;
    var R = 60, C = 2 * Math.PI * R, off = 0;
    var arcs = segs.map(function (s) {
      var frac = s.value / total;
      var dash = (frac * C).toFixed(2);
      var svg = '<circle r="' + R + '" cx="80" cy="80" fill="none" stroke="' + s.color + '" stroke-width="26" ' +
        'stroke-dasharray="' + dash + ' ' + (C - dash).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 80 80)"/>';
      off += frac * C;
      return svg;
    }).join('');
    el.innerHTML =
      '<div style="display:flex;align-items:center;gap:22px;flex-wrap:wrap">' +
      '<div style="position:relative;width:160px;height:160px;min-width:160px">' +
      '<svg viewBox="0 0 160 160" style="width:100%;height:100%">' + arcs + '</svg>' +
      '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
      '<div style="font-size:24px;font-weight:700;letter-spacing:-.02em">' + App.esc(centerTop) + '</div>' +
      '<div class="tiny muted">' + App.esc(centerSub) + '</div></div></div>' +
      '<div style="display:flex;flex-direction:column;gap:8px">' +
      segs.map(function (s) {
        return '<div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500">' +
          '<span class="dot" style="background:' + s.color + '"></span>' + App.esc(s.label) +
          '<span class="muted" style="margin-left:auto;padding-left:14px">' + s.value + '</span></div>';
      }).join('') +
      '</div></div>';
  };

  App.chartBarsH = function (el, items) {
    if (!el) return;
    var max = Math.max(1, Math.max.apply(null, items.map(function (i) { return i.value; })));
    el.innerHTML = items.length ? items.map(function (it) {
      return '<div style="margin-bottom:12px">' +
        '<div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:600;margin-bottom:5px">' +
        '<span>' + App.esc(it.label) + '</span><span class="muted">' + it.value + '</span></div>' +
        '<div class="progress" style="height:8px"><span style="width:' + Math.round((it.value / max) * 100) + '%;background:' + (it.color || '#9A7B5B') + '"></span></div>' +
        '</div>';
    }).join('') : '<p class="muted small">No data yet</p>';
  };

  /* ---------------- CSV helpers ---------------- */
  App.downloadCsv = function (filename, rows) {
    function escape(v) {
      var s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }
    var csv = rows.map(function (r) { return r.map(escape).join(','); }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  App.parseCsv = function (text) {
    var rows = [], row = [], field = '', inQ = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
        else field += c;
      } else if (c === '"') inQ = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (field !== '' || row.length) { row.push(field); rows.push(row); }
        row = []; field = '';
        if (c === '\r' && text[i + 1] === '\n') i++;
      } else field += c;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
  };

  App.EMAIL_VARIABLES = ['{{guest.first_name}}', '{{guest.last_name}}', '{{guest.name}}', '{{event.name}}', '{{event.date}}', '{{event.venue}}', '{{event.rsvp_url}}'];
  App.renderEmailVars = function (body, vars) {
    return String(body || '').replace(/\{\{(\w+)\.(\w+)\}\}/g, function (m, ns, key) {
      return vars[ns + '.' + key] != null ? vars[ns + '.' + key] : m;
    });
  };

  /* ---------------- Section registry (mirrors src/lib/sections.ts) ---------------- */
  App.SECTION_DEFS = [
    { type: 'hero', label: 'Hero', category: 'event', icon: 'image', description: 'Full-screen cover with headline & CTA',
      defaultContent: { heading: 'John & Emily', subheading: 'We are getting married', dateText: '24 October 2026', locationText: 'Dubai, UAE', buttonText: 'RSVP Now' } },
    { type: 'text', label: 'Text', category: 'basic', icon: 'type', description: 'Heading and paragraph',
      defaultContent: { heading: 'A beautiful heading', body: 'Write something meaningful for your guests here.' } },
    { type: 'story', label: 'Story', category: 'basic', icon: 'book-open', description: 'Story with image and text',
      defaultContent: { heading: 'Our Story', body: 'It started with a chance meeting on a warm summer evening... Eight years, countless adventures and one unforgettable proposal later, we are ready to say "I do".', image: '/images/wedding-story.jpg' } },
    { type: 'countdown', label: 'Countdown', category: 'event', icon: 'timer', description: 'Live countdown to the big day',
      defaultContent: { heading: 'Counting down to forever' } },
    { type: 'details', label: 'Event Details', category: 'event', icon: 'calendar-days', description: 'Date, time, venue & dress code',
      defaultContent: { heading: 'When & Where', note: '' } },
    { type: 'schedule', label: 'Schedule', category: 'event', icon: 'list-checks', description: 'Timeline of sub-events',
      defaultContent: { heading: 'The Schedule' } },
    { type: 'gallery', label: 'Gallery', category: 'media', icon: 'images', description: 'Photo grid with lightbox',
      defaultContent: { heading: 'Our Gallery', subtitle: 'A few of our favourite moments' } },
    { type: 'map', label: 'Map', category: 'event', icon: 'map-pin', description: 'Venue location card',
      defaultContent: { heading: 'Getting There' } },
    { type: 'accommodation', label: 'Accommodation', category: 'guestinfo', icon: 'building', description: 'Where to stay — hotel cards',
      defaultContent: { heading: 'Where to Stay', subtitle: 'Hotels close to the venue' } },
    { type: 'registry', label: 'Registry', category: 'guestinfo', icon: 'gift', description: 'Gift funds & donations',
      defaultContent: { heading: 'Our Registry', subtitle: 'Help us celebrate our new beginning' } },
    { type: 'rsvp', label: 'RSVP', category: 'event', icon: 'mail-check', description: 'RSVP call-to-action / embedded form',
      defaultContent: { heading: 'Will you join us?', subtitle: 'Kindly respond before 24 September 2026', buttonText: 'RSVP Now' } },
    { type: 'contact', label: 'Contact', category: 'guestinfo', icon: 'mail', description: 'Contact details',
      defaultContent: { heading: 'Contact Us', email: 'hello@example.com', phone: '+971 50 000 0000' } },
    { type: 'divider', label: 'Divider', category: 'basic', icon: 'minus', description: 'Decorative separator', defaultContent: {} },
    { type: 'footer', label: 'Footer', category: 'basic', icon: 'panel-bottom', description: 'Footer with credits',
      defaultContent: { text: 'With love, John & Emily' } }
  ];
  App.getSectionDef = function (type) {
    return App.SECTION_DEFS.find(function (d) { return d.type === type; });
  };
  var sectionCounter = 0;
  App.createSection = function (type) {
    var def = App.getSectionDef(type);
    sectionCounter += 1;
    return {
      id: 'sec_' + Date.now().toString(36) + '_' + sectionCounter + '_' + Math.random().toString(36).slice(2, 6),
      type: type,
      visible: true,
      settings: { padding: 'md', align: 'center', animation: 'fade' },
      content: def ? JSON.parse(JSON.stringify(def.defaultContent)) : {}
    };
  };
  App.reorderSections = function (sections, id, newIndex) {
    var from = sections.findIndex(function (s) { return s.id === id; });
    if (from === -1) return sections;
    var copy = sections.slice();
    var item = copy.splice(from, 1)[0];
    copy.splice(Math.max(0, Math.min(newIndex, copy.length)), 0, item);
    return copy;
  };

  /* ---------------- Mini site preview (template cards / mockups) ---------------- */
  App.miniPreview = function (theme, sections) {
    theme = theme || App.DEFAULT_THEME;
    sections = (sections || []).filter(function (s) { return s.visible !== false; }).slice(0, 6);
    var t = theme;
    var btnRadius = t.buttonStyle === 'pill' ? '99px' : t.buttonStyle === 'square' ? '0px' : (t.borderRadius || 8) + 'px';
    function galStyle(url) { return url ? 'background-image:url(' + url + ')' : 'background:rgba(0,0,0,.1)'; }
    var out = sections.map(function (s) {
      var c = s.content || {};
      switch (s.type) {
        case 'hero': {
          var hasBg = s.settings && s.settings.bgImage;
          var heroBg = hasBg
            ? 'background-image:linear-gradient(rgba(0,0,0,.38),rgba(0,0,0,.38)),url(' + s.settings.bgImage + ');background-size:cover;background-position:center;color:#fff'
            : 'background:' + t.secondary + ';color:' + t.text;
          return '<div style="width:100%;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center;border-radius:8px;padding:10% 6%;' + heroBg + '">' +
            '<div class="ms-h" style="font-size:16px">' + App.esc(c.heading || '') + '</div>' +
            '<div class="ms-p">' + App.esc(c.subheading || '') + '</div>' +
            '<div class="ms-p" style="font-size:7px;letter-spacing:.08em;text-transform:uppercase">' + App.esc(c.dateText || '') + ' · ' + App.esc(c.locationText || '') + '</div>' +
            '<div class="ms-btn" style="background:' + t.primary + ';border-radius:' + btnRadius + ';margin-top:4px">' + App.esc(c.buttonText || 'RSVP') + '</div></div>';
        }
        case 'countdown':
          return '<div style="width:100%;text-align:center"><div class="ms-h" style="font-size:11px;margin-bottom:6px">' + App.esc(c.heading || '') + '</div>' +
            '<div style="display:flex;gap:5px;justify-content:center">' + [0, 1, 2, 3].map(function () {
              return '<div class="ms-box" style="background:' + t.secondary + ';color:' + t.primary + '">00</div>';
            }).join('') + '</div></div>';
        case 'details':
          var cells = [['calendar', 'Date'], ['clock', 'Time'], ['map-pin', 'Venue'], ['star', 'Dress code']];
          return '<div style="width:100%"><div class="ms-h" style="font-size:11px;text-align:center;margin-bottom:6px">' + App.esc(c.heading || '') + '</div>' +
            '<div class="ms-row">' + cells.map(function (cell) {
              return '<div class="ms-cell" style="background:' + t.secondary + ';color:' + t.text + '">' + icon(cell[0]) + '<span>' + cell[1] + '</span></div>';
            }).join('') + '</div></div>';
        case 'schedule':
          return '<div style="width:100%"><div class="ms-h" style="font-size:11px;text-align:center;margin-bottom:6px">' + App.esc(c.heading || '') + '</div>' +
            [0, 1, 2].map(function (i) {
              return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span class="dot" style="background:' + t.primary + ';width:5px;height:5px"></span>' +
                '<span class="ms-line" style="background:' + t.secondary + ';width:22%"></span><span class="ms-line" style="background:' + t.secondary + ';flex:1"></span></div>';
            }).join('') + '</div>';
        case 'gallery':
          var imgs = ['/images/wedding-gallery-1.jpg', '/images/wedding-gallery-2.jpg', '/images/wedding-gallery-3.jpg'];
          return '<div style="width:100%"><div class="ms-h" style="font-size:11px;text-align:center;margin-bottom:6px">' + App.esc(c.heading || '') + '</div>' +
            '<div class="ms-gal">' + imgs.map(function (u) { return '<div style="' + galStyle(u) + '"></div>'; }).join('') + '</div></div>';
        case 'story':
          return '<div class="ms-row" style="align-items:center">' +
            '<div class="ms-img" style="' + galStyle(c.image || '/images/wedding-story.jpg') + '"></div>' +
            '<div style="flex:1"><div class="ms-h" style="font-size:11px;margin-bottom:3px">' + App.esc(c.heading || '') + '</div>' +
            '<span class="ms-line" style="background:rgba(0,0,0,.1);display:block;margin-bottom:3px"></span>' +
            '<span class="ms-line" style="background:rgba(0,0,0,.1);display:block;width:70%"></span></div></div>';
        case 'rsvp':
          return '<div style="width:100%;background:' + t.secondary + ';border-radius:8px;padding:9% 6%;text-align:center">' +
            '<div class="ms-h" style="font-size:12px;margin-bottom:2px">' + App.esc(c.heading || '') + '</div>' +
            '<div class="ms-p" style="margin-bottom:6px">' + App.esc(c.subtitle || '') + '</div>' +
            '<span class="ms-btn" style="background:' + t.primary + ';border-radius:' + btnRadius + ';display:inline-block">' + App.esc(c.buttonText || 'RSVP Now') + '</span></div>';
        case 'contact':
        case 'text':
          return '<div style="width:100%;text-align:center;padding:4% 0">' +
            '<div class="ms-h" style="font-size:12px;margin-bottom:3px">' + App.esc(c.heading || '') + '</div>' +
            '<div class="ms-p">' + App.esc(c.body || c.email || '') + '</div></div>';
        case 'map':
          return '<div style="width:100%;background:' + t.secondary + ';border-radius:8px;padding:8% 6%;text-align:center;color:' + t.primary + '">' + icon('map-pin') + '<div class="ms-h" style="font-size:10px;margin-top:3px">' + App.esc(c.heading || '') + '</div></div>';
        case 'accommodation':
        case 'registry':
          return '<div style="width:100%"><div class="ms-h" style="font-size:11px;text-align:center;margin-bottom:6px">' + App.esc(c.heading || '') + '</div>' +
            '<div class="ms-row"><div class="ms-cell" style="background:' + t.secondary + '">' + icon(s.type === 'registry' ? 'gift' : 'building') + '<span>Option 1</span></div>' +
            '<div class="ms-cell" style="background:' + t.secondary + '">' + icon(s.type === 'registry' ? 'gift' : 'building') + '<span>Option 2</span></div></div></div>';
        case 'divider':
          return '<span class="ms-line" style="background:rgba(0,0,0,.12);width:40%"></span>';
        case 'footer':
          return '<div class="ms-foot" style="background:' + t.primary + ';color:#fff;border-radius:6px">' + App.esc(c.text || '') + '</div>';
        default:
          return '';
      }
    }).join('');
    return '<div class="mini-site" style="background:' + t.background + ';color:' + t.text + ';font-family:\'' + t.bodyFont + '\',sans-serif">' +
      '<div class="ms-pad" style="gap:10px">' + (out || '<div class="ms-h" style="font-size:13px">Your event website</div>') + '</div></div>';
  };

  /* ---------------- Router ---------------- */
  App.addCleanup = function (fn) { App._cleanups.push(fn); };
  App.runCleanups = function () {
    App._cleanups.forEach(function (fn) { try { fn(); } catch (e) { /* noop */ } });
    App._cleanups = [];
  };

  App.parseHash = function () {
    var h = location.hash.replace(/^#\/?/, '');
    var parts = h.split('/').filter(Boolean);
    return { name: parts[0] || 'marketing', params: parts.slice(1) };
  };

  App.navigate = function (hash) {
    if (location.hash === hash) App.route();
    else location.hash = hash;
  };

  App.route = function () {
    App.runCleanups();
    App.modal.close();
    var r = App.parseHash();
    var view = App.views[r.name];
    var root = document.getElementById('app');
    if (!view) {
      root.innerHTML = '<div class="view"><div class="view-body"><div class="empty" style="min-height:70vh">' +
        '<div class="empty-ic">' + icon('layout') + '</div><h4>Page not found</h4>' +
        '<p>The page you are looking for does not exist.</p>' +
        '<button class="btn btn-accent" onclick="App.navigate(\'#/\')">Back to home</button></div></div></div>';
      return;
    }
    window.scrollTo(0, 0);
    root.innerHTML = view.render(r.params);
    if (typeof view.mount === 'function') view.mount(r.params);
  };
  App.rerender = function () { App.route(); };

  /* ---------------- Countdown helper ---------------- */
  App.bindCountdown = function (el, targetIso, compact) {
    if (!el) return;
    var target = new Date(targetIso).getTime();
    function tick() {
      var diff = Math.max(0, target - Date.now());
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      var cells = [[d, 'Days'], [h, 'Hours'], [m, 'Minutes'], [s, 'Seconds']];
      el.innerHTML = cells.map(function (c) {
        return '<div class="mc-box"><div class="mc-num">' + String(c[0]).padStart(2, '0') + '</div><div class="mc-lab">' + c[1] + '</div></div>';
      }).join('');
    }
    tick();
    var iv = setInterval(tick, 1000);
    App.addCleanup(function () { clearInterval(iv); });
  };

  /* ============================================================
     VIEW: MARKETING
     ============================================================ */
  var WEDDING_THEME = { primary: '#9A7B5B', secondary: '#F6F1EA', text: '#3A3226', background: '#FFFFFF', headingFont: 'Cormorant Garamond', bodyFont: 'Inter', buttonStyle: 'pill', borderRadius: 14, spacing: 1 };

  function mockSections() {
    var hero = App.createSection('hero');
    hero.settings.bgImage = '/images/wedding-hero.jpg';
    var rest = ['countdown', 'details', 'gallery', 'rsvp', 'footer'].map(function (t) { return App.createSection(t); });
    return [hero].concat(rest);
  }

  var marketing = {
    _templates: null,
    _cat: 'All',
    render: function () {
      return '' +
      '<div class="view">' +
        '<header class="mk-header"><div class="mk-header-in">' +
          '<a href="#/" class="brand" aria-label="Online RSVP home"><span class="brand-mark">' + icon('heart') + '</span> Online RSVP</a>' +
          '<nav class="mk-nav" aria-label="Main navigation">' +
            '<a href="#features" data-scroll="features">Features</a>' +
            '<a href="#designs" data-scroll="designs">Designs</a>' +
            '<a href="#pricing" data-scroll="pricing">Pricing</a>' +
            '<a href="#faq" data-scroll="faq">FAQ</a>' +
          '</nav>' +
          '<div class="mk-header-cta">' +
            '<button class="btn btn-ghost" data-nav-login>Login</button>' +
            '<button class="btn btn-accent" data-nav-start>Get Started</button>' +
            '<button class="icon-btn mk-burger" data-burger aria-label="Open menu" aria-expanded="false">' + icon('menu') + '</button>' +
          '</div>' +
        '</div></header>' +
        '<div class="mk-mobile-menu" data-mobile-menu>' +
          '<button data-scroll="features">Features</button>' +
          '<button data-scroll="designs">Designs</button>' +
          '<button data-scroll="pricing">Pricing</button>' +
          '<button data-scroll="faq">FAQ</button>' +
          '<button data-nav-login>Login</button>' +
        '</div>' +

        '<div class="view-body">' +
          '<section class="mk-hero" id="top">' +
            '<div class="mk-hero-blob b1"></div><div class="mk-hero-blob b2"></div>' +
            '<div class="mk-hero-in">' +
              '<span class="eyebrow fade-up">' + icon('sparkles') + ' One-time pricing • Unlimited guests</span>' +
              '<h1 class="fade-up d1">Create your <em>perfect event</em> website</h1>' +
              '<p class="hero-sub fade-up d2">Beautiful invitations. Easy RSVPs. Happy guests.</p>' +
              '<p class="hero-body fade-up d2">Create a stunning event website in minutes and manage every guest from one simple dashboard.</p>' +
              '<div class="hero-ctas fade-up d3">' +
                '<button class="btn btn-accent btn-lg" data-nav-start>Create My Event ' + icon('arrow-right') + '</button>' +
                '<button class="btn btn-outline btn-lg" data-scroll="designs">Explore Designs</button>' +
              '</div>' +
              '<div class="hero-trust fade-up d4">' +
                '<span>' + icon('check-circle') + ' 12,000+ events created</span>' +
                '<span><span class="stars">★★★★★</span> 4.9 rating</span>' +
                '<span>' + icon('shield-check') + ' No credit card required</span>' +
              '</div>' +
            '</div>' +
            '<div class="mk-mockup-wrap fade-up d4">' +
              '<div class="mk-float-chip fc-1"><span class="c-ic">' + icon('check') + '</span><span>RSVP Confirmed<small>121 guests attending</small></span></div>' +
              '<div class="mk-float-chip fc-2"><span class="c-ic">' + icon('send') + '</span><span>Invitations Sent<small>186 emails delivered</small></span></div>' +
              '<div class="mk-mockup">' +
                '<div class="mk-mockup-chrome">' +
                  '<span class="cdot" style="background:#E8A9A2"></span><span class="cdot" style="background:#EBC98E"></span><span class="cdot" style="background:#A9C4A0"></span>' +
                  '<span class="mk-mockup-url">' + icon('lock') + ' john-emily.onlinersvp.com</span>' +
                '</div>' +
                App.miniPreview(WEDDING_THEME, mockSections()) +
                '<div style="background:' + WEDDING_THEME.secondary + ';padding:6px 16px 20px">' +
                  '<div class="mock-countdown" data-mock-countdown></div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</section>' +

          '<section class="section-pad" id="how" style="padding-top:56px"><div class="container">' +
            '<div class="mk-section-head"><span class="eyebrow">How it works</span><h2>From idea to RSVPs in minutes</h2><p>No designers, no developers, no stress. Everything you need for a beautiful event website.</p></div>' +
            '<div class="hiw-grid">' + [
              ['Create your event', 'Tell us the type, date and venue of your celebration.'],
              ['Pick a design', 'Choose from hand-crafted templates made for every occasion.'],
              ['Add your guests', 'Import from Excel or add guests one by one, in groups.'],
              ['Send invitations', 'Beautiful emails with personalized RSVP links and QR codes.'],
              ['Watch RSVPs roll in', 'Track responses, meals and sub-events in real time.']
            ].map(function (s, i) {
              return '<div class="card card-hover hiw-card"><div class="hiw-num">0' + (i + 1) + '</div><h4>' + s[0] + '</h4><p>' + s[1] + '</p></div>';
            }).join('') + '</div>' +
          '</div></section>' +

          '<section class="section-pad" id="designs" style="background:#fff;border-top:1px solid var(--border);border-bottom:1px solid var(--border)"><div class="container">' +
            '<div class="mk-section-head"><span class="eyebrow">Design gallery</span><h2>Designs guests remember</h2><p>Every template is fully themeable — colors, fonts, spacing and sections.</p></div>' +
            '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:30px" data-cat-row>' +
              ['All', 'Wedding', 'Birthday', 'Baby', 'Corporate', 'Party'].map(function (c) {
                return '<button class="chip' + (c === 'All' ? ' active' : '') + '" data-cat="' + c + '">' + c + '</button>';
              }).join('') +
            '</div>' +
            '<div class="designs-grid" data-designs-grid>' +
              '<div class="skeleton" style="aspect-ratio:16/11.4"></div><div class="skeleton" style="aspect-ratio:16/11.4"></div><div class="skeleton" style="aspect-ratio:16/11.4"></div><div class="skeleton" style="aspect-ratio:16/11.4"></div>' +
            '</div>' +
            '<div style="text-align:center;margin-top:36px"><button class="btn btn-outline" data-all-designs>Explore All Designs ' + icon('arrow-right') + '</button></div>' +
          '</div></section>' +

          '<section class="section-pad" id="features"><div class="container">' +
            featureBlock('layout', 'Website Builder', 'A drag-and-drop builder made for events',
              'Compose your site from purpose-built sections — hero, countdown, schedule, gallery and more. Style everything without touching code.',
              ['14 purpose-built section types', 'Live theme customization — colors, fonts, buttons', 'Reorder, preview and publish in one click', 'Looks perfect on every device'], false, mockBuilderVisual()) +
            featureBlock('users', 'Guest Management', 'Every guest, organized effortlessly',
              'A lightweight guest CRM with groups, search, filters and bulk actions. Import your list and let Online RSVP do the rest.',
              ['Guest groups with color coding', 'Import & export CSV from Excel or Google Sheets', 'Personalized RSVP links & QR codes per guest', 'Party sizes, plus-ones and notes'], true, mockGuestsVisual()) +
            featureBlock('mail-check', 'RSVP Management', 'Smart RSVP forms, zero spreadsheets',
              'Build custom forms with conditional questions. Collect meals, dietary needs, song requests and sub-event attendance.',
              ['9 question types with conditional logic', 'Meal choices & dietary requirements', 'Plus-one management with limits', 'Sub-event attendance tracking'], false, mockRsvpVisual()) +
            featureBlock('send', 'Invitations', 'Invitations that feel personal',
              'Send save-the-dates, invitations and reminders with merge variables, scheduling and delivery tracking built in.',
              ['Email variables like {{guest.first_name}}', 'Schedule campaigns ahead of time', 'Open & click tracking', 'Reminder & thank-you campaigns'], true, mockEmailVisual()) +
          '</div></section>' +

          '<section class="section-pad" id="pricing" style="background:#fff;border-top:1px solid var(--border);border-bottom:1px solid var(--border)"><div class="container">' +
            '<div class="mk-section-head"><span class="eyebrow">Pricing</span><h2>Simple, honest pricing</h2><p>Pay once, celebrate forever. Every plan includes unlimited guests.</p></div>' +
            '<div class="pricing-grid">' +
              pricingCard('Starter', '$0', 'Free forever', ['1 event website', 'Up to 50 guests', 'All core sections', 'onlinersvp.com subdomain', 'Community support'], false) +
              pricingCard('Pro', '$49', 'one-time payment', ['Unlimited events', 'Unlimited guests', 'Custom RSVP questions', 'Email campaigns & QR codes', 'Custom domain support', 'Priority support'], true) +
              pricingCard('Studio', '$149', 'one-time payment', ['Everything in Pro', '5 team seats', 'Template marketplace access', 'White-label option', 'Dedicated onboarding'], false) +
            '</div>' +
            '<p class="pricing-note">One-time pricing • No subscriptions • No per-guest fees</p>' +
          '</div></section>' +

          '<section class="section-pad" id="faq"><div class="container"><div class="faq-wrap">' +
            '<div class="mk-section-head"><span class="eyebrow">FAQ</span><h2>Questions, answered</h2></div>' +
            faqItem('How many guests can I invite?', 'Unlimited! Paid plans have no guest limits. The free Starter plan includes up to 50 guests, and you can upgrade any time.') +
            faqItem('Can I use my own domain?', 'Yes. Connect your custom domain (like johnandemily.com) from Settings — we show you the exact DNS records to add.') +
            faqItem('Can guests edit their RSVP later?', 'Yes. When "allow edits" is enabled, guests can reopen their personalized RSVP link and update their response, meal choice and party size.') +
            faqItem('Can I import my guest list from Excel?', 'Absolutely — upload a CSV with name, email and group columns. We automatically create guest groups and personalized RSVP links for every guest.') +
            faqItem('How customizable are the designs?', 'Every template is fully themeable: colors, heading & body fonts, button shape, corner radius and section spacing. Sections can be added, removed and reordered.') +
            faqItem('Do you offer refunds?', 'Yes — every purchase comes with a 30-day money-back guarantee, no questions asked.') +
          '</div></div></section>' +

          '<section class="section-pad" id="contact" style="padding-top:0"><div class="container"><div class="contact-grid">' +
            '<div>' +
              '<span class="eyebrow">Contact</span>' +
              '<h2 class="font-display" style="font-size:clamp(28px,3.6vw,40px);font-weight:600;margin:12px 0 10px">We would love to hear from you</h2>' +
              '<p class="muted" style="margin-bottom:14px">Questions about pricing, custom work or enterprise plans? Our team replies within 24 hours.</p>' +
              contactItem('mail', 'Email us', 'hello@onlinersvp.com') +
              contactItem('phone', 'Call us', '+971 4 000 0000') +
              contactItem('map-pin', 'Visit us', 'Dubai, United Arab Emirates') +
            '</div>' +
            '<form class="card card-pad" data-contact-form novalidate>' +
              '<div class="field"><label class="label" for="cf-name">Name <span class="req">*</span></label><input class="input" id="cf-name" required placeholder="Your name"></div>' +
              '<div class="field"><label class="label" for="cf-email">Email <span class="req">*</span></label><input class="input" id="cf-email" type="email" required placeholder="you@example.com"></div>' +
              '<div class="field"><label class="label" for="cf-msg">Message <span class="req">*</span></label><textarea class="textarea" id="cf-msg" required placeholder="Tell us about your event..."></textarea></div>' +
              '<button class="btn btn-accent btn-block" type="submit">Send Message ' + icon('send') + '</button>' +
            '</form>' +
          '</div></div></section>' +
        '</div>' +

        '<footer class="mk-footer"><div class="mk-footer-in">' +
          '<div class="footer-grid">' +
            '<div><a class="brand" href="#/"><span class="brand-mark">' + icon('heart') + '</span> Online RSVP</a>' +
              '<p>The simplest way to create a beautiful event website, invite your guests and collect RSVPs — all in one place.</p></div>' +
            '<div class="footer-col"><h5>Product</h5>' +
              '<button data-scroll="features">Features</button><button data-scroll="designs">Designs</button><button data-scroll="pricing">Pricing</button><button data-scroll="faq">FAQ</button></div>' +
            '<div class="footer-col"><h5>Company</h5>' +
              '<button data-demo-toast="About us — coming soon">About</button><button data-scroll="contact">Contact</button><button data-demo-toast="Careers — coming soon">Careers</button></div>' +
            '<div class="footer-col"><h5>Legal</h5>' +
              '<button data-demo-toast="Privacy policy — demo">Privacy Policy</button><button data-demo-toast="Terms of service — demo">Terms of Service</button>' +
              '<button data-nav-admin>Admin</button></div>' +
          '</div>' +
          '<div class="footer-bottom"><span>© 2026 Online RSVP. Crafted with care in Dubai.</span>' +
            '<span>Demo: john@example.com / demo1234</span></div>' +
        '</div></footer>' +
      '</div>';
    },

    mount: function () {

      // Auth-gated CTAs
      App.qsa('[data-nav-start]').forEach(function (b) {
        b.addEventListener('click', function () {
          App.navigate(App.state.user ? '#/create' : '#/auth');
        });
      });
      App.qsa('[data-nav-login]').forEach(function (b) {
        b.addEventListener('click', function () { App.navigate('#/auth'); });
      });
      var adminBtn = App.qs('[data-nav-admin]');
      if (adminBtn) adminBtn.addEventListener('click', function () { App.navigate('#/admin'); });

      // Mobile menu
      var burger = App.qs('[data-burger]');
      var menu = App.qs('[data-mobile-menu]');
      if (burger && menu) {
        burger.addEventListener('click', function () {
          var open = menu.classList.toggle('open');
          burger.setAttribute('aria-expanded', String(open));
          burger.innerHTML = icon(open ? 'x' : 'menu');
        });
        App.qsa('button', menu).forEach(function (b) {
          b.addEventListener('click', function () {
            menu.classList.remove('open');
            burger.innerHTML = icon('menu');
          });
        });
      }

      // Smooth scroll
      App.qsa('[data-scroll]').forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.preventDefault();
          var el = document.getElementById(b.getAttribute('data-scroll'));
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });

      // Demo toasts
      App.qsa('[data-demo-toast]').forEach(function (b) {
        b.addEventListener('click', function () { App.toast(b.getAttribute('data-demo-toast'), 'info'); });
      });

      // Live mockup countdown
      App.bindCountdown(App.qs('[data-mock-countdown]'), '2026-10-24T17:00:00');

      // FAQ accordion
      App.qsa('.acc-trigger').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var item = btn.closest('.acc-item');
          var panel = item.querySelector('.acc-panel');
          var open = item.classList.toggle('open');
          panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
        });
      });

      // Contact form
      var form = App.qs('[data-contact-form]');
      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var name = App.qs('#cf-name', form), email = App.qs('#cf-email', form), msg = App.qs('#cf-msg', form);
          var bad = [name, email, msg].filter(function (i) { return !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value)); });
          if (bad.length) {
            bad.forEach(function (i) { i.setAttribute('aria-invalid', 'true'); });
            App.toast('Please fill in all fields correctly', 'error');
            return;
          }
          form.reset();
          App.toast('Message sent — we will reply within 24 hours');
        });
      }

      // Designs
      marketing.loadDesigns();
      App.qsa('[data-cat]').forEach(function (chip) {
        chip.addEventListener('click', function () {
          App.qsa('[data-cat]').forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
          marketing._cat = chip.getAttribute('data-cat');
          marketing.renderDesigns();
        });
      });
      App.qsa('[data-all-designs]').forEach(function (b) {
        b.addEventListener('click', function () { App.toast('Full design gallery is available inside the app — create your event to browse all templates!', 'info'); });
      });
    },

    loadDesigns: function () {
      App.api('/api/templates').then(function (res) {
        marketing._templates = res.templates || [];
        marketing.renderDesigns();
      }).catch(function () {
        var grid = App.qs('[data-designs-grid]');
        if (grid) grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-ic">' + icon('alert') + '</div><h4>Could not load designs</h4><p>Please check your connection and try again.</p><button class="btn btn-outline btn-sm" onclick="App.views.marketing.loadDesigns()" style="margin-top:6px">' + icon('refresh') + ' Retry</button></div>';
      });
    },

    renderDesigns: function () {
      var grid = App.qs('[data-designs-grid]');
      if (!grid) return;
      var list = (this._templates || []).filter(function (t) {
        return marketing._cat === 'All' || t.category.toLowerCase() === marketing._cat.toLowerCase();
      });
      if (!list.length) {
        grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-ic">' + icon('image') + '</div><h4>No designs in this category yet</h4><p>Try another category.</p></div>';
        return;
      }
      grid.innerHTML = list.map(function (t) {
        return '<article class="card card-hover design-card" data-preview="' + App.esc(t.id) + '" tabindex="0" role="button" aria-label="Preview ' + App.esc(t.name) + '">' +
          '<div class="design-thumb">' +
          (t.featured ? '<span class="badge badge-accent featured-flag">' + icon('star') + ' Featured</span>' : '') +
          App.miniPreview(t.theme, t.sections) +
          '<div class="preview-cta"><span class="btn btn-light btn-sm">' + icon('eye') + ' Preview</span></div></div>' +
          '<div class="design-meta"><div><div class="design-name">' + App.esc(t.name) + '</div>' +
          '<div class="design-tags">' + t.tags.slice(0, 2).map(function (tg) { return '<span class="badge badge-neutral">' + App.esc(tg) + '</span>'; }).join('') + '</div></div>' +
          '<span class="badge badge-green">' + App.esc(t.category) + '</span></div></article>';
      }).join('');

      App.qsa('[data-preview]', grid).forEach(function (card) {
        function open() {
          var t = marketing._templates.find(function (x) { return x.id === card.getAttribute('data-preview'); });
          if (!t) return;
          App.modal.open({
            title: App.esc(t.name),
            wide: true,
            body: '<div style="border:1px solid var(--border);border-radius:12px;overflow:hidden">' + App.miniPreview(t.theme, t.sections) + '</div>' +
              '<div class="design-tags" style="margin-top:14px">' + t.tags.map(function (tg) { return '<span class="badge badge-neutral">' + App.esc(tg) + '</span>'; }).join('') + '</div>' +
              '<p class="muted small" style="margin-top:10px">' + App.esc(t.style) + ' style · ' + App.esc(t.category) + ' collection</p>',
            footer: '<button class="btn btn-accent" data-use="' + App.esc(t.id) + '">Use This Design ' + icon('arrow-right') + '</button>',
            onMount: function (panel) {
              panel.querySelector('[data-use]').addEventListener('click', function () {
                App.state.wizardTemplateId = t.id;
                App.modal.close();
                App.navigate(App.state.user ? '#/create' : '#/auth');
              });
            }
          });
        }
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
      });
    }
  };
  App.views.marketing = marketing;

  function featureBlock(ic, kicker, title, body, checks, flip, visual) {
    return '<div class="feature-row' + (flip ? ' flip' : '') + '">' +
      '<div class="feature-copy"><span class="feature-kicker">' + icon(ic) + ' ' + kicker + '</span>' +
      '<h3>' + title + '</h3><p>' + body + '</p><ul class="check-list">' +
      checks.map(function (c) { return '<li>' + icon('check') + ' ' + c + '</li>'; }).join('') +
      '</ul></div><div class="feature-visual">' + visual + '</div></div>';
  }
  function contactItem(ic, label, value) {
    return '<div class="contact-item"><span class="c-ic">' + icon(ic) + '</span><div><h5>' + label + '</h5><p>' + value + '</p></div></div>';
  }
  function pricingCard(name, amount, note, feats, featured) {
    return '<div class="card price-card' + (featured ? ' featured' : ' card-hover') + '">' +
      (featured ? '<span class="price-badge">MOST POPULAR</span>' : '') +
      '<div class="price-plan">' + name + '</div>' +
      '<div class="price-amount">' + amount + ' <small>' + note + '</small></div>' +
      '<ul class="price-feats">' + feats.map(function (f) { return '<li>' + icon('check') + ' ' + f + '</li>'; }).join('') + '</ul>' +
      '<button class="btn ' + (featured ? 'btn-accent' : 'btn-outline') + ' btn-block" data-nav-start>' + (featured ? 'Get Started' : 'Choose ' + name) + '</button></div>';
  }
  function faqItem(q, a) {
    return '<div class="acc-item"><button class="acc-trigger" aria-expanded="false"><span>' + q + '</span>' + icon('chevron-down') + '</button>' +
      '<div class="acc-panel"><div class="acc-panel-inner"><p>' + a + '</p></div></div></div>';
  }
  function mockBuilderVisual() {
    var items = ['Hero', 'Countdown', 'Details', 'Gallery', 'RSVP'];
    return '<div style="display:flex;min-height:290px;text-align:left">' +
      '<div style="width:132px;min-width:132px;border-right:1px solid var(--border);padding:14px 12px;background:#FBFAF8">' +
      '<div class="tiny" style="font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:10px">Sections</div>' +
      items.map(function (s, i) {
        return '<div style="display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:8px;font-size:12px;font-weight:600;margin-bottom:4px;' +
          (i === 1 ? 'background:var(--accent-soft);color:var(--accent-deep)' : 'color:var(--muted)') + '">' + icon('grip') + ' ' + s + '</div>';
      }).join('') + '</div>' +
      '<div style="flex:1;padding:16px;background:var(--accent-soft)">' +
      '<div style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:var(--shadow-sm)">' +
      App.miniPreview(WEDDING_THEME, mockSections()) + '</div>' +
      '<div style="display:flex;gap:6px;justify-content:center;margin-top:12px">' +
      ['monitor', 'tablet', 'smartphone'].map(function (d, i) {
        return '<span class="icon-btn sm" style="' + (i === 0 ? 'background:#fff;color:var(--text)' : '') + '">' + icon(d) + '</span>';
      }).join('') + '</div></div></div>';
  }
  function mockGuestsVisual() {
    function stat(label, val, color) {
      return '<div class="card stat-card" style="padding:13px 14px"><div class="stat-label">' + label + '</div>' +
        '<div class="stat-value" style="font-size:21px;color:' + color + '">' + val + '</div></div>';
    }
    return '<div style="padding:16px;text-align:left">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      stat('Total guests', '186', 'var(--text)') + stat('Attending', '121', 'var(--sage)') +
      stat('Pending', '42', 'var(--amber)') + stat('Declined', '23', 'var(--danger)') + '</div>' +
      '<div style="margin:14px 0 6px;display:flex;justify-content:space-between;font-size:12px;font-weight:600"><span>RSVP rate</span><span class="muted">77%</span></div>' +
      '<div class="progress"><span style="width:77%"></span></div>' +
      '<div style="margin-top:14px;display:flex;flex-direction:column;gap:7px">' +
      [['Sarah Smith', 'Family', 'attending'], ['David Brown', 'Friends', 'pending'], ['Emma Wilson', 'Colleagues', 'attending']].map(function (g) {
        var col = g[2] === 'attending' ? 'var(--sage)' : 'var(--amber)';
        return '<div style="display:flex;align-items:center;gap:9px;font-size:12px">' + App.avatarHtml(g[0], 'sm') +
          '<span style="font-weight:600">' + g[0] + '</span><span class="muted tiny">' + g[1] + '</span>' +
          '<span class="dot" style="background:' + col + ';margin-left:auto"></span></div>';
      }).join('') + '</div></div>';
  }
  function mockRsvpVisual() {
    return '<div style="padding:18px;text-align:left">' +
      '<div style="font-weight:700;font-size:13.5px;margin-bottom:12px">Will you attend?</div>' +
      '<div style="display:flex;gap:8px;margin-bottom:14px">' +
      '<span class="badge badge-green" style="padding:8px 16px">Joyfully accepts</span>' +
      '<span class="badge badge-neutral" style="padding:8px 16px">Regretfully declines</span></div>' +
      '<div style="font-weight:600;font-size:12.5px;margin-bottom:6px">Meal preference <span class="badge badge-accent">if attending</span></div>' +
      '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px">' +
      ['Chicken', 'Beef', 'Fish', 'Vegetarian'].map(function (m, i) {
        return '<span class="badge ' + (i === 0 ? 'badge-dark' : 'badge-neutral') + '" style="padding:6px 12px">' + m + '</span>';
      }).join('') + '</div>' +
      '<div style="font-weight:600;font-size:12.5px;margin-bottom:6px">Dietary requirements</div>' +
      '<div style="border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-size:12px;color:var(--muted)">Allergic to nuts...</div></div>';
  }
  function mockEmailVisual() {
    return '<div style="padding:16px;text-align:left">' +
      '<div class="card" style="padding:14px;box-shadow:none;background:#FBFAF8">' +
      '<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:8px"><span>Save the Date 💌</span><span class="badge badge-green">Sent</span></div>' +
      '<div style="border-radius:8px;overflow:hidden;margin-bottom:10px">' + App.miniPreview(WEDDING_THEME, [App.createSection('hero')]) + '</div>' +
      '<p class="tiny muted" style="line-height:1.6">Dear {{guest.first_name}}, we are getting married! Join us on {{event.date}} at {{event.venue}}…</p></div>' +
      '<div style="display:flex;gap:10px;margin-top:12px">' +
      '<div class="card" style="flex:1;padding:10px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600">' + icon('qr-code') + ' QR invite</div>' +
      '<div class="card" style="flex:1;padding:10px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600">' + icon('clock') + ' Scheduled</div>' +
      '</div></div>';
  }

  /* ============================================================
     VIEW: AUTH
     ============================================================ */
  var auth = {
    render: function () {
      var isLogin = App.state.authMode === 'login';
      return '' +
      '<div class="view auth-view">' +
        '<aside class="auth-side">' +
          '<div class="auth-side-img" style="background-image:url(/images/wedding-hero.jpg)"></div>' +
          '<div class="auth-side-in"><a class="brand" href="#/" style="color:#fff"><span class="brand-mark">' + icon('heart') + '</span> Online RSVP</a></div>' +
          '<blockquote class="auth-side-in">“We planned our entire wedding from one dashboard. Every RSVP, every meal, every seat — effortless.”<div class="quote-by">— Sarah & James, married October 2025</div></blockquote>' +
        '</aside>' +
        '<div class="auth-form-col view-body">' +
          '<div class="auth-card">' +
            '<div class="auth-logo-row"><a class="brand" href="#/"><span class="brand-mark">' + icon('heart') + '</span> Online RSVP</a></div>' +
            '<div class="card"><div class="card-pad">' +
              '<h1 class="auth-title">' + (isLogin ? 'Welcome back' : 'Create your account') + '</h1>' +
              '<p class="auth-sub">' + (isLogin ? 'Sign in to manage your events and RSVPs.' : 'Start building your event website in minutes.') + '</p>' +
              '<form data-auth-form novalidate>' +
                (!isLogin ? '<div class="field"><label class="label" for="af-name">Full name <span class="req">*</span></label>' +
                  '<input class="input" id="af-name" autocomplete="name" placeholder="Jane Smith"></div>' : '') +
                '<div class="field"><label class="label" for="af-email">Email <span class="req">*</span></label>' +
                  '<input class="input" id="af-email" type="email" autocomplete="email" placeholder="you@example.com"></div>' +
                '<div class="field"><label class="label" for="af-pass">Password <span class="req">*</span></label>' +
                  '<div class="input-wrap" style="display:flex;align-items:center">' +
                  '<input class="input" id="af-pass" type="password" autocomplete="' + (isLogin ? 'current-password' : 'new-password') + '" placeholder="' + (isLogin ? 'Your password' : 'At least 8 characters') + '" style="padding-right:42px">' +
                  '<button type="button" class="pw-toggle" data-pw-toggle aria-label="Show password" style="position:absolute;right:6px">' + icon('eye') + '</button></div></div>' +
                '<button class="btn btn-accent btn-block btn-lg" type="submit" style="margin-top:6px" data-submit>' +
                  '<span data-submit-label>' + (isLogin ? 'Sign In' : 'Create Account') + '</span></button>' +
              '</form>' +
              '<button class="btn btn-outline btn-block" style="margin-top:12px" data-google>' + icon('globe') + ' Continue with Google</button>' +
              (isLogin ? '<button class="btn btn-ghost btn-block tiny" style="margin-top:4px" data-forgot>Forgot password?</button>' : '') +
              '<div class="auth-switch">' + (isLogin ? "Don't have an account? <button data-mode='register'>Sign up</button>" : 'Already have an account? <button data-mode=\'login\'>Sign in</button>') + '</div>' +
              (isLogin ?
                '<div class="demo-box"><span><b>Demo account</b><br>john@example.com / demo1234</span>' +
                '<button class="btn btn-outline btn-sm" data-fill-demo>Fill</button></div>' : '') +
            '</div></div>' +
            '<div style="text-align:center;margin-top:18px"><button class="btn btn-ghost btn-sm" data-back-home>' + icon('arrow-left') + ' Back to home</button></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    },

    mount: function () {
      var form = App.qs('[data-auth-form]');
      if (!form) return;

      App.qsa('[data-mode]').forEach(function (b) {
        b.addEventListener('click', function () {
          App.state.authMode = b.getAttribute('data-mode');
          App.rerender();
        });
      });
      var back = App.qs('[data-back-home]');
      if (back) back.addEventListener('click', function () { App.navigate('#/'); });
      var g = App.qs('[data-google]');
      if (g) g.addEventListener('click', function () { App.toast('Google sign-in is not available in this demo', 'info'); });
      var forgot = App.qs('[data-forgot]');
      if (forgot) forgot.addEventListener('click', function () { App.toast('Password reset links would be emailed — try the demo account!', 'info'); });

      var pw = App.qs('#af-pass'), toggle = App.qs('[data-pw-toggle]');
      if (toggle) toggle.addEventListener('click', function () {
        var show = pw.type === 'password';
        pw.type = show ? 'text' : 'password';
        toggle.innerHTML = icon(show ? 'eye-off' : 'eye');
        toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      });

      var fill = App.qs('[data-fill-demo]');
      if (fill) fill.addEventListener('click', function () {
        App.qs('#af-email').value = 'john@example.com';
        App.qs('#af-pass').value = 'demo1234';
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var isLogin = App.state.authMode === 'login';
        var nameEl = App.qs('#af-name'), emailEl = App.qs('#af-email'), passEl = App.qs('#af-pass');
        var email = emailEl.value.trim(), pass = passEl.value;
        [nameEl, emailEl, passEl].forEach(function (i) { if (i) i.removeAttribute('aria-invalid'); });
        if (!isLogin && !nameEl.value.trim()) { nameEl.setAttribute('aria-invalid', 'true'); }
        if (!/^\S+@\S+\.\S+$/.test(email)) { emailEl.setAttribute('aria-invalid', 'true'); }
        if (pass.length < 8) { passEl.setAttribute('aria-invalid', 'true'); }
        if (form.querySelector('[aria-invalid="true"]')) {
          App.toast('Please fix the highlighted fields', 'error');
          return;
        }
        var btn = App.qs('[data-submit]', form);
        var label = App.qs('[data-submit-label]', form);
        btn.disabled = true;
        label.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px"></span>Please wait…';
        var req = isLogin
          ? App.api('/api/auth/login', { body: { email: email, password: pass } })
          : App.api('/api/auth/register', { body: { name: nameEl.value.trim(), email: email, password: pass } });
        req.then(function (res) {
          App.state.user = res.user;
          return App.api('/api/events').then(function (ev) {
            App.state.events = ev.events || [];
          }).catch(function () { App.state.events = []; });
        }).then(function () {
          App.toast(isLogin ? 'Welcome back, ' + (App.state.user.name.split(' ')[0]) + '!' : 'Account created — welcome!');
          if (!isLogin || App.state.events.length === 0) App.navigate('#/create');
          else App.navigate('#/app');
        }).catch(function (err) {
          btn.disabled = false;
          label.textContent = isLogin ? 'Sign In' : 'Create Account';
          App.toast(err.message || 'Authentication failed', 'error');
        });
      });
    }
  };
  App.views.auth = auth;

  /* ============================================================
     VIEW: CREATE EVENT WIZARD
     ============================================================ */
  var wizard = {
    step: 1,
    data: { type: '', name: '', eventDate: '', timezone: 'Asia/Dubai', startTime: '17:00', endTime: '23:00', hostNames: '', venue: '', address: '', description: '' },
    templates: null,
    tplSearch: '',
    tplStyle: 'All',
    selectedTpl: null,

    TYPES: [
      ['wedding', 'Wedding', 'heart'], ['engagement', 'Engagement', 'gem'], ['birthday', 'Birthday', 'cake'],
      ['anniversary', 'Anniversary', 'sparkles'], ['baby_shower', 'Baby Shower', 'baby'], ['corporate', 'Corporate', 'briefcase'],
      ['party', 'Party', 'party-popper'], ['other', 'Other', 'ellipsis']
    ],
    STYLES: ['All', 'Modern', 'Minimal', 'Luxury', 'Floral', 'Classic', 'Romantic', 'Editorial', 'Dark'],

    render: function () {
      var rail = [
        ['Event type', 1], ['Details', 2], ['Design', 3]
      ].map(function (s, i) {
        var cls = wizard.step > s[1] ? 'done' : wizard.step === s[1] ? 'active' : '';
        return '<div class="wiz-step-pill ' + cls + '"><span class="wiz-dot">' + (wizard.step > s[1] ? icon('check') : s[1]) + '</span><span class="wiz-lab">' + s[0] + '</span></div>' +
          (i < 2 ? '<div class="wiz-rail-line' + (wizard.step > s[1] ? ' done' : '') + '"></div>' : '');
      }).join('');

      var body = '';
      if (wizard.step === 1) {
        body = '<h2 class="wiz-title">What are we celebrating?</h2><p class="wiz-desc">Pick your event type — we will tailor designs and sections to match.</p>' +
          '<div class="type-grid">' + wizard.TYPES.map(function (t) {
            return '<button type="button" class="type-card' + (wizard.data.type === t[0] ? ' sel' : '') + '" data-type="' + t[0] + '">' +
              '<span class="t-check">' + icon('check') + '</span><span class="t-ic">' + icon(t[2]) + '</span>' + t[1] + '</button>';
          }).join('') + '</div>';
      } else if (wizard.step === 2) {
        body = '<h2 class="wiz-title">Event details</h2><p class="wiz-desc">You can change all of this later in Settings.</p>' +
          '<div class="form-grid">' +
          '<div class="field span-2"><label class="label" for="wz-name">Event name <span class="req">*</span></label><input class="input" id="wz-name" placeholder="John &amp; Emily\'s Wedding" value="' + App.escAttr(wizard.data.name) + '"></div>' +
          '<div class="field"><label class="label" for="wz-date">Event date <span class="req">*</span></label><input class="input" id="wz-date" type="date" min="' + new Date().toISOString().slice(0, 10) + '" value="' + App.escAttr(wizard.data.eventDate) + '"></div>' +
          '<div class="field"><label class="label" for="wz-tz">Timezone</label><select class="select" id="wz-tz">' +
          ['Asia/Dubai', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney', 'UTC'].map(function (tz) {
            return '<option' + (wizard.data.timezone === tz ? ' selected' : '') + '>' + tz + '</option>';
          }).join('') + '</select></div>' +
          '<div class="field"><label class="label" for="wz-start">Starts at</label><input class="input" id="wz-start" type="time" value="' + App.escAttr(wizard.data.startTime) + '"></div>' +
          '<div class="field"><label class="label" for="wz-end">Ends at</label><input class="input" id="wz-end" type="time" value="' + App.escAttr(wizard.data.endTime) + '"></div>' +
          '<div class="field"><label class="label" for="wz-hosts">Host names</label><input class="input" id="wz-hosts" placeholder="John Smith &amp; Emily Doe" value="' + App.escAttr(wizard.data.hostNames) + '"></div>' +
          '<div class="field"><label class="label" for="wz-venue">Venue</label><input class="input" id="wz-venue" placeholder="The Grand Ballroom" value="' + App.escAttr(wizard.data.venue) + '"></div>' +
          '<div class="field span-2"><label class="label" for="wz-addr">Address</label><input class="input" id="wz-addr" placeholder="1 Celebration Ave, Dubai" value="' + App.escAttr(wizard.data.address) + '"></div>' +
          '<div class="field span-2"><label class="label" for="wz-desc">Description</label><textarea class="textarea" id="wz-desc" placeholder="A short welcome message for your guests…">' + App.esc(wizard.data.description) + '</textarea></div>' +
          '</div>';
      } else {
        var list = (wizard.templates || []).filter(function (t) {
          var matchCat = !wizard.data.type || t.category.toLowerCase().indexOf(wizard.data.type.replace('_', ' ')) !== -1 || wizard.data.type === 'other';
          var matchSearch = !wizard.tplSearch || (t.name + ' ' + t.style + ' ' + t.tags.join(' ')).toLowerCase().indexOf(wizard.tplSearch.toLowerCase()) !== -1;
          var matchStyle = wizard.tplStyle === 'All' || t.style.toLowerCase() === wizard.tplStyle.toLowerCase();
          return matchSearch && matchStyle;
        });
        var matching = list.filter(function (t) { return t.category.toLowerCase() === wizard.data.type.replace('_', ' '); });
        var others = list.filter(function (t) { return t.category.toLowerCase() !== wizard.data.type.replace('_', ' '); });
        var sorted = matching.concat(others);
        body = '<h2 class="wiz-title">Choose a design</h2><p class="wiz-desc">Start from a beautiful template — you can customize everything later.</p>' +
          '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;align-items:center">' +
          '<div class="input-wrap" style="flex:1;min-width:200px"><input class="input" id="wz-search" placeholder="Search designs…" value="' + App.escAttr(wizard.tplSearch) + '"><span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);display:flex">' + icon('search') + '</span></div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap">' + wizard.STYLES.map(function (s) {
            return '<button type="button" class="chip' + (wizard.tplStyle === s ? ' active' : '') + '" data-style="' + s + '">' + s + '</button>';
          }).join('') + '</div></div>' +
          '<div style="max-height:460px;overflow-y:auto;padding:4px;margin:-4px">' +
          (!wizard.templates ? '<div class="center" style="padding:60px 0"><span class="spinner spinner-lg"></span></div>' :
            sorted.length ? '<div class="tpl-pick-grid">' + sorted.map(function (t) {
              return '<div class="tpl-pick' + (wizard.selectedTpl === t.id ? ' sel' : '') + '" data-tpl="' + App.escAttr(t.id) + '" tabindex="0" role="button">' +
                '<span class="t-check">' + icon('check') + '</span>' + App.miniPreview(t.theme, t.sections) +
                '<div class="tpl-name"><span>' + App.esc(t.name) + '</span><span class="badge badge-neutral">' + App.esc(t.category) + '</span></div></div>';
            }).join('') + '</div>'
            : '<div class="empty"><div class="empty-ic">' + icon('search') + '</div><h4>No designs match</h4><p>Try a different search or style.</p></div>') +
          '</div>';
      }

      var actions =
        '<div class="wiz-actions">' +
        (wizard.step === 1 ? '<button class="btn btn-outline" data-cancel-wiz>Cancel</button>' : '<button class="btn btn-outline" data-prev>Back</button>') +
        (wizard.step < 3
          ? '<button class="btn btn-accent" data-next>Continue ' + icon('arrow-right') + '</button>'
          : '<button class="btn btn-accent btn-lg" data-create>Create my event ' + icon('sparkles') + '</button>') +
        '</div>';

      return '<div class="view wiz-view">' +
        '<div class="wiz-topbar"><a class="brand" href="#/"><span class="brand-mark">' + icon('heart') + '</span> Online RSVP</a>' +
        '<span class="muted small" style="margin-left:auto">Step ' + wizard.step + ' of 3</span></div>' +
        '<div class="wiz-body"><div class="wiz-card">' +
        '<div class="wiz-rail">' + rail + '</div>' +
        '<div class="card card-pad">' + body + actions + '</div>' +
        (wizard.step === 3 ? '<div class="wiz-scratch"><button data-scratch>Start from scratch (blank website)</button></div>' : '') +
        '</div></div></div>';
    },

    mount: function () {
      if (wizard.step === 3 && !wizard.templates) {
        App.api('/api/templates').then(function (res) {
          wizard.templates = res.templates || [];
          if (App.state.wizardTemplateId) wizard.selectedTpl = App.state.wizardTemplateId;
          wizard.refreshBody();
        }).catch(function () { wizard.templates = []; wizard.refreshBody(); });
      }

      App.qsa('[data-type]').forEach(function (b) {
        b.addEventListener('click', function () {
          wizard.data.type = b.getAttribute('data-type');
          App.qsa('[data-type]').forEach(function (x) { x.classList.remove('sel'); });
          b.classList.add('sel');
        });
      });
      App.qsa('[data-style]').forEach(function (b) {
        b.addEventListener('click', function () {
          wizard.tplStyle = b.getAttribute('data-style');
          wizard.refreshBody();
        });
      });
      App.qsa('[data-tpl]').forEach(function (b) {
        function select() {
          wizard.selectedTpl = b.getAttribute('data-tpl');
          App.qsa('[data-tpl]').forEach(function (x) { x.classList.remove('sel'); });
          b.classList.add('sel');
        }
        b.addEventListener('click', select);
        b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } });
      });
      var search = App.qs('#wz-search');
      if (search) {
        search.addEventListener('input', function () {
          wizard.tplSearch = search.value;
          wizard.refreshBody();
        });
      }

      var next = App.qs('[data-next]');
      if (next) next.addEventListener('click', function () {
        if (wizard.step === 1) {
          if (!wizard.data.type) { App.toast('Please choose an event type', 'error'); return; }
          wizard.step = 2;
        } else if (wizard.step === 2) {
          wizard.collect();
          if (!wizard.data.name.trim()) { App.toast('Event name is required', 'error'); App.qs('#wz-name').focus(); return; }
          if (!wizard.data.eventDate) { App.toast('Event date is required', 'error'); App.qs('#wz-date').focus(); return; }
          wizard.step = 3;
        }
        App.rerender();
      });

      var prev = App.qs('[data-prev]');
      if (prev) prev.addEventListener('click', function () {
        if (wizard.step === 2) wizard.collect();
        wizard.step = Math.max(1, wizard.step - 1);
        App.rerender();
      });

      var cancel = App.qs('[data-cancel-wiz]');
      if (cancel) cancel.addEventListener('click', function () { App.navigate('#/'); });

      var scratch = App.qs('[data-scratch]');
      if (scratch) scratch.addEventListener('click', function () {
        wizard.selectedTpl = null;
        wizard.create();
      });

      var create = App.qs('[data-create]');
      if (create) create.addEventListener('click', function () { wizard.create(); });
    },

    refreshBody: function () {
      var scroll = window.scrollY;
      var search = App.qs('#wz-search');
      var hadFocus = search && document.activeElement === search;
      App.route();
      window.scrollTo(0, scroll);
      if (hadFocus) {
        var s2 = App.qs('#wz-search');
        if (s2) { s2.focus(); s2.setSelectionRange(s2.value.length, s2.value.length); }
      }
    },

    collect: function () {
      var g = function (id) { var el = App.qs(id); return el ? el.value : null; };
      wizard.data.name = g('#wz-name') || wizard.data.name;
      wizard.data.eventDate = g('#wz-date') || wizard.data.eventDate;
      wizard.data.timezone = g('#wz-tz') || wizard.data.timezone;
      wizard.data.startTime = g('#wz-start') || wizard.data.startTime;
      wizard.data.endTime = g('#wz-end') || wizard.data.endTime;
      wizard.data.hostNames = g('#wz-hosts') || wizard.data.hostNames;
      wizard.data.venue = g('#wz-venue') || wizard.data.venue;
      wizard.data.address = g('#wz-addr') || wizard.data.address;
      wizard.data.description = g('#wz-desc') || wizard.data.description;
    },

    create: function () {
      wizard.collect();
      if (!wizard.data.name.trim() || !wizard.data.eventDate) {
        wizard.step = 2;
        App.rerender();
        App.toast('Please complete the required event details', 'error');
        return;
      }
      var btn = App.qs('[data-create]') || App.qs('[data-scratch]');
      if (btn) { btn.disabled = true; }
      App.toast('Creating your event…', 'info');
      App.api('/api/events', {
        body: {
          name: wizard.data.name.trim(),
          type: wizard.data.type || 'other',
          eventDate: wizard.data.eventDate,
          startTime: wizard.data.startTime || '17:00',
          endTime: wizard.data.endTime || '23:00',
          timezone: wizard.data.timezone || 'Asia/Dubai',
          venue: wizard.data.venue,
          address: wizard.data.address,
          description: wizard.data.description,
          hostNames: wizard.data.hostNames,
          templateId: wizard.selectedTpl || undefined
        }
      }).then(function (res) {
        App.state.currentEvent = res.event;
        App.state.events.unshift(res.event);
        App.state.wizardTemplateId = null;
        App.toast('Event created — welcome to your dashboard!');
        wizard.step = 1;
        App.navigate('#/app');
      }).catch(function (err) {
        if (btn) btn.disabled = false;
        App.toast(err.message || 'Could not create event', 'error');
      });
    }
  };
  App.views.create = wizard;
  App.views.onboarding = wizard;

  /* ---------------- Boot ---------------- */
  function boot() {
    App.api('/api/auth/me').then(function (res) {
      if (res && res.user) {
        App.state.user = res.user;
        return App.api('/api/events').then(function (ev) {
          App.state.events = ev.events || [];
        }).catch(function () { App.state.events = []; });
      }
    }).catch(function () { /* not signed in */ }).then(function () {
      App.state.hydrated = true;
      window.addEventListener('hashchange', App.route);
      App.route();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    // Defer scripts run at 'interactive' — defer a tick so later scripts can register their views
    setTimeout(boot, 0);
  }
})();
