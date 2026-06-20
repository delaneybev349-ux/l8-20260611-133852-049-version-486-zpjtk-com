(function () {
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var input = document.querySelector('.search-page-form input[name="q"]');
  var summary = document.getElementById('searchSummary');
  var results = document.getElementById('searchResults');
  var movies = window.SITE_MOVIES || [];

  if (input) {
    input.value = query;
  }

  function card(movie) {
    return [
      '<article class="movie-card">',
      '  <a href="' + movie.url + '" class="movie-card__link">',
      '    <div class="movie-card__media">',
      '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="movie-card__type">' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <div class="movie-card__body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="movie-card__meta">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  if (!results || !summary) {
    return;
  }

  if (!query) {
    summary.textContent = '请输入关键词开始搜索';
    return;
  }

  var lower = query.toLowerCase();
  var matched = movies.filter(function (movie) {
    var text = [
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      movie.category,
      movie.oneLine,
      movie.keywords
    ].join(' ').toLowerCase();

    return text.indexOf(lower) !== -1;
  });

  summary.textContent = '“' + query + '” 找到 ' + matched.length + ' 个结果';
  results.innerHTML = matched.slice(0, 120).map(card).join('');
})();
