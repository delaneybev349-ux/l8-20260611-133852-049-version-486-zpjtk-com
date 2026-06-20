(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function toggleMobileNav() {
    var button = $('[data-mobile-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearch() {
    var panel = $('[data-search-panel]');
    var results = $('[data-search-results]');
    var meta = $('[data-search-meta]');
    var forms = $all('[data-search-form]');
    if (!panel || !results || !forms.length) {
      return;
    }

    function escapeHtml(text) {
      return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function render(items, query) {
      var data = items.slice(0, 36);
      if (!data.length) {
        meta.textContent = '未找到匹配内容';
        results.innerHTML = '';
        return;
      }
      meta.textContent = '“' + query + '”相关影片';
      results.innerHTML = data.map(function (item) {
        return '<a class="search-item" href="./' + escapeHtml(item.url) + '">' +
          '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
          '<div><h3>' + escapeHtml(item.title) + '</h3>' +
          '<p>' + escapeHtml([item.region, item.type, item.year, item.category].filter(Boolean).join(' · ')) + '</p>' +
          '<p>' + escapeHtml(item.oneLine || '') + '</p></div></a>';
      }).join('');
    }

    function openPanel(query) {
      var q = String(query || '').trim().toLowerCase();
      if (!q) {
        return;
      }
      var source = window.MovieSearchData || [];
      var items = source.filter(function (item) {
        var hay = [item.title, item.region, item.type, item.year, item.genre, item.category, item.tags, item.oneLine].join(' ').toLowerCase();
        return hay.indexOf(q) !== -1;
      });
      render(items, query);
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
    }

    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        openPanel(input ? input.value : '');
      });
    });

    $all('[data-close-search]').forEach(function (button) {
      button.addEventListener('click', function () {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function initFilters() {
    var bar = $('[data-filter-bar]');
    var cards = $all('[data-card]');
    var empty = $('[data-empty-state]');
    if (!bar || !cards.length) {
      return;
    }
    var inputs = $all('[data-filter]', bar);

    function apply() {
      var values = {};
      inputs.forEach(function (input) {
        values[input.getAttribute('data-filter')] = String(input.value || '').trim().toLowerCase();
      });
      var visible = 0;
      cards.forEach(function (card) {
        var title = String(card.getAttribute('data-title') || '').toLowerCase();
        var year = String(card.getAttribute('data-year') || '').toLowerCase();
        var region = String(card.getAttribute('data-region') || '').toLowerCase();
        var type = String(card.getAttribute('data-type') || '').toLowerCase();
        var genre = String(card.getAttribute('data-genre') || '').toLowerCase();
        var keyword = values.keyword || '';
        var ok = true;
        if (values.year && year !== values.year) {
          ok = false;
        }
        if (values.region && region !== values.region) {
          ok = false;
        }
        if (values.type && type !== values.type) {
          ok = false;
        }
        if (keyword && [title, year, region, type, genre].join(' ').indexOf(keyword) === -1) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', apply);
      input.addEventListener('change', apply);
    });
  }

  function initPlayer() {
    var shell = $('[data-player]');
    if (!shell) {
      return;
    }
    var video = $('video', shell);
    var button = $('[data-play-button]', shell);
    var source = shell.getAttribute('data-source');
    var attached = false;
    var hlsInstance = null;

    function attachSource() {
      if (attached || !video || !source) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
      shell.classList.add('is-ready');
    }

    function playVideo() {
      attachSource();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMobileNav();
    initHero();
    initSearch();
    initFilters();
    initPlayer();
  });
}());
