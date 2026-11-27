/*
  main.js
  Shared helpers for every calculator on this site.
  Plain JavaScript. No libraries. No network requests. Nothing you type is stored or sent anywhere.
  The only thing saved in your browser is your choice of US or Metric units.
  The same file also runs in Node.js, which is how the formulas are tested.
*/
(function (root) {
  'use strict';

  var U = {};
  U.system = 'us'; // 'us' (feet, inches) or 'metric' (meters, centimeters)

  /* ---------- Units ---------- */

  var TO_METERS = { ft: 0.3048, 'in': 0.0254, m: 1, cm: 0.01, mm: 0.001 };
  var SQFT_PER_SQM = 10.763910417;
  var CUFT_PER_CUM = 35.314666721;
  var CUFT_PER_LITER = 0.035314667;

  U.sys = function (raw) {
    return raw && raw.system === 'metric' ? 'metric' : 'us';
  };

  U.convert = function (value, from, to) {
    if (from === to) { return value; }
    if (from === 'ft' && to === 'in') { return value * 12; }
    if (from === 'in' && to === 'ft') { return value / 12; }
    return value * TO_METERS[from] / TO_METERS[to];
  };

  U.SQFT_PER_SQM = SQFT_PER_SQM;
  U.CUFT_PER_CUM = CUFT_PER_CUM;
  U.CUFT_PER_LITER = CUFT_PER_LITER;

  /* ---------- Reading and checking numbers ---------- */

  U.isBlank = function (value) {
    return value === null || value === undefined || String(value).trim() === '';
  };

  // Turns text such as "12", "12.5", "1,200" or "$45" into a number.
  // Returns NaN when the text is not a plain number.
  U.parse = function (value) {
    if (U.isBlank(value)) { return NaN; }
    var s = String(value).trim().replace(/^\$/, '');
    if (s.indexOf(',') !== -1) {
      if (!/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) { return NaN; }
      s = s.replace(/,/g, '');
    }
    if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) { return NaN; }
    return Number(s);
  };

  // Round up, but ignore tiny floating point noise (so 55.00000000000001 becomes 55, not 56).
  U.ceil = function (x) {
    return Math.ceil(x - 1e-9);
  };

  U.fmt = function (n, maxDigits, minDigits) {
    var max = maxDigits === undefined ? 2 : maxDigits;
    var min = minDigits === undefined ? 0 : minDigits;
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: min, maximumFractionDigits: max });
  };

  U.money = function (n) {
    return '$' + U.fmt(n, 2, 2);
  };

  U.esc = function (s) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(s).replace(/[&<>"']/g, function (c) { return map[c]; });
  };

  /*
    Reads one number from the raw form values.
    opts: optional (blank is allowed and returns null), min, minExclusive, max, whole
    On a problem it adds { field, message } to errors and returns NaN.
  */
  U.readNumber = function (raw, key, label, errors, opts) {
    opts = opts || {};
    var text = raw[key];
    if (U.isBlank(text)) {
      if (opts.optional) { return null; }
      errors.push({ field: key, message: 'Enter a value for ' + label + '.' });
      return NaN;
    }
    var v = U.parse(text);
    if (isNaN(v)) {
      errors.push({ field: key, message: label + ' must be a plain number, such as 12 or 12.5.' });
      return NaN;
    }
    if (opts.minExclusive !== undefined && v <= opts.minExclusive) {
      errors.push({ field: key, message: label + ' must be greater than ' + U.fmt(opts.minExclusive, 4) + '.' });
      return NaN;
    }
    if (opts.min !== undefined && v < opts.min) {
      errors.push({
        field: key,
        message: opts.min === 0 ? label + ' cannot be negative.' : label + ' must be at least ' + U.fmt(opts.min, 4) + '.'
      });
      return NaN;
    }
    if (opts.max !== undefined && v > opts.max) {
      errors.push({ field: key, message: label + ' is too large for this calculator. Check your number.' });
      return NaN;
    }
    if (opts.whole && v !== Math.floor(v)) {
      errors.push({ field: key, message: label + ' must be a whole number, such as 2.' });
      return NaN;
    }
    return v;
  };

  /*
    Reads a length and returns it in o.base ("ft" or "in").
    o.us and o.metric name the unit used when the page is in US or Metric mode.
    o.unitKey names a unit drop-down on the page (optional). If it holds a valid unit, that unit wins.
    o.max is a limit in the base unit. o.allowZero allows 0. o.optional allows a blank box (returns null).
  */
  U.readLen = function (raw, key, label, errors, o) {
    var numOpts = o.allowZero ? { min: 0 } : { minExclusive: 0 };
    if (o.optional) { numOpts.optional = true; }
    var v = U.readNumber(raw, key, label, errors, numOpts);
    if (v === null || isNaN(v)) { return v; }
    var unit = o.unitKey ? raw[o.unitKey] : null;
    if (!unit || !TO_METERS[unit]) { unit = o[U.sys(raw)]; }
    var out = U.convert(v, unit, o.base);
    if (o.max !== undefined && out > o.max) {
      errors.push({ field: key, message: label + ' is too large for this calculator. Check your number and unit.' });
      return NaN;
    }
    return out;
  };

  /* ---------- Showing numbers in the chosen unit system ---------- */

  var UN = {};
  // Lengths given in feet.
  UN.len = function (ft, sys, d) {
    var digits = d === undefined ? 2 : d;
    return sys === 'metric' ? U.fmt(ft * 0.3048, digits) + ' m' : U.fmt(ft, digits) + ' ft';
  };
  // Small lengths given in inches (shown as mm in metric).
  UN.small = function (inches, sys, d) {
    return sys === 'metric' ? U.fmt(inches * 25.4, 1) + ' mm' : U.fmt(inches, d === undefined ? 2 : d) + ' in';
  };
  // Areas given in square feet.
  UN.area = function (sqft, sys, d) {
    var digits = d === undefined ? 2 : d;
    return sys === 'metric' ? U.fmt(sqft / SQFT_PER_SQM, digits) + ' m²' : U.fmt(sqft, digits) + ' sq ft';
  };
  // Volumes given in cubic feet.
  UN.vol = function (cuft, sys, d) {
    var digits = d === undefined ? 2 : d;
    return sys === 'metric' ? U.fmt(cuft / CUFT_PER_CUM, digits) + ' m³' : U.fmt(cuft, digits) + ' cubic ft';
  };
  // Money: dollars in US mode, plain number in Metric mode (the visitor's own currency).
  UN.money = function (n, sys) {
    return sys === 'metric' ? U.fmt(n, 2, 2) : U.money(n);
  };
  U.units = UN;

  // Shared by the gravel, mulch and concrete style calculators: length x width x depth.
  U.areaVolume = function (raw) {
    var errors = [];
    var sys = U.sys(raw);
    var lengthFt = U.readLen(raw, 'length', 'Length', errors, { base: 'ft', us: 'ft', metric: 'm', unitKey: 'lengthUnit', max: 2000 });
    var widthFt = U.readLen(raw, 'width', 'Width', errors, { base: 'ft', us: 'ft', metric: 'm', unitKey: 'widthUnit', max: 2000 });
    var depthFt = U.readLen(raw, 'depth', 'Depth', errors, { base: 'ft', us: 'in', metric: 'cm', unitKey: 'depthUnit', max: 3 });
    var price = U.readNumber(raw, 'price', sys === 'metric' ? 'Price per cubic meter' : 'Price per cubic yard', errors, { optional: true, min: 0, max: 1000000 });
    if (errors.length) { return { ok: false, errors: errors }; }
    var areaSqFt = lengthFt * widthFt;
    var cuFt = areaSqFt * depthFt;
    var cuYd = cuFt / 27;
    var cuM = cuFt / CUFT_PER_CUM;
    var perUnitVolume = sys === 'metric' ? cuM : cuYd;
    return {
      ok: true,
      data: {
        sys: sys,
        lengthFt: lengthFt,
        widthFt: widthFt,
        depthFt: depthFt,
        areaSqFt: areaSqFt,
        cuFt: cuFt,
        cuYd: cuYd,
        cuM: cuM,
        price: price,
        cost: price === null ? null : perUnitVolume * price
      }
    };
  };

  /* ---------- Building the result box ---------- */

  // r: { label, value, unit, sub, rows: [[label, value], ...], extraHTML, notes: [text, ...] }
  U.resultHTML = function (r) {
    var h = '<div class="headline">';
    h += '<p class="headline-label">' + U.esc(r.label) + '</p>';
    h += '<p class="headline-value">' + U.esc(r.value);
    if (r.unit) { h += ' <span class="headline-unit">' + U.esc(r.unit) + '</span>'; }
    h += '</p>';
    if (r.sub) { h += '<p class="headline-sub">' + U.esc(r.sub) + '</p>'; }
    h += '</div>';
    if (r.rows && r.rows.length) {
      h += '<dl class="rows">';
      for (var i = 0; i < r.rows.length; i++) {
        h += '<div><dt>' + U.esc(r.rows[i][0]) + '</dt><dd>' + U.esc(r.rows[i][1]) + '</dd></div>';
      }
      h += '</dl>';
    }
    if (r.extraHTML) { h += r.extraHTML; }
    if (r.notes && r.notes.length) {
      h += '<ul class="result-notes">';
      for (var j = 0; j < r.notes.length; j++) {
        h += '<li>' + U.esc(r.notes[j]) + '</li>';
      }
      h += '</ul>';
    }
    return h;
  };

  /* ---------- Switching the page between US and Metric ---------- */

  function setOptions(select, options, selected) {
    select.innerHTML = '';
    for (var i = 0; i < options.length; i++) {
      var opt = document.createElement('option');
      opt.value = String(options[i][0]);
      opt.textContent = options[i][1];
      if (String(options[i][0]) === String(selected)) {
        opt.defaultSelected = true;
        opt.selected = true;
      }
      select.appendChild(opt);
    }
  }

  U.applySystem = function (sys) {
    U.system = sys === 'metric' ? 'metric' : 'us';
    var buttons = document.querySelectorAll('.units button[data-sys]');
    for (var b = 0; b < buttons.length; b++) {
      buttons[b].setAttribute('aria-pressed', buttons[b].getAttribute('data-sys') === U.system ? 'true' : 'false');
    }
    var fields = document.querySelectorAll('.field[data-spec]');
    for (var i = 0; i < fields.length; i++) {
      var el = fields[i];
      var spec;
      try { spec = JSON.parse(el.getAttribute('data-spec')); } catch (e) { continue; }
      var s = spec[U.system] || spec.us;
      var label = el.querySelector('label');
      if (label && s.label) { label.textContent = s.label; }
      var hint = el.querySelector('.hint');
      if (hint && s.hint !== undefined) { hint.textContent = s.hint; }
      var main = el.querySelector('[data-main]');
      if (main) {
        if (main.tagName === 'SELECT') {
          if (s.options) { setOptions(main, s.options, s.value); }
        } else if (s.value !== undefined) {
          main.defaultValue = s.value;
          main.value = s.value;
        }
      }
      var unit = el.querySelector('[data-unit]');
      if (unit && s.units) { setOptions(unit, s.units, s.unit); }
    }
    var swaps = document.querySelectorAll('[data-us][data-metric]');
    for (var k = 0; k < swaps.length; k++) {
      swaps[k].textContent = swaps[k].getAttribute(U.system === 'metric' ? 'data-metric' : 'data-us');
    }
    document.dispatchEvent(new Event('unitschange'));
  };

  U.initUnits = function () {
    var buttons = document.querySelectorAll('.units button[data-sys]');
    if (!buttons.length) { return; }
    var saved = null;
    try { saved = window.localStorage.getItem('mt-units'); } catch (e) { saved = null; }
    if (saved === 'metric') { U.applySystem('metric'); }
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (event) {
        var sys = event.currentTarget.getAttribute('data-sys');
        U.applySystem(sys);
        try { window.localStorage.setItem('mt-units', sys); } catch (e) { /* storage is optional */ }
      });
    }
  };

  /* ---------- Connecting a calculator to its page ---------- */

  U.bindCalculator = function (cfg) {
    var form = document.getElementById(cfg.formId);
    var resultBox = document.getElementById('result');
    var errorBox = document.getElementById('errors');
    if (!form || !resultBox || !errorBox) { return; }
    var emptyHTML = resultBox.innerHTML;

    function readForm() {
      var raw = {};
      for (var i = 0; i < form.elements.length; i++) {
        var el = form.elements[i];
        if (el.name) { raw[el.name] = el.value; }
      }
      raw.system = U.system;
      return raw;
    }

    function clearInvalid() {
      var marked = form.querySelectorAll('[aria-invalid="true"]');
      for (var i = 0; i < marked.length; i++) { marked[i].removeAttribute('aria-invalid'); }
    }

    function clearAll() {
      clearInvalid();
      errorBox.hidden = true;
      errorBox.innerHTML = '';
      resultBox.innerHTML = emptyHTML;
    }

    function showErrors(errors) {
      clearInvalid();
      var h = '<p class="errors-title">Please fix the following:</p><ul>';
      for (var i = 0; i < errors.length; i++) {
        h += '<li><a href="#' + U.esc(errors[i].field) + '">' + U.esc(errors[i].message) + '</a></li>';
        var field = document.getElementById(errors[i].field);
        if (field) { field.setAttribute('aria-invalid', 'true'); }
      }
      h += '</ul>';
      errorBox.innerHTML = h;
      errorBox.hidden = false;
      resultBox.innerHTML = emptyHTML;
      var first = document.getElementById(errors[0].field);
      if (first) { first.focus(); }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var res = cfg.calculate(readForm());
      if (!res.ok) {
        showErrors(res.errors);
        return;
      }
      clearInvalid();
      errorBox.hidden = true;
      errorBox.innerHTML = '';
      resultBox.innerHTML = cfg.render(res.data) +
        '<p class="copy-row"><button type="button" class="btn-link" id="copy-result">Copy result</button><span class="copy-status" id="copy-status"></span></p>';
      var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (resultBox.scrollIntoView) {
        resultBox.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'nearest' });
      }
    });

    // The browser puts the starting values back; we clear the old answer after it does.
    form.addEventListener('reset', function () {
      setTimeout(clearAll, 0);
    });
    // Changing between US and Metric also clears the old answer.
    document.addEventListener('unitschange', clearAll);

    // Tapping a number box selects its text, so a new number replaces the old one.
    form.addEventListener('focusin', function (event) {
      var el = event.target;
      if (el && el.tagName === 'INPUT' && el.type === 'text') {
        setTimeout(function () { el.select(); }, 0);
      }
    });

    // "Copy result" button, added under each result.
    function resultAsText() {
      var lines = [];
      var label = resultBox.querySelector('.headline-label');
      var value = resultBox.querySelector('.headline-value');
      if (label && value) { lines.push(label.textContent + ': ' + value.textContent.replace(/\s+/g, ' ').trim()); }
      var rows = resultBox.querySelectorAll('.rows div');
      for (var i = 0; i < rows.length; i++) {
        lines.push(rows[i].querySelector('dt').textContent + ': ' + rows[i].querySelector('dd').textContent);
      }
      lines.push('Estimate from Measure Twice Calculators. Confirm quantities with your supplier.');
      return lines.join('\n');
    }
    resultBox.addEventListener('click', function (event) {
      if (!event.target || event.target.id !== 'copy-result') { return; }
      var status = document.getElementById('copy-status');
      function selectInstead() {
        var range = document.createRange();
        range.selectNodeContents(resultBox.querySelector('.headline'));
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        if (status) { status.textContent = 'Could not copy automatically. The answer is selected, so you can copy it.'; }
      }
      try {
        navigator.clipboard.writeText(resultAsText()).then(function () {
          if (status) { status.textContent = 'Copied'; }
        }, selectInstead);
      } catch (e) {
        selectInstead();
      }
    });
  };

  if (typeof document !== 'undefined') {
    // On a phone the menu scrolls sideways. Bring the current page's button into view.
    var current = document.querySelector('.site-header nav [aria-current="page"]');
    var list = current && current.closest('ul');
    if (list && current.offsetLeft + current.offsetWidth > list.clientWidth) {
      list.scrollLeft = current.offsetLeft - 8;
    }
    U.initUnits();
  }

  root.Util = U;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = U;
  }
})(typeof window !== 'undefined' ? window : globalThis);
