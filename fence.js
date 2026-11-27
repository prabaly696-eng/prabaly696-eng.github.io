/*
  fence.js
  Counts fence posts only. Rails, panels, gates and hardware are NOT estimated.
  Works in US units (ft) or Metric (m).
    sections      = round up (fence length / maximum post spacing)
    open run      : posts = sections + 1    (a post at both ends)
    closed loop   : posts = sections        (the last section meets the first post)
    posts to buy  = round up (posts x (1 + spare allowance / 100))
    actual spacing = fence length / sections (if posts are spaced evenly)
*/
(function (root) {
  'use strict';
  var U = root.Util || require('./main.js');

  function calculate(raw) {
    var errors = [];
    var sys = U.sys(raw);
    var length = U.readLen(raw, 'length', 'Fence length', errors, { base: 'ft', us: 'ft', metric: 'm', max: 10000 });
    var spacing = U.readLen(raw, 'spacing', 'Post spacing', errors, { base: 'ft', us: 'ft', metric: 'm', max: 50 });
    var spare = U.readNumber(raw, 'spare', 'Spare post allowance', errors, { optional: true, min: 0, max: 100 });
    var layout = raw.layout === 'loop' ? 'loop' : 'run';
    if (errors.length) { return { ok: false, errors: errors }; }

    var sections = U.ceil(length / spacing);
    if (layout === 'loop' && sections < 3) {
      errors.push({
        field: 'layout',
        message: 'A closed fence needs at least 3 sections. Increase the length, reduce the post spacing, or choose "Open run".'
      });
      return { ok: false, errors: errors };
    }
    var posts = layout === 'loop' ? sections : sections + 1;
    var sparePct = spare === null ? 0 : spare;
    var total = U.ceil(posts * (1 + sparePct / 100));

    return {
      ok: true,
      data: {
        sys: sys,
        length: length,
        spacing: spacing,
        layout: layout,
        sections: sections,
        posts: posts,
        sparePct: sparePct,
        total: total,
        actualSpacing: length / sections
      }
    };
  }

  // A small picture of the posts (up to 14 posts are drawn).
  function diagram(d) {
    var shown = Math.min(d.posts, 14);
    var x0 = 30;
    var x1 = 240;
    var step = shown > 1 ? (x1 - x0) / (shown - 1) : 0;
    var s = '<figure class="diagram"><svg viewBox="0 0 270 110" role="img" aria-label="Fence line with ' + d.posts + ' posts">';
    s += '<line class="dg-line" x1="' + x0 + '" y1="48" x2="' + x1 + '" y2="48"/>';
    s += '<line class="dg-line" x1="' + x0 + '" y1="64" x2="' + x1 + '" y2="64"/>';
    for (var i = 0; i < shown; i++) {
      var x = x0 + i * step;
      s += '<rect class="dg-post" x="' + (x - 4).toFixed(2) + '" y="30" width="8" height="52" rx="1"/>';
    }
    s += '<text class="dg-text" x="135" y="102" text-anchor="middle">' + d.posts + ' posts, ' + d.sections + ' sections' + (d.layout === 'loop' ? ' (closed loop)' : '') + '</text>';
    s += '</svg></figure>';
    return s;
  }

  function render(d) {
    return U.resultHTML({
      label: 'Fence posts to buy',
      value: U.fmt(d.total, 0),
      unit: 'posts',
      sub: (d.layout === 'loop' ? 'Closed loop. ' : 'Open run with a post at each end. ') + 'Includes ' + U.fmt(d.sparePct, 2) + '% spares.',
      rows: [
        ['Sections between posts', U.fmt(d.sections, 0)],
        ['Posts before spares', U.fmt(d.posts, 0)],
        ['Spacing if posts are even', U.units.len(d.actualSpacing, d.sys)]
      ],
      extraHTML: diagram(d),
      notes: [
        'This counts posts only. Rails, panels, gates and hardware are not included.',
        'Corners, gates, slopes and local rules can change the number of posts. Count those separately.'
      ]
    });
  }

  var api = { calculate: calculate, render: render };
  root.Fence = api;
  if (typeof document !== 'undefined') {
    U.bindCalculator({ formId: 'calc-form', calculate: calculate, render: render });
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
