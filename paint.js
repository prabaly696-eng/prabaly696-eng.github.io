/*
  paint.js
  Paint for the walls of one rectangular room (and optionally the ceiling). Works in US units (ft, gallons)
  or Metric (m, liters).
    wall area      = 2 x (length + width) x height
    openings       = doors x 20 sq ft + windows x 15 sq ft       (fixed, typical sizes)
    paintable area = wall area - openings (+ ceiling area, length x width, if chosen)
    total area     = paintable area x coats
    paint          = total area / coverage of one gallon (or one liter)
  Trim, baseboards, primer and a second color are NOT included.
*/
(function (root) {
  'use strict';
  var U = root.Util || require('./main.js');

  var DOOR_SQFT = 20;
  var WINDOW_SQFT = 15;

  function calculate(raw) {
    var errors = [];
    var sys = U.sys(raw);
    var length = U.readLen(raw, 'length', 'Room length', errors, { base: 'ft', us: 'ft', metric: 'm', max: 300 });
    var width = U.readLen(raw, 'width', 'Room width', errors, { base: 'ft', us: 'ft', metric: 'm', max: 300 });
    var height = U.readLen(raw, 'height', 'Wall height', errors, { base: 'ft', us: 'ft', metric: 'm', max: 40 });
    var doors = U.readNumber(raw, 'doors', 'Number of doors', errors, { min: 0, max: 50, whole: true });
    var windows = U.readNumber(raw, 'windows', 'Number of windows', errors, { min: 0, max: 100, whole: true });
    var coats = U.readNumber(raw, 'coats', 'Number of coats', errors, { min: 1, max: 5, whole: true });
    var coverage = U.readNumber(raw, 'coverage', sys === 'metric' ? 'Coverage per liter' : 'Coverage per gallon', errors, { minExclusive: 0, max: sys === 'metric' ? 50 : 1000 });
    var ceiling = raw.ceiling === 'yes' ? 'yes' : 'no';
    if (errors.length) { return { ok: false, errors: errors }; }

    var wallArea = 2 * (length + width) * height;
    var openings = doors * DOOR_SQFT + windows * WINDOW_SQFT;
    if (wallArea - openings <= 0) {
      return { ok: false, errors: [{ field: 'doors', message: 'The doors and windows are larger than the walls. Check the room size and the number of doors and windows.' }] };
    }
    var ceilingArea = ceiling === 'yes' ? length * width : 0;
    var paintable = wallArea - openings + ceilingArea;
    var totalSqFt = paintable * coats;
    var amount;      // gallons (US) or liters (Metric)
    var rounded;
    if (sys === 'metric') {
      amount = (totalSqFt / U.SQFT_PER_SQM) / coverage;
      rounded = Math.ceil(amount * 2 - 1e-9) / 2;          // up to the next half liter
    } else {
      amount = totalSqFt / coverage;
      rounded = Math.ceil(amount * 4 - 1e-9) / 4;          // up to the next quarter gallon
    }
    return {
      ok: true,
      data: {
        sys: sys,
        wallArea: wallArea,
        openings: openings,
        ceiling: ceiling,
        ceilingArea: ceilingArea,
        paintable: paintable,
        coats: coats,
        totalSqFt: totalSqFt,
        amount: amount,
        rounded: rounded
      }
    };
  }

  function render(d) {
    var metric = d.sys === 'metric';
    var rows = [
      ['Wall area', U.units.area(d.wallArea, d.sys)],
      ['Doors and windows removed', U.units.area(d.openings, d.sys)]
    ];
    if (d.ceiling === 'yes') { rows.push(['Ceiling added', U.units.area(d.ceilingArea, d.sys)]); }
    rows.push(['Area to paint, one coat', U.units.area(d.paintable, d.sys)]);
    rows.push(['Area to paint, ' + d.coats + (d.coats === 1 ? ' coat' : ' coats'), U.units.area(d.totalSqFt, d.sys)]);
    rows.push(['Exact amount', U.fmt(d.amount, 2) + (metric ? ' liters' : ' gallons')]);
    return U.resultHTML({
      label: 'Paint to buy',
      value: U.fmt(d.rounded, 2),
      unit: metric ? 'liters' : 'gallons',
      sub: metric ? 'Rounded up to the next half liter.' : 'Rounded up to the next quarter gallon.',
      rows: rows,
      notes: [
        'Each door is counted as ' + U.units.area(DOOR_SQFT, d.sys) + ' and each window as ' + U.units.area(WINDOW_SQFT, d.sys) + '.',
        'Trim, baseboards, primer and a second color are not included. Rough or porous walls, dark colors and new drywall can need more paint.'
      ]
    });
  }

  var api = { calculate: calculate, render: render, DOOR_SQFT: DOOR_SQFT, WINDOW_SQFT: WINDOW_SQFT };
  root.Paint = api;
  if (typeof document !== 'undefined') {
    U.bindCalculator({ formId: 'calc-form', calculate: calculate, render: render });
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
