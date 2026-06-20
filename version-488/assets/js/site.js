(function () {
  var toggle = document.querySelector('[data-nav-toggle]');

  if (toggle) {
    toggle.addEventListener('click', function () {
      var isOpen = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var forms = document.querySelectorAll('[data-search-form]');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';

      if (!value) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  var filterInput = document.querySelector('[data-filter-input]');
  var grid = document.getElementById('movieGrid');

  if (filterInput && grid) {
    filterInput.addEventListener('input', function () {
      var keyword = filterInput.value.trim().toLowerCase();
      var items = grid.querySelectorAll('[data-filter-text]');

      items.forEach(function (item) {
        var text = item.getAttribute('data-filter-text').toLowerCase();
        item.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
      });
    });
  }
})();
