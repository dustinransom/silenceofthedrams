(function () {
  var q = document.getElementById('q'),
      sort = document.getElementById('sort'), written = document.getElementById('written'),
      body = document.getElementById('rows'), count = document.getElementById('count');
  var rows = Array.prototype.slice.call(body.querySelectorAll('tr'));
  function apply() {
    var term = q.value.trim().toLowerCase(), shown = 0;
    rows.sort(function (a, b) {
      if (sort.value === 'score') return (+b.dataset.score) - (+a.dataset.score) || b.dataset.date.localeCompare(a.dataset.date);
      if (sort.value === 'name') return a.dataset.name.localeCompare(b.dataset.name);
      return b.dataset.date.localeCompare(a.dataset.date);
    }).forEach(function (r) {
      var ok = (!written.checked || r.dataset.written === '1') &&
               (!term || r.dataset.search.indexOf(term) > -1);
      r.hidden = !ok; if (ok) shown++; body.appendChild(r);
    });
    count.textContent = shown + (shown === 1 ? ' entry' : ' entries');
  }
  [q, sort, written].forEach(function (el) { el.addEventListener('input', apply); el.addEventListener('change', apply); });
  apply();
})();
