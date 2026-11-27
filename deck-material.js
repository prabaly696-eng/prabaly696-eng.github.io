/*
  deck-material.js
  Estimates decking boards (only the surface boards). Works in US units (ft, in) or Metric (m, mm).
    rows           = round up ((distance across the boards + gap) / (board width + gap))
    boards per row = round up (row length / board length)
    boards         = round up (rows x boards per row x (1 + waste / 100))
  Joists, beams, posts, footings, fasteners, railings and stairs are NOT included.
  Inside, everything is worked out in feet and inches. Metric input is converted first.
*/
(function (root) {
  'use strict';
  var U = root.Util || require('./main.js');

  var BOARD_LENGTHS = { us: [8, 10, 12, 16, 20], metric: [2.4, 3, 3.6, 4.2, 4.8] };

  function calculate(raw) {
    var errors = [];
    var sys = U.sys(raw);
    var length = U.readLen(raw, 'length', 'Deck length', errors, { base: 'ft', us: 'ft', metric: 'm', max: 500 });
    var width = U.readLen(raw, 'width', 'Deck width', errors, { base: 'ft', us: 'ft', metric: 'm', max: 500 });
    var boardWidth = U.readLen(raw, 'boardWidth', 'Board width', errors, { base: 'in', us: 'in', metric: 'mm', max: 24 });
    var gap = U.readLen(raw, 'gap', 'Gap between boards', errors, { base: 'in', us: 'in', metric: 'mm', max: 3, allowZero: true });
    var waste = U.readNumber(raw, 'waste', 'Waste allowance', errors, { optional: true, min: 0, max: 100 });
    var chosen = U.parse(raw.boardLength);
    var allowed = BOARD_LENGTHS[sys];
    var boardLengthOk = allowed.some(function (n) { return Math.abs(n - chosen) < 1e-9; });
    if (!boardLengthOk) {
      errors.push({ field: 'boardLength', message: 'Choose a board length from the list.' });
    }
    if (errors.length) { return { ok: false, errors: errors }; }

    var boardLengthFt = sys === 'metric' ? U.convert(chosen, 'm', 'ft') : chosen;
    var direction = raw.direction === 'width' ? 'width' : 'length';
    var runFt = direction === 'length' ? length : width;      // length of each board row
    var acrossFt = direction === 'length' ? width : length;   // distance the rows must cover
    var acrossIn = acrossFt * 12;

    var rows = U.ceil((acrossIn + gap) / (boardWidth + gap));
    var perRow = U.ceil(runFt / boardLengthFt);
    var baseBoards = rows * perRow;
    var wastePct = waste === null ? 0 : waste;
    var boards = U.ceil(baseBoards * (1 + wastePct / 100));
    var lastRowIn = acrossIn - (rows - 1) * (boardWidth + gap);

    return {
      ok: true,
      data: {
        sys: sys,
        length: length,
        width: width,
        direction: direction,
        areaSqFt: length * width,
        runFt: runFt,
        acrossFt: acrossFt,
        boardWidth: boardWidth,
        gap: gap,
        boardLength: chosen,
        boardLengthFt: boardLengthFt,
        rows: rows,
        perRow: perRow,
        baseBoards: baseBoards,
        wastePct: wastePct,
        boards: boards,
        linearFt: rows * runFt,
        lastRowIn: lastRowIn
      }
    };
  }

  // A small picture of the board rows (up to 18 rows are drawn).
  function diagram(d) {
    var maxRows = 18;
    var shown = Math.min(d.rows, maxRows);
    var top = 10;
    var height = 84;
    var rowH = height / shown;
    var s = '<figure class="diagram"><svg viewBox="0 0 270 126" role="img" aria-label="Deck with ' + d.rows + ' rows of boards">';
    s += '<rect class="dg-fill" x="24" y="' + top + '" width="200" height="' + height + '"/>';
    for (var i = 1; i < shown; i++) {
      var y = top + i * rowH;
      s += '<line class="dg-grid" x1="24" y1="' + y.toFixed(2) + '" x2="224" y2="' + y.toFixed(2) + '"/>';
    }
    if (d.perRow > 1) {
      var step = 200 / d.perRow;
      for (var j = 1; j < d.perRow && j < 6; j++) {
        var x = 24 + j * step;
        s += '<line class="dg-grid" x1="' + x.toFixed(2) + '" y1="' + top + '" x2="' + x.toFixed(2) + '" y2="' + (top + height) + '" stroke-dasharray="3 3"/>';
      }
    }
    s += '<rect class="dg-line" x="24" y="' + top + '" width="200" height="' + height + '"/>';
    var runLabel = U.units.len(d.runFt, d.sys, 1);
    s += '<text class="dg-text" x="124" y="' + (top + height + 18) + '" text-anchor="middle">Boards run ' + runLabel + '</text>';
    s += '<text class="dg-text" x="232" y="' + (top + height / 2 + 4) + '">' + d.rows + (d.rows > maxRows ? ' rows' : ' rows') + '</text>';
    s += '</svg></figure>';
    return s;
  }

  function render(d) {
    var notes = [];
    if (d.lastRowIn < d.boardWidth - 0.01) {
      if (d.lastRowIn < 1) {
        notes.push('The last row would be only about ' + U.units.small(d.lastRowIn, d.sys) + ' wide. A slightly wider gap or a small layout change may let you skip that row.');
      } else {
        notes.push('The last row would need to be cut to about ' + U.units.small(d.lastRowIn, d.sys) + ' wide.');
      }
    }
    notes.push('This counts surface boards only. It does not include joists, posts, footings, fasteners, railings or stairs.');
    var lengthText = d.sys === 'metric' ? U.fmt(d.boardLength, 1) + ' m' : d.boardLength + ' ft';
    return U.resultHTML({
      label: 'Decking boards to buy',
      value: U.fmt(d.boards, 0),
      unit: 'boards',
      sub: 'Each board is ' + lengthText + ' long. Includes ' + U.fmt(d.wastePct, 2) + '% waste.',
      rows: [
        ['Deck area', U.units.area(d.areaSqFt, d.sys)],
        ['Board rows across the deck', U.fmt(d.rows, 0)],
        ['Boards per row', U.fmt(d.perRow, 0)],
        ['Boards before waste', U.fmt(d.baseBoards, 0)],
        ['Total row length before waste', U.units.len(d.linearFt, d.sys, 1)]
      ],
      extraHTML: diagram(d),
      notes: notes
    });
  }

  var api = { calculate: calculate, render: render, BOARD_LENGTHS: BOARD_LENGTHS };
  root.DeckMaterial = api;
  if (typeof document !== 'undefined') {
    U.bindCalculator({ formId: 'calc-form', calculate: calculate, render: render });
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
