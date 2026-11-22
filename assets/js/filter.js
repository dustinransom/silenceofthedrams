(function () {
  var q = document.getElementById('q'), type = document.getElementById('type'),
      sort = document.getElementById('sort'), body = document.getElementById('rows'),
      count = document.getElementById('count');
  var rows = Array.prototype.slice.call(body.querySelectorAll('tr'));
  function apply() {
    var term = q.value.trim().toLowerCase(), t = type.value, shown = 0;
    rows.sort(function (a, b) {
      return sort.value === 'score'
        ? (+b.dataset.score) - (+a.dataset.score)
        : b.dataset.date.localeCompare(a.dataset.date);
    }).forEach(function (r) {
      var ok = (!t || r.dataset.type === t) && (!term || r.dataset.search.indexOf(term) > -1);
      r.hidden = !ok; if (ok) shown++; body.appendChild(r);
    });
    count.textContent = shown + (shown === 1 ? ' review' : ' reviews');
  }
  [q, type, sort].forEach(function (el) { el.addEventListener('input', apply); });
  apply();
})();
