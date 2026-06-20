function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

function normalizeValue(value) {
    return (value || "").toString().trim().toLowerCase();
}

ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mainNav = document.querySelector("[data-main-nav]");

    if (menuButton && mainNav) {
        menuButton.addEventListener("click", function () {
            mainNav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("input[name='q']");
            if (input && input.value.trim()) {
                form.action = "./search.html";
            }
        });
    });

    var hero = document.querySelector("[data-hero-slider]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function setSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                setSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                setSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        setSlide(0);
        startTimer();
    }

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage) {
        var keyword = searchPage.querySelector("[data-filter-keyword]");
        var category = searchPage.querySelector("[data-filter-category]");
        var region = searchPage.querySelector("[data-filter-region]");
        var type = searchPage.querySelector("[data-filter-type]");
        var year = searchPage.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(searchPage.querySelectorAll("[data-movie-card]"));
        var emptyState = searchPage.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);

        if (keyword && params.get("q")) {
            keyword.value = params.get("q");
        }

        function applyFilters() {
            var q = normalizeValue(keyword && keyword.value);
            var selectedCategory = normalizeValue(category && category.value);
            var selectedRegion = normalizeValue(region && region.value);
            var selectedType = normalizeValue(type && type.value);
            var selectedYear = normalizeValue(year && year.value);
            var visible = 0;

            cards.forEach(function (card) {
                var content = normalizeValue([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" "));
                var matches = true;

                if (q && content.indexOf(q) === -1) {
                    matches = false;
                }
                if (selectedCategory && normalizeValue(card.getAttribute("data-category")) !== selectedCategory) {
                    matches = false;
                }
                if (selectedRegion && normalizeValue(card.getAttribute("data-region")) !== selectedRegion) {
                    matches = false;
                }
                if (selectedType && normalizeValue(card.getAttribute("data-type")) !== selectedType) {
                    matches = false;
                }
                if (selectedYear && normalizeValue(card.getAttribute("data-year")) !== selectedYear) {
                    matches = false;
                }

                card.classList.toggle("is-hidden", !matches);
                if (matches) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        [keyword, category, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    }
});

function initMoviePlayer(videoId, layerId, sourceUrl) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var loaded = false;
    var hlsInstance = null;

    if (!video || !layer || !sourceUrl) {
        return;
    }

    function loadSource() {
        if (loaded) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }

        loaded = true;
    }

    function playVideo() {
        loadSource();
        layer.classList.add("is-hidden");
        video.controls = true;
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    layer.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
        if (!loaded || video.paused) {
            playVideo();
        }
    });
    video.addEventListener("play", function () {
        layer.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
        if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
            hlsInstance.stopLoad();
        }
    });
}
