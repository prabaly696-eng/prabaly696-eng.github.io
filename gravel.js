/*
  gravel.js
  Works in US units (ft, in, cubic yards, tons) or Metric (m, cm, cubic meters, tonnes).
    area          = length x width
    volume        = area x depth
    cubic yards   = cubic feet / 27          cubic meters = cubic feet / 35.3147
    cost          = volume x price per cubic yard (US) or per cubic meter (Metric)
    weight        = volume x weight per unit of volume
  Weight per unit of volume depends on the stone and its moisture. The ranges below are rough,
  commonly quoted figures. If you know your supplier's number, enter it and it replaces the range.
*/
(function (root) {
  'use strict';
  var U = root.Util || require('./main.js');

  // Typical tons per cubic yard (US short tons). These are rough ranges, not guarantees.
  var MATERIALS = {
    stone: { label: 'Crushed stone or gravel', low: 1.3, high: 1.5 },
    pea: { label: 'Pea gravel', low: 1.35, high: 1.5 },
    sand: { label: 'Sand', low: 1.25, high: 1.6 },
    base: { label: 'Road base (dense graded)', low: 1.4, high: 1.6 }
  };
  var TONNES_PER_TON = 0.90718474;
  var CUM_PER_CUYD = 0.764554858;
  var TONNES_PER_CUM_FACTOR = TONNES_PER_TON / CUM_PER_CUYD; // tons/yd3 -> tonnes/m3

  function calculate(raw) {
    var sys = U.sys(raw);
    var res = U.areaVolume(raw);
    var errors = [];
    var densityLabel = sys === 'metric' ? 'Weight per cubic meter' : 'Weight per cubic yard';
    var density = U.readNumber(raw, 'density', densityLabel, errors, { optional: true, minExclusive: 0, max: 5 });
    var material = MATERIALS[raw.material] ? raw.material : 'stone';
    if (!res.ok) {
      return { ok: false, errors: res.errors.concat(errors) };
    }
    if (errors.length) { return { ok: false, errors: errors }; }
    var d = res.data;
    d.material = material;
    d.materialLabel = MATERIALS[material].label;
    if (density !== null) {
      d.weightLow = d.weightHigh = sys === 'metric' ? d.cuM * density : d.cuYd * density;
      d.weightExact = true;
    } else {
      var lowPerUnit = sys === 'metric' ? MATERIALS[material].low * TONNES_PER_CUM_FACTOR : MATERIALS[material].low;
      var highPerUnit = sys === 'metric' ? MATERIALS[material].high * TONNES_PER_CUM_FACTOR : MATERIALS[material].high;
      var vol = sys === 'metric' ? d.cuM : d.cuYd;
      d.weightLow = vol * lowPerUnit;
      d.weightHigh = vol * highPerUnit;
      d.weightExact = false;
    }
    return { ok: true, data: d };
  }

  function render(d) {
    var unitName = d.sys === 'metric' ? 'tonnes' : 'tons';
    var weightText = d.weightExact
      ? U.fmt(d.weightLow, 2) + ' ' + unitName
      : U.fmt(d.weightLow, 1) + ' to ' + U.fmt(d.weightHigh, 1) + ' ' + unitName;
    var rows = [
      ['Area', U.units.area(d.areaSqFt, d.sys)],
      ['Volume', U.units.vol(d.cuFt, d.sys)],
      [d.weightExact ? 'Weight (from your number)' : 'Rough weight (' + d.materialLabel.toLowerCase() + ')', weightText]
    ];
    rows.push(['Estimated cost', d.cost === null ? 'Enter a price to see this' : U.units.money(d.cost, d.sys)]);
    var headValue = d.sys === 'metric' ? U.fmt(d.cuM, 2) : U.fmt(d.cuYd, 2);
    var perUnit = d.sys === 'metric' ? 'cubic meter' : 'cubic yard';
    return U.resultHTML({
      label: 'Gravel needed',
      value: headValue,
      unit: d.sys === 'metric' ? 'cubic meters' : 'cubic yards',
      sub: d.cost === null ? '' : 'About ' + U.units.money(d.cost, d.sys) + ' at ' + U.units.money(d.price, d.sys) + ' per ' + perUnit + '.',
      rows: rows,
      notes: [
        'Real quantities vary with how the gravel is spread, how much it settles and how it is measured when delivered. Many people add a little extra.',
        d.weightExact
          ? 'Weight uses the number you entered.'
          : 'The weight is a rough range. Ask your supplier for the weight per ' + perUnit + ' of the material you choose, and enter it for a better estimate.',
        d.sys === 'metric' ? 'Tonnes are metric tonnes (1,000 kg).' : 'Tons are US short tons (2,000 pounds).'
      ]
    });
  }

  var api = { calculate: calculate, render: render, MATERIALS: MATERIALS };
  root.Gravel = api;
  if (typeof document !== 'undefined') {
    U.bindCalculator({ formId: 'calc-form', calculate: calculate, render: render });
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
