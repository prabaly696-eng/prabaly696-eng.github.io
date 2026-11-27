/*
  roof-pitch.js
  Roof pitch from rise and run.
    pitch per 12 = rise / run * 12
    slope %      = rise / run * 100
    angle        = arctan(rise / run)
    multiplier   = square root of (1 + (rise / run)^2)
*/
(function (root) {
  'use strict';
  var U = root.Util || require('./main.js');

  function calculate(raw) {
    var errors = [];
    var rise = U.readNumber(raw, 'rise', 'Rise', errors, { min: 0, max: 100000 });
    var run = U.readNumber(raw, 'run', 'Run', errors, { minExclusive: 0, max: 100000 });
    if (errors.length) { return { ok: false, errors: errors }; }
    var ratio = rise / run;
    return {
      ok: true,
      data: {
        rise: rise,
        run: run,
        pitchPer12: ratio * 12,
        slopePercent: ratio * 100,
        angleDeg: Math.atan(ratio) * 180 / Math.PI,
        multiplier: Math.sqrt(1 + ratio * ratio)
      }
    };
  }

  // A small right-triangle drawing, scaled to the numbers that were entered.
  function diagram(d) {
    var ratio = d.rise / d.run;
    var maxW = 190;
    var maxH = 80;
    var w = maxW;
    var h = w * ratio;
    if (h > maxH) { h = maxH; w = h / ratio; }
    if (w < 28) { w = 28; }
    var x0 = 24;
    var yb = 108;
    var x1 = x0 + w;
    var yTop = yb - h;
    var theta = Math.atan2(h, w);
    var arcR = Math.min(26, w * 0.6);
    var ax = x0 + arcR * Math.cos(theta);
    var ay = yb - arcR * Math.sin(theta);
    var s = '<figure class="diagram"><svg viewBox="0 0 270 134" role="img" aria-label="Right triangle with a rise of ' +
      U.fmt(d.rise, 2) + ' and a run of ' + U.fmt(d.run, 2) + '">';
    if (h > 0.5) {
      s += '<polygon class="dg-fill" points="' + x0 + ',' + yb + ' ' + x1 + ',' + yb + ' ' + x1 + ',' + yTop + '"/>';
      s += '<polyline class="dg-line" points="' + x0 + ',' + yb + ' ' + x1 + ',' + yTop + ' ' + x1 + ',' + yb + ' ' + x0 + ',' + yb + '"/>';
      s += '<path class="dg-arc" d="M ' + (x0 + arcR) + ' ' + yb + ' A ' + arcR + ' ' + arcR + ' 0 0 0 ' + ax.toFixed(2) + ' ' + ay.toFixed(2) + '"/>';
    } else {
      s += '<line class="dg-line" x1="' + x0 + '" y1="' + yb + '" x2="' + x1 + '" y2="' + yb + '"/>';
    }
    s += '<text class="dg-text" x="' + (x0 + w / 2) + '" y="' + (yb + 18) + '" text-anchor="middle">Run</text>';
    s += '<text class="dg-text" x="' + (x1 + 8) + '" y="' + (yb - h / 2 + 4) + '">Rise</text>';
    s += '<text class="dg-text" x="266" y="14" text-anchor="end">Angle ' + U.fmt(d.angleDeg, 1) + '\u00B0</text>';
    s += '</svg></figure>';
    return s;
  }

  function render(d) {
    return U.resultHTML({
      extraHTML: diagram(d),
      label: 'Roof pitch',
      value: U.fmt(d.pitchPer12, 2) + ' : 12',
      sub: 'The roof rises ' + U.fmt(d.pitchPer12, 2) + ' units for every 12 units of horizontal run.',
      rows: [
        ['Slope', U.fmt(d.slopePercent, 2) + '%'],
        ['Angle', U.fmt(d.angleDeg, 2) + '°'],
        ['Surface multiplier', U.fmt(d.multiplier, 4)],
        ['Rafter length per 12 in of run', U.fmt(d.multiplier * 12, 2) + ' in']
      ],
      notes: [
        'Multiply the flat (horizontal) area of a roof section by ' + U.fmt(d.multiplier, 4) +
        ' to estimate its sloped surface area. This does not include overhangs, waste or extras.'
      ]
    });
  }

  var api = { calculate: calculate, render: render };
  root.RoofPitch = api;
  if (typeof document !== 'undefined') {
    U.bindCalculator({ formId: 'calc-form', calculate: calculate, render: render });
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
