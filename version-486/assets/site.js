(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var container = document.querySelector("[data-card-container]");
    var sortSelect = document.querySelector("[data-sort-select]");
    if (!container) {
      return;
    }
    var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        card.classList.toggle("hidden", keyword && text.indexOf(keyword) === -1);
      });
    }

    function sortCards() {
      if (!sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      var sorted = cards.slice();
      if (mode === "year-desc") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      }
      if (mode === "year-asc") {
        sorted.sort(function (a, b) {
          return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
        });
      }
      if (mode === "title-asc") {
        sorted.sort(function (a, b) {
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
        });
      }
      if (mode !== "default") {
        sorted.forEach(function (card) {
          container.appendChild(card);
        });
      }
      filterCards();
    }

    if (input) {
      input.addEventListener("input", filterCards);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", sortCards);
    }
  }

  function initPlayer() {
    var video = document.querySelector("[data-player-video]");
    var starter = document.querySelector("[data-player-start]");
    var config = document.getElementById("player-config");
    if (!video || !starter || !config) {
      return;
    }
    var streamUrl;
    var hls;
    try {
      streamUrl = JSON.parse(config.textContent).src;
    } catch (error) {
      streamUrl = "";
    }
    if (!streamUrl) {
      return;
    }

    function attachStream() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (video.getAttribute("src") !== streamUrl) {
          video.setAttribute("src", streamUrl);
        }
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        }
        return;
      }
      if (video.getAttribute("src") !== streamUrl) {
        video.setAttribute("src", streamUrl);
      }
    }

    function startPlay() {
      attachStream();
      video.controls = true;
      starter.classList.add("is-hidden");
      var playAction = video.play();
      if (playAction && typeof playAction.catch === "function") {
        playAction.catch(function () {
          starter.classList.remove("is-hidden");
        });
      }
    }

    starter.addEventListener("click", startPlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlay();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
