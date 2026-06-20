(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === heroIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var next = Number(dot.getAttribute('data-hero-dot')) || 0;
      showHero(next);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var searchInput = document.getElementById('movie-search');
  var yearFilter = document.getElementById('year-filter');
  var regionFilter = document.getElementById('region-filter');
  var typeFilter = document.getElementById('type-filter');
  var filterItems = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .compact-card'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var keyword = normalize(searchInput && searchInput.value);
    var year = normalize(yearFilter && yearFilter.value);
    var region = normalize(regionFilter && regionFilter.value);
    var type = normalize(typeFilter && typeFilter.value);

    filterItems.forEach(function (item) {
      var text = normalize([
        item.getAttribute('data-title'),
        item.getAttribute('data-year'),
        item.getAttribute('data-region'),
        item.getAttribute('data-type'),
        item.getAttribute('data-genre')
      ].join(' '));
      var itemYear = normalize(item.getAttribute('data-year'));
      var itemRegion = normalize(item.getAttribute('data-region'));
      var itemType = normalize(item.getAttribute('data-type'));
      var visible = true;

      if (keyword && text.indexOf(keyword) === -1) {
        visible = false;
      }

      if (year && itemYear !== year) {
        visible = false;
      }

      if (region && itemRegion !== region) {
        visible = false;
      }

      if (type && itemType !== type) {
        visible = false;
      }

      item.classList.toggle('hidden-by-filter', !visible);
    });
  }

  [searchInput, yearFilter, regionFilter, typeFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  function setupPlayer(player) {
    var shell = player.closest('.player-shell');
    var button = shell ? shell.querySelector('.player-button') : null;
    var src = player.getAttribute('data-m3u8');
    var hlsInstance = null;
    var ready = false;

    function prepare() {
      if (ready || !src) {
        return Promise.resolve();
      }

      ready = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(player);
        return Promise.resolve();
      }

      if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = src;
      }

      return Promise.resolve();
    }

    function start() {
      prepare().then(function () {
        var playResult = player.play();

        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {
            if (button) {
              button.textContent = '点击播放';
            }
          });
        }
      });
    }

    if (button) {
      button.addEventListener('click', function () {
        if (button) {
          button.textContent = '正在载入';
        }
        start();
      });
    }

    player.addEventListener('click', start);
    player.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('playing');
      }
    });
    player.addEventListener('pause', function () {
      if (shell) {
        shell.classList.remove('playing');
      }
    });
    player.addEventListener('ended', function () {
      if (shell) {
        shell.classList.remove('playing');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.cinema-player')).forEach(setupPlayer);
})();
