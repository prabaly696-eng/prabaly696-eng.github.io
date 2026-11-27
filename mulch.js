/*
  mulch.js
  Works in US units (ft, in, cubic yards, bags of 2 and 3 cubic feet) or Metric (m, cm, cubic meters, liters).
    area          = length x width
    volume        = area x depth
    cubic yards   = cubic feet / 27          cubic meters = cubic feet / 35.3147
    bags          = round up (volume / bag size)
*/
(function (root) {
  'use strict';
  var U = root.Util || require('./main.js');

  function calculate(raw) {
    var res = U.areaVolume(raw);
    if (!res.ok) { return res; }
    var d = res.data;
    d.liters = d.cuFt / U.CUFT_PER_LITER;
    d.bags2 = U.ceil(d.cuFt / 2);
    d.bags3 = U.ceil(d.cuFt / 3);
    d.bags50 = U.ceil(d.liters / 50);
    d.bags75 = U.ceil(d.liters / 75);
    return res;
  }

  function render(d) {
    var metric = d.sys === 'metric';
    var rows = [
      ['Area', U.units.area(d.areaSqFt, d.sys)],
      ['Volume', metric ? U.fmt(d.liters, 0) + ' liters' : U.units.vol(d.cuFt, d.sys)]
    ];
    if (metric) {
      rows.push(['If you buy 50 liter bags', U.fmt(d.bags50, 0) + ' bags']);
      rows.push(['If you buy 75 liter bags', U.fmt(d.bags75, 0) + ' bags']);
    } else {
      rows.push(['If you buy 2 cu ft bags', U.fmt(d.bags2, 0) + ' bags']);
      rows.push(['If you buy 3 cu ft bags', U.fmt(d.bags3, 0) + ' bags']);
    }
    rows.push(['Estimated cost (bulk)', d.cost === null ? 'Enter a price to see this' : U.units.money(d.cost, d.sys)]);
    var perUnit = metric ? 'cubic meter' : 'cubic yard';
    return U.resultHTML({
      label: 'Mulch needed',
      value: metric ? U.fmt(d.cuM, 2) : U.fmt(d.cuYd, 2),
      unit: metric ? 'cubic meters' : 'cubic yards',
      sub: d.cost === null ? '' : 'About ' + U.units.money(d.cost, d.sys) + ' at ' + U.units.money(d.price, d.sys) + ' per ' + perUnit + '.',
      rows: rows,
      notes: [
        'Bag counts are rounded up. Check the size printed on the bag, because bag sizes differ by brand.',
        'Real quantities vary with how the mulch is spread and how much it settles.'
      ]
    });
  }

  var api = { calculate: calculate, render: render };
  root.Mulch = api;
  if (typeof document !== 'undefined') {
    U.bindCalculator({ formId: 'calc-form', calculate: calculate, render: render });
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
