// support.js — navigation + storage helpers for PaperTrail Dashboard.dc.html
// Provides buildNav() which returns the {{ nav.* }} values and the
// navDashboard / navReceipts / navReview / navCategories / navReports /
// navSettings click handlers referenced in the sidebar template.

(function (global) {
  "use strict";

  // Active vs inactive nav-button styling. The active page gets a solid
  // white pill; inactive items are transparent with muted text.
  var ACTIVE = { bg: "#FFFFFF", fg: "#14181B", weight: "600" };
  var INACTIVE = { bg: "transparent", fg: "#6A7176", weight: "500" };

  function style(active) { return active ? ACTIVE : INACTIVE; }

  // Storage is a fixed mock — the filing cabinet meter in the sidebar.
  var STORAGE_USED_GB = 2.4;
  var STORAGE_TOTAL_GB = 5;
  var STORAGE_PCT = Math.round((STORAGE_USED_GB / STORAGE_TOTAL_GB) * 100);

  // buildNav(state) → { nav, navDashboard, navReceipts, …, navSettings }
  //
  // `state` is the component's current state object:
  //   { receipts, ws, filter, query, view, … }
  // Returns the `nav` object (for {{ nav.* }} interpolation) plus the six
  // navigation click handlers the sidebar buttons bind to.
  function buildNav(state) {
    var ws = state.ws || "personal";
    var receipts = state.receipts || [];
    var scoped = receipts.filter(function (r) { return r.ws === ws; });
    var reviewCount = scoped.filter(function (r) { return !r.cat; }).length;

    // Dashboard is the only wired-up page; every other nav item is
    // present but inert (the buttons still hover, they just don't route).
    var dash = style(true);
    var rec = style(false);
    var rev = style(false);
    var cat = style(false);
    var rep = style(false);
    var set = style(false);

    var nav = {
      // Dashboard (active)
      dashBg: dash.bg, dashFg: dash.fg, dashWeight: dash.weight,
      // Receipts
      recBg: rec.bg, recFg: rec.fg, recWeight: rec.weight,
      recCount: String(scoped.length).padStart(2, "0"),
      // Needs review
      revBg: rev.bg, revFg: rev.fg, revWeight: rev.weight,
      revCount: String(reviewCount),
      revBadgeBg: reviewCount > 0 ? "#FBF2E0" : "#EDE9E0",
      revBadgeFg: reviewCount > 0 ? "#8A5209" : "#9AA0A4",
      // Categories
      catBg: cat.bg, catFg: cat.fg, catWeight: cat.weight,
      // Reports
      repBg: rep.bg, repFg: rep.fg, repWeight: rep.weight,
      // Settings
      setBg: set.bg, setFg: set.fg, setWeight: set.weight,
      // Storage meter
      storageLabel: STORAGE_USED_GB.toFixed(1) + " GB used",
      storageWidth: STORAGE_PCT + "%",
      storageNote:
        (STORAGE_TOTAL_GB - STORAGE_USED_GB).toFixed(1) +
        " GB free of " + STORAGE_TOTAL_GB + " GB",
    };

    return nav;
  }

  // Navigation handlers — only Dashboard is live; the rest are placeholders
  // that could route to other pages. Each is a no-op so the sidebar buttons
  // don't throw when clicked.
  function navDashboard() {}
  function navReceipts() {}
  function navReview() {}
  function navCategories() {}
  function navReports() {}
  function navSettings() {}

  // Expose as globals so the Component's renderVals() can reference them.
  global.buildNav = buildNav;
  global.navDashboard = navDashboard;
  global.navReceipts = navReceipts;
  global.navReview = navReview;
  global.navCategories = navCategories;
  global.navReports = navReports;
  global.navSettings = navSettings;
})(typeof window !== "undefined" ? window : this);
