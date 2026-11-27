/*
  concrete.js
  Concrete for a flat rectangular slab or footing. Works in US units (ft, in, cubic yards, cubic feet per bag)
  or Metric (m, cm, cubic meters, liters per bag).
    volume        = length x width x thickness x number of slabs
    with extra    = volume x (1 + extra / 100)
    bags          = round up (volume with extra / yield of one bag)     (only if you enter the bag yield)
  The yield of a bag depends on the product. Read it on the bag.
  Gravel base, rebar, forms and finishing are NOT included.
*/
(function (root) {
  'use strict';
  var U = root.Util || require('./main.js');

  function calculate(raw) {
    var errors = [];
    var sys = U.sys(raw);
    var length = U.readLen(raw, 'length', 'Length', errors, { base: 'ft', us: 'ft', metric: 'm', max: 1000 });
    var width = U.readLen(raw, 'width', 'Width', errors, { base: 'ft', us: 'ft', metric: 'm', max: 1000 });
    var thicknessIn = U.readLen(raw, 'thickness', 'Thickness', errors, { base: 'in', us: 'in', metric: 'cm', max: 48 });
    var qty = U.readNumber(raw, 'qty', 'Number of slabs', errors, { min: 1, max: 1000, whole: true });
    var waste = U.readNumber(raw, 'waste', 'Extra allowance', errors, { optional: true, min: 0, max: 100 });
    var yieldLabel = sys === 'metric' ? 'Bag yield (liters)' : 'Bag yield (cubic feet)';
    var bagYield = U.readNumber(raw, 'bagYield', yieldLabel, errors, { optional: true, minExclusive: 0, max: sys === 'metric' ? 200 : 8 });
    if (errors.length) { return { ok: false, errors: errors }; }

    var wastePct = waste === null ? 0 : waste;
    var areaSqFt = length * width * qty;
    var cuFt = areaSqFt * (thicknessIn / 12);
    var cuFtWithExtra = cuFt * (1 + wastePct / 100);
    var yieldCuFt = bagYield === null ? null : (sys === 'metric' ? bagYield * U.CUFT_PER_LITER : bagYield);
    return {
      ok: true,
      data: {
        sys: sys,
        qty: qty,
        areaSqFt: areaSqFt,
        thicknessIn: thicknessIn,
        wastePct: wastePct,
        cuFt: cuFt,
        cuFtWithExtra: cuFtWithExtra,
        cuYdWithExtra: cuFtWithExtra / 27,
        cuMWithExtra: cuFtWithExtra / U.CUFT_PER_CUM,
        cuYd: cuFt / 27,
        cuM: cuFt / U.CUFT_PER_CUM,
        bagYield: bagYield,
        bags: yieldCuFt === null ? null : U.ceil(cuFtWithExtra / yieldCuFt)
      }
    };
  }

  function render(d) {
    var metric = d.sys === 'metric';
    var rows = [
      [d.qty > 1 ? 'Total area (' + d.qty + ' slabs)' : 'Area', U.units.area(d.areaSqFt, d.sys)],
      ['Thickness', U.units.small(d.thicknessIn, d.sys, 2).replace(' mm', ' mm')],
      ['Volume before extra', metric ? U.fmt(d.cuM, 3) + ' m³' : U.fmt(d.cuYd, 3) + ' cubic yd (' + U.fmt(d.cuFt, 1) + ' cubic ft)'],
      ['Volume with ' + U.fmt(d.wastePct, 2) + '% extra', metric ? U.fmt(d.cuMWithExtra, 3) + ' m³' : U.fmt(d.cuYdWithExtra, 3) + ' cubic yd (' + U.fmt(d.cuFtWithExtra, 1) + ' cubic ft)']
    ];
    rows.push([
      'Bags needed',
      d.bags === null ? 'Enter the bag yield to see this' : U.fmt(d.bags, 0) + ' bags (' + U.fmt(d.bagYield, 2) + (metric ? ' liters' : ' cubic ft') + ' each)'
    ]);
    return U.resultHTML({
      label: 'Concrete to order',
      value: metric ? U.fmt(d.cuMWithExtra, 2) : U.fmt(d.cuYdWithExtra, 2),
      unit: metric ? 'cubic meters' : 'cubic yards',
      sub: 'Includes ' + U.fmt(d.wastePct, 2) + '% extra for spills, uneven ground and over-excavation.',
      rows: rows,
      notes: [
        'This is the volume of concrete only. It does not include the gravel base, rebar or mesh, forms, or finishing.',
        'Bag yield varies by product and by how much water is added. Use the number printed on the bag.',
        'For large pours, ready-mix delivery is usually ordered by volume. Ask the supplier about minimum loads and delivery fees.'
      ]
    });
  }

  var api = { calculate: calculate, render: render };
  root.Concrete = api;
  if (typeof document !== 'undefined') {
    U.bindCalculator({ formId: 'calc-form', calculate: calculate, render: render });
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
