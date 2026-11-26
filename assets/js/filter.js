(function () {
  var q = document.getElementById('q'), written = document.getElementById('written'),
      body = document.getElementById('rows'), count = document.getElementById('count');
  var rows = Array.prototype.slice.call(body.querySelectorAll('tr'));
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.archive th button'));
  var DEFAULT_DIR = { name: 1, region: 1, score: -1, date: -1 };   // 1 = ascending
  var state = { key: 'date', dir: -1 };
  function cmp(a, b) {
    var k = state.key, d = state.dir, r;
    if (k === 'score') r = (+a.dataset.score) - (+b.dataset.score);
    else if (k === 'date') r = a.dataset.date.localeCompare(b.dataset.date);
    else {
      var x = a.dataset[k] || '', y = b.dataset[k] || '';
      if (!x !== !y) return x ? -1 : 1;            // blanks always last
      r = x.localeCompare(y);
    }
    return d * r || b.dataset.date.localeCompare(a.dataset.date);
  }
  function apply() {
    var term = q.value.trim().toLowerCase(), shown = 0;
    rows.sort(cmp).forEach(function (r) {
      var ok = (!written.checked || r.dataset.written === '1') && (!term || r.dataset.search.indexOf(term) > -1);
      r.hidden = !ok; if (ok) shown++; body.appendChild(r);
    });
    buttons.forEach(function (b) {
      var on = b.getAttribute('data-sort') === state.key;
      b.setAttribute('aria-sort', on ? (state.dir > 0 ? 'ascending' : 'descending') : 'none');
    });
    count.textContent = shown + (shown === 1 ? ' whisky' : ' whiskies');
  }
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-sort');
      state = state.key === k ? { key: k, dir: -state.dir } : { key: k, dir: DEFAULT_DIR[k] };
      apply();
    });
  });
  [q, written].forEach(function (el) { el.addEventListener('input', apply); el.addEventListener('change', apply); });
  apply();
})();
