/* Silence of the Drams: whisky stats. Reads the whisky log embedded in the page and draws SVG charts. */
(function () {
  var raw = JSON.parse(document.getElementById('whisky-data').textContent);
  var BASE = document.body.getAttribute('data-baseurl') || '';
  var AMBER = '#a5621f', AMBER_SOFT = '#dcb68c', INK = '#1f1a16', MUTED = '#7a6f65', LINE = '#e6ded3', SURFACE = '#faf7f2';
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- clean-up rules (raw data stays untouched in the CSV) ---------- */
  var TYPO = { 'Laphraoig': 'Laphroaig', 'Highalnd Park': 'Highland Park' };
  function distillery(d) {
    d = (d || '').trim(); d = TYPO[d] || d;
    return /^Bruichladdich\b/.test(d) ? 'Bruichladdich' : d;
  }
  function brand(d) {
    d = (d || '').trim();
    var m = d.match(/^Bruichladdich (Octomore|Port Charlotte|Rhinns|Lochindaal)/);
    return m ? m[1] : (/^Bruichladdich/.test(d) ? 'Bruichladdich' : null);
  }
  function region(w) {
    var c = (w.country || '').trim(), r = (w.region || '').trim();
    if (c && c !== 'Scotland') return c === 'United States' ? 'USA' : c;
    if (!r) return 'Blend';
    if (/^island/i.test(r)) return 'Islands';
    if (/lowland/i.test(r)) return 'Lowland';
    return r;
  }
  function bottlerKind(b) {
    b = (b || '').trim();
    if (!b) return null;
    return b === 'Distillery' ? 'Official' : 'Independent';
  }
  function cask(c) {
    c = (c || '').toLowerCase();
    if (!c || /unknown/.test(c)) return null;
    var sherry = /sherry|oloroso|\bpx\b|pedro|fino|olorosum/.test(c),
        bourbon = /bourbon|american oak|weller|buffalo/.test(c),
        wine = /wine|\bport\b|madeira|moscatel|amarone|\bvin\b|cabernet|pauillac|shiraz|calvados|sauternes|\brum\b|marsala|guinness|beer/.test(c);
    var n = sherry + bourbon + wine;
    if (n > 1) return 'Mixed';
    if (sherry) return 'Sherry';
    if (bourbon) return 'Bourbon';
    if (wine) return 'Wine & other';
    return null;
  }
  function num(s) { var m = String(s || '').match(/\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; }

  var data = raw.filter(function (w) { return w.score !== null && w.score !== undefined && String(w.score).trim() !== '' && w.status !== 'open'; })
    .map(function (w) {
      var abv = num(w.abv), age = num(w.age);
      return {
        name: w.name, score: parseFloat(w.score), distillery: distillery(w.distillery), brand: brand(w.distillery),
        region: region(w), bottler: (w.bottler || '').trim(), kind: bottlerKind(w.bottler), cask: cask(w.cask),
        abv: abv && abv > 30 && abv < 80 ? abv : null, age: age && age < 80 ? age : null, year: w.year,
        url: w.review ? BASE + '/' + w.review + '/' : null
      };
    });

  /* ---------- helpers ---------- */
  function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
  function group(key, list) {
    var g = {};
    (list || data).forEach(function (w) { var k = w[key]; if (k == null || k === '') return; (g[k] = g[k] || []).push(w); });
    return Object.keys(g).map(function (k) {
      return { key: k, n: g[k].length, avg: mean(g[k].map(function (w) { return w.score; })), items: g[k] };
    });
  }
  function fmt(x) { return (Math.round(x * 100) / 100).toFixed(2); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, attrs) {
    var a = { x: x, y: y, fill: INK, 'font-size': 13, 'font-family': 'Inter, system-ui, sans-serif' };
    for (var k in (attrs || {})) a[k] = attrs[k];
    var t = el('text', a, parent); t.textContent = s; return t;
  }
  function hbarPath(x, y, w, h) { // rounded data-end on the right, square at the baseline
    var r = Math.min(4, w / 2, h / 2);
    return 'M' + x + ',' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) +
      'V' + (y + h - r) + 'Q' + (x + w) + ',' + (y + h) + ' ' + (x + w - r) + ',' + (y + h) + 'H' + x + 'Z';
  }
  function vbarPath(x, y, w, h) { // rounded top, square at the baseline
    var r = Math.min(4, w / 2, h / 2);
    return 'M' + x + ',' + (y + h) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y +
      'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h) + 'Z';
  }
  function list(items) {
    var names = items.slice().sort(function (a, b) { return b.score - a.score; }).slice(0, 6)
      .map(function (w) { return esc(w.name) + ' · ' + w.score; });
    return names.join('<br>') + (items.length > 6 ? '<br>…' : '');
  }

  /* ---------- tooltip ---------- */
  var tip = document.createElement('div'); tip.className = 'chart-tip'; tip.hidden = true; document.body.appendChild(tip);
  function hover(node, html) {
    node.addEventListener('mouseenter', function () { tip.innerHTML = html; tip.hidden = false; });
    node.addEventListener('mousemove', function (e) {
      var r = tip.getBoundingClientRect(), x = e.clientX + 14, y = e.clientY + 14;
      if (x + r.width > window.innerWidth - 8) x = e.clientX - r.width - 14;
      if (y + r.height > window.innerHeight - 8) y = e.clientY - r.height - 14;
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
    });
    node.addEventListener('mouseleave', function () { tip.hidden = true; });
  }

  /* ---------- horizontal bar list ---------- */
  // rows: [{label, value, valueLabel, note, highlight, tip}]
  function barList(id, rows, opts) {
    var mount = document.getElementById(id); if (!mount) return;
    var W = width(mount), small = W < 480, labelW = Math.min(opts.labelW || 150, Math.round(W * .34)), noteW = small ? 64 : 84, rowH = 30, barH = 14, top = 4;
    var plotW = W - labelW - noteW - 40, H = top + rows.length * rowH + 4;
    var max = opts.max || Math.max.apply(null, rows.map(function (r) { return r.value; }));
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': opts.title }, mount);
    rows.forEach(function (r, i) {
      var y = top + i * rowH, w = Math.max(3, plotW * r.value / max), cy = y + rowH / 2;
      var g = el('g', { class: 'hit' }, svg);
      el('rect', { x: 0, y: y, width: W, height: rowH, fill: 'transparent' }, g);
      txt(g, labelW - 12, cy + 4, r.label, { 'text-anchor': 'end' });
      el('path', { d: hbarPath(labelW, cy - barH / 2, w, barH), fill: r.highlight ? AMBER : AMBER_SOFT }, g);
      txt(g, labelW + w + 8, cy + 4, r.valueLabel, { 'font-weight': 600, 'font-size': 12.5 });
      if (r.note) txt(g, W, cy + 4, r.note, { 'text-anchor': 'end', fill: MUTED, 'font-size': 12 });
      hover(g, r.tip);
    });
  }

  function width(mount){ return Math.max(300, Math.floor(mount.clientWidth)); }
  function draw() {
  ['chart-scores','chart-regions','chart-dist-most','chart-dist-best','chart-bottling','chart-bottlers','chart-casks','chart-abv','chart-age','chart-years'].forEach(function(id){ var m=document.getElementById(id); if(m) m.innerHTML=''; });
  /* ---------- 1. headline tiles ---------- */
  var scores = data.map(function (w) { return w.score; }), avgAll = mean(scores);
  var regions = group('region').sort(function (a, b) { return b.n - a.n; });
  var single = regions.filter(function (r) { return r.n < 2 && r.key !== 'Campbeltown'; });
  if (single.length > 1) {
    var items = [].concat.apply([], single.map(function (r) { return r.items; }));
    regions = regions.filter(function (r) { return single.indexOf(r) < 0; });
    regions.push({ key: 'Rest of world', n: items.length, avg: mean(items.map(function (w) { return w.score; })), items: items,
      detail: single.map(function (r) { return r.key; }).join(', ') });
  }
  var tiles = [
    ['Whiskies scored', data.length],
    ['Average score', fmt(avgAll)],
    ['Distilleries', group('distillery').length],
    ['Written reviews', Object.keys(data.reduce(function (o, w) { if (w.url) o[w.url] = 1; return o; }, {})).length],
    ['Top region', regions[0].key + ' · ' + Math.round(100 * regions[0].n / data.length) + '%']
  ];
  document.getElementById('tiles').innerHTML = tiles.map(function (t) {
    return '<div class="tile"><div class="tile-label">' + t[0] + '</div><div class="tile-value">' + t[1] + '</div></div>';
  }).join('');

  /* ---------- 2. score distribution ---------- */
  (function () {
    var mount = document.getElementById('chart-scores'), bins = [];
    for (var s = 1; s <= 5; s += 0.5) bins.push({ s: s, items: data.filter(function (w) { return w.score === s; }) });
    var modeN = Math.max.apply(null, bins.map(function (b) { return b.items.length; }));
    var W = width(mount), H = 230, left = 30, bottom = 28, top = 24, plotH = H - top - bottom, slot = (W - left) / bins.length, bw = Math.min(24, slot - 6);
    var nice = Math.ceil(modeN / 10) * 10;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': 'Score distribution' }, mount);
    for (var t = 0; t <= nice; t += 10) {
      var gy = top + plotH - plotH * t / nice;
      el('line', { x1: left, x2: W, y1: gy, y2: gy, stroke: LINE, 'stroke-width': 1 }, svg);
      txt(svg, left - 8, gy + 4, t, { 'text-anchor': 'end', fill: MUTED, 'font-size': 11 });
    }
    bins.forEach(function (b, i) {
      var n = b.items.length, x = left + i * slot + (slot - bw) / 2, h = plotH * n / nice, y = top + plotH - h;
      var g = el('g', { class: 'hit' }, svg);
      el('rect', { x: left + i * slot, y: top, width: slot, height: plotH + bottom, fill: 'transparent' }, g);
      if (n) el('path', { d: vbarPath(x, y, bw, h), fill: n === modeN ? AMBER : AMBER_SOFT }, g);
      if (n) txt(g, x + bw / 2, y - 6, n, { 'text-anchor': 'middle', 'font-size': 12, fill: INK });
      txt(g, x + bw / 2, H - 8, b.s % 1 ? b.s.toFixed(1) : String(b.s), { 'text-anchor': 'middle', fill: MUTED, 'font-size': 12 });
      hover(g, '<strong>' + b.s + ' / 5</strong> · ' + n + ' whiskies (' + Math.round(100 * n / data.length) + '%)' + (n ? '<br><span class="tip-list">' + list(b.items) + '</span>' : ''));
    });
    var ax = left + ((avgAll - 1) / 0.5) * slot + slot / 2;
    el('line', { x1: ax, x2: ax, y1: top - 8, y2: top + plotH, stroke: INK, 'stroke-width': 1 }, svg);
    txt(svg, ax + 6, top - 10, 'average ' + fmt(avgAll), { 'font-size': 12, fill: INK, 'font-weight': 600 });
    el('line', { x1: left, x2: W, y1: top + plotH, y2: top + plotH, stroke: MUTED, 'stroke-width': 1 }, svg);
  })();

  /* ---------- 3. regions ---------- */
  barList('chart-regions', regions.map(function (r) {
    return { label: r.key, value: r.n, valueLabel: r.n, note: 'avg ' + fmt(r.avg), highlight: r.n >= 3 && r.avg > avgAll + 0.15,
      tip: '<strong>' + esc(r.key) + '</strong>' + (r.detail ? ' (' + esc(r.detail) + ')' : '') + '<br>' + r.n + ' whiskies · average ' + fmt(r.avg) + '<br><span class="tip-list">' + list(r.items) + '</span>' };
  }), { title: 'Whiskies by region' });

  /* ---------- 4. distilleries ---------- */
  var dist = group('distillery');
  var most = dist.slice().sort(function (a, b) { return b.n - a.n || b.avg - a.avg; }).slice(0, 10);
  barList('chart-dist-most', most.map(function (d, i) {
    var extra = '';
    if (d.key === 'Bruichladdich') {
      extra = '<br>' + group('brand', d.items).sort(function (a, b) { return b.n - a.n; })
        .map(function (b) { return esc(b.key) + ': ' + b.n + ' · avg ' + fmt(b.avg); }).join('<br>');
    }
    return { label: d.key, value: d.n, valueLabel: d.n, note: 'avg ' + fmt(d.avg), highlight: i === 0,
      tip: '<strong>' + esc(d.key) + '</strong><br>' + d.n + ' whiskies · average ' + fmt(d.avg) + extra };
  }), { title: 'Most-tasted distilleries' });

  var best = dist.filter(function (d) { return d.n >= 3; }).sort(function (a, b) { return b.avg - a.avg || b.n - a.n; }).slice(0, 10);
  barList('chart-dist-best', best.map(function (d, i) {
    return { label: d.key, value: d.avg, valueLabel: fmt(d.avg), note: d.n + ' tasted', highlight: i < 3,
      tip: '<strong>' + esc(d.key) + '</strong><br>average ' + fmt(d.avg) + ' across ' + d.n + '<br><span class="tip-list">' + list(d.items) + '</span>' };
  }), { title: 'Highest-rated distilleries', max: 5 });

  /* ---------- 5. bottlers ---------- */
  var kinds = group('kind').sort(function (a, b) { return b.avg - a.avg; });
  barList('chart-bottling', kinds.map(function (k, i) {
    return { label: k.key, value: k.avg, valueLabel: fmt(k.avg), note: k.n + ' tasted', highlight: i === 0,
      tip: '<strong>' + esc(k.key) + '</strong><br>average ' + fmt(k.avg) + ' across ' + k.n };
  }), { title: 'Official vs independent bottlings', max: 5, labelW: 170 });
  var indies = group('bottler', data.filter(function (w) { return w.kind === 'Independent'; }))
    .filter(function (b) { return b.n >= 3; }).sort(function (a, b) { return b.avg - a.avg; });
  barList('chart-bottlers', indies.map(function (b, i) {
    return { label: b.key, value: b.avg, valueLabel: fmt(b.avg), note: b.n + ' tasted', highlight: i === 0,
      tip: '<strong>' + esc(b.key) + '</strong><br>average ' + fmt(b.avg) + ' across ' + b.n + '<br><span class="tip-list">' + list(b.items) + '</span>' };
  }), { title: 'Independent bottlers (3+ tasted)', max: 5, labelW: 170 });

  /* ---------- 6. casks ---------- */
  var casks = group('cask').sort(function (a, b) { return b.avg - a.avg; });
  barList('chart-casks', casks.map(function (c, i) {
    return { label: c.key, value: c.avg, valueLabel: fmt(c.avg), note: c.n + ' tasted', highlight: i === 0,
      tip: '<strong>' + esc(c.key) + ' casks</strong><br>average ' + fmt(c.avg) + ' across ' + c.n + '<br><span class="tip-list">' + list(c.items) + '</span>' };
  }), { title: 'Average score by cask type', max: 5 });

  /* ---------- 7. scatter: ABV / age vs score ---------- */
  function scatter(id, key, label, unit, domain) {
    var mount = document.getElementById(id); if (!mount) return;
    var pts = data.filter(function (w) { return w[key] != null; });
    var W = width(mount), H = 280, left = 34, right = 12, top = 12, bottom = 40, pw = W - left - right, ph = H - top - bottom;
    var x0 = domain[0], x1 = domain[1];
    function X(v) { return left + pw * (v - x0) / (x1 - x0); }
    function Y(s) { return top + ph - ph * (s - 0.5) / 5; }
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': label + ' vs score' }, mount);
    for (var s = 1; s <= 5; s++) {
      el('line', { x1: left, x2: W - right, y1: Y(s), y2: Y(s), stroke: LINE, 'stroke-width': 1 }, svg);
      txt(svg, left - 8, Y(s) + 4, s, { 'text-anchor': 'end', fill: MUTED, 'font-size': 11 });
    }
    var step = domain[2];
    for (var v = Math.ceil(x0 / step) * step; v <= x1; v += step)
      txt(svg, X(v), H - 20, v + unit, { 'text-anchor': 'middle', fill: MUTED, 'font-size': 11 });
    txt(svg, left + pw / 2, H - 2, label, { 'text-anchor': 'middle', fill: MUTED, 'font-size': 12 });
    // binned average line (the story), drawn under the dots
    var bins = {}, bw = domain[3];
    pts.forEach(function (w) { var b = Math.floor(w[key] / bw) * bw; (bins[b] = bins[b] || []).push(w.score); });
    var line = Object.keys(bins).map(Number).sort(function (a, b) { return a - b; })
      .filter(function (b) { return bins[b].length >= 3; })
      .map(function (b) { return [X(b + bw / 2), Y(mean(bins[b]))]; });
    // dots with a small deterministic jitter so equal scores don't stack
    pts.forEach(function (w, i) {
      var j = ((i * 37) % 11 - 5) * 0.9;
      var c = el('circle', { cx: X(w[key]), cy: Y(w.score) + j, r: 4.5, fill: AMBER_SOFT, stroke: SURFACE, 'stroke-width': 2 }, svg);
      hover(c, '<strong>' + esc(w.name) + '</strong><br>' + w[key] + unit + ' · score ' + w.score);
    });
    if (line.length > 1) {
      el('polyline', { points: line.map(function (p) { return p.join(','); }).join(' '), fill: 'none', stroke: AMBER,
        'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
      line.forEach(function (p) { el('circle', { cx: p[0], cy: p[1], r: 4, fill: AMBER, stroke: SURFACE, 'stroke-width': 2, 'pointer-events': 'none' }, svg); });
    }
  }
  scatter('chart-abv', 'abv', 'ABV', '%', [40, 66, 5, 5]);
  scatter('chart-age', 'age', 'Age (years)', '', [0, 50, 10, 5]);

  /* ---------- 8. by year ---------- */
  var years = group('year').sort(function (a, b) { return a.key.localeCompare(b.key); });
  barList('chart-years', years.map(function (y) {
    return { label: y.key, value: y.n, valueLabel: y.n, note: 'avg ' + fmt(y.avg), highlight: false,
      tip: '<strong>' + y.key + '</strong><br>' + y.n + ' whiskies · average ' + fmt(y.avg) };
  }), { title: 'Whiskies scored per year', labelW: 80 });

  /* ---------- 9. hall of fame ---------- */
  var fame = data.filter(function (w) { return w.score >= 4.5; }).sort(function (a, b) { return b.score - a.score; });
  document.getElementById('fame').innerHTML = fame.map(function (w) {
    var name = w.url ? '<a href="' + w.url + '">' + esc(w.name) + '</a>' : esc(w.name);
    return '<li><span class="fame-name">' + name + '</span><span class="meta">' + esc(w.distillery || 'Blend') + ' · ' + esc(w.region) +
      '</span><span class="score-sm">' + w.score + '</span></li>';
  }).join('');
  }
  draw();
  var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt=setTimeout(draw,150); });
})();
