/*
  retaining-wall.js
  Basic material estimate for a block wall. This is NOT an engineering or safety check.
  Works in US units (ft, in) or Metric (m, cm). Inside, everything is worked out in feet and inches.
    wall face area   = length x height
    block face area  = block length x block height / 144   (square feet, with block sizes in inches)
    blocks (exact)   = wall face area / block face area
    blocks to buy    = round up (exact x (1 + waste / 100))
    courses (rows)   = round up (wall height in inches / block height)
    blocks per row   = round up (wall length in inches / block length)
*/
(function (root) {
  'use strict';
  var U = root.Util || require('./main.js');

  function calculate(raw) {
    var errors = [];
    var sys = U.sys(raw);
    var length = U.readLen(raw, 'length', 'Wall length', errors, { base: 'ft', us: 'ft', metric: 'm', max: 2000 });
    var height = U.readLen(raw, 'height', 'Wall height', errors, { base: 'ft', us: 'ft', metric: 'm', max: 30 });
    var blockLength = U.readLen(raw, 'blockLength', 'Block length', errors, { base: 'in', us: 'in', metric: 'cm', max: 60 });
    var blockHeight = U.readLen(raw, 'blockHeight', 'Block height', errors, { base: 'in', us: 'in', metric: 'cm', max: 36 });
    var waste = U.readNumber(raw, 'waste', 'Waste allowance', errors, { optional: true, min: 0, max: 100 });
    if (errors.length) { return { ok: false, errors: errors }; }

    var wastePct = waste === null ? 0 : waste;
    var areaSqFt = length * height;
    var blockFaceSqFt = blockLength * blockHeight / 144;
    var exact = areaSqFt / blockFaceSqFt;
    var blocks = U.ceil(exact * (1 + wastePct / 100));
    var courses = U.ceil(height * 12 / blockHeight);
    var perCourse = U.ceil(length * 12 / blockLength);

    return {
      ok: true,
      data: {
        sys: sys,
        length: length,
        height: height,
        blockLength: blockLength,
        blockHeight: blockHeight,
        wastePct: wastePct,
        areaSqFt: areaSqFt,
        blockFaceSqFt: blockFaceSqFt,
        exact: exact,
        blocks: blocks,
        courses: courses,
        perCourse: perCourse
      }
    };
  }

  // A small brick-pattern picture (up to 8 courses and 10 blocks per course are drawn).
  function diagram(d) {
    var rows = Math.min(d.courses, 8);
    var cols = Math.min(d.perCourse, 10);
    var w = 200;
    var h = 84;
    var bh = h / rows;
    var bw = w / cols;
    var s = '<figure class="diagram"><svg viewBox="0 0 270 126" role="img" aria-label="Wall of ' + d.courses + ' courses with ' + d.perCourse + ' blocks per course">';
    s += '<rect class="dg-fill" x="24" y="10" width="' + w + '" height="' + h + '"/>';
    for (var r = 1; r < rows; r++) {
      var y = 10 + r * bh;
      s += '<line class="dg-grid" x1="24" y1="' + y.toFixed(2) + '" x2="' + (24 + w) + '" y2="' + y.toFixed(2) + '"/>';
    }
    for (var r2 = 0; r2 < rows; r2++) {
      var offset = r2 % 2 === 0 ? 0 : bw / 2;
      for (var c = 1; c <= cols; c++) {
        var x = 24 + c * bw - (bw - offset);
        if (x > 24 + 0.5 && x < 24 + w - 0.5) {
          s += '<line class="dg-grid" x1="' + x.toFixed(2) + '" y1="' + (10 + r2 * bh).toFixed(2) + '" x2="' + x.toFixed(2) + '" y2="' + (10 + (r2 + 1) * bh).toFixed(2) + '"/>';
        }
      }
    }
    s += '<rect class="dg-line" x="24" y="10" width="' + w + '" height="' + h + '"/>';
    s += '<text class="dg-text" x="124" y="112" text-anchor="middle">' + d.perCourse + ' blocks per course</text>';
    s += '<text class="dg-text" x="232" y="56">' + d.courses + ' courses</text>';
    s += '</svg></figure>';
    return s;
  }

  function render(d) {
    return U.resultHTML({
      label: 'Wall blocks to buy',
      value: U.fmt(d.blocks, 0),
      unit: 'blocks',
      sub: 'Includes ' + U.fmt(d.wastePct, 2) + '% waste.',
      rows: [
        ['Wall face area', U.units.area(d.areaSqFt, d.sys)],
        ['Face area of one block', U.units.area(d.blockFaceSqFt, d.sys, 3)],
        ['Blocks before waste', U.fmt(d.exact, 1)],
        ['Courses (rows), rounded up', U.fmt(d.courses, 0)],
        ['Blocks per course, rounded up', U.fmt(d.perCourse, 0)]
      ],
      extraHTML: diagram(d),
      notes: [
        'This is a basic material estimate. It is not an engineering or structural safety assessment.',
        'It does not include cap blocks, gravel backfill, drainage pipe, base material or reinforcement.'
      ]
    });
  }

  var api = { calculate: calculate, render: render };
  root.RetainingWall = api;
  if (typeof document !== 'undefined') {
    U.bindCalculator({ formId: 'calc-form', calculate: calculate, render: render });
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
