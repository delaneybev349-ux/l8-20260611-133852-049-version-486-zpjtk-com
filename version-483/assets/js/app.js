(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero-slider]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var nextButton = hero.querySelector("[data-hero-next]");
        var prevButton = hero.querySelector("[data-hero-prev]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        if (prevButton) {
            prevButton.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        startTimer();
    }

    var searchInput = document.querySelector("[data-search-input]");
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var emptyState = document.querySelector("[data-empty-state]");

    function queryFromLocation() {
        try {
            var params = new URL(window.location.href).searchParams;
            return params.get("q") || "";
        } catch (error) {
            return "";
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        var query = normalize(searchInput ? searchInput.value : "");
        var activeFilters = {};

        filterSelects.forEach(function (select) {
            activeFilters[select.getAttribute("data-filter-select")] = select.value;
        });

        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search-text"));
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesFilters = true;

            Object.keys(activeFilters).forEach(function (key) {
                var value = activeFilters[key];

                if (value && card.getAttribute("data-" + key) !== value) {
                    matchesFilters = false;
                }
            });

            var shouldShow = matchesQuery && matchesFilters;
            card.hidden = !shouldShow;

            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    if (searchInput && cards.length) {
        searchInput.value = queryFromLocation();
        searchInput.addEventListener("input", applyFilters);
        applyFilters();
    }

    filterSelects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
    });
})();
