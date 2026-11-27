/*
  tile-flooring.js
  Tiles or planks for a rectangular floor. Works in US units (ft, in) or Metric (m, cm, mm).
    floor area     = length x width
    one piece      = (tile length + gap) x (tile width + gap)
    pieces (exact) = floor area / one piece
    pieces to buy  = round up (exact x (1 + waste / 100))
    boxes          = round up (pieces to buy / pieces per box)      (only if you enter pieces per box)
  For plank flooring, enter the plank length and width and a gap of 0.
  This is an area estimate. It does not plan the layout, so cuts at the walls are covered by the waste allowance.
*/
(function (root) {
  'use strict';
  var U = root.Util || require('./main.js');

  function calculate(raw) {
    var errors = [];
    var sys = U.sys(raw);
    var length = U.readLen(raw, 'length', 'Room length', errors, { base: 'ft', us: 'ft', metric: 'm', max: 500 });
    var width = U.readLen(raw, 'width', 'Room width', errors, { base: 'ft', us: 'ft', metric: 'm', max: 500 });
    var tileLength = U.readLen(raw, 'tileLength', 'Tile or plank length', errors, { base: 'in', us: 'in', metric: 'cm', max: 120 });
    var tileWidth = U.readLen(raw, 'tileWidth', 'Tile or plank width', errors, { base: 'in', us: 'in', metric: 'cm', max: 120 });
    var gap = U.readLen(raw, 'gap', 'Gap or grout line', errors, { base: 'in', us: 'in', metric: 'mm', max: 2, allowZero: true });
    var waste = U.readNumber(raw, 'waste', 'Waste allowance', errors, { optional: true, min: 0, max: 100 });
    var perBox = U.readNumber(raw, 'perBox', 'Pieces per box', errors, { optional: true, minExclusive: 0, max: 1000, whole: true });
    if (errors.length) { return { ok: false, errors: errors }; }

    var wastePct = waste === null ? 0 : waste;
    var areaSqFt = length * width;
    var pieceSqFt = (tileLength + gap) * (tileWidth + gap) / 144;
    var exact = areaSqFt / pieceSqFt;
    var pieces = U.ceil(exact * (1 + wastePct / 100));
    return {
      ok: true,
      data: {
        sys: sys,
        areaSqFt: areaSqFt,
        areaToBuySqFt: areaSqFt * (1 + wastePct / 100),
        pieceSqFt: pieceSqFt,
        exact: exact,
        wastePct: wastePct,
        pieces: pieces,
        perBox: perBox,
        boxes: perBox === null ? null : U.ceil(pieces / perBox)
      }
    };
  }

  function render(d) {
    var rows = [
      ['Floor area', U.units.area(d.areaSqFt, d.sys)],
      ['Floor area with ' + U.fmt(d.wastePct, 2) + '% waste', U.units.area(d.areaToBuySqFt, d.sys)],
      ['Pieces before waste', U.fmt(d.exact, 1)]
    ];
    rows.push(['Boxes needed', d.boxes === null ? 'Enter pieces per box to see this' : U.fmt(d.boxes, 0) + ' boxes of ' + U.fmt(d.perBox, 0)]);
    return U.resultHTML({
      label: 'Tiles or planks to buy',
      value: U.fmt(d.pieces, 0),
      unit: 'pieces',
      sub: 'Includes ' + U.fmt(d.wastePct, 2) + '% waste.',
      rows: rows,
      notes: [
        'Some flooring is sold by the box, with the covered area printed on the box. Compare the "floor area with waste" row with that number.',
        'This is an area estimate. It does not plan the layout. Diagonal patterns, large tiles and rooms with many corners usually need more waste.'
      ]
    });
  }

  var api = { calculate: calculate, render: render };
  root.TileFlooring = api;
  if (typeof document !== 'undefined') {
    U.bindCalculator({ formId: 'calc-form', calculate: calculate, render: render });
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
