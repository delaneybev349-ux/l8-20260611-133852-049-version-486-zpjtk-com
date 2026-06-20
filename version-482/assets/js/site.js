(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function restartTimer() {
            if (timer) {
                clearInterval(timer);
            }

            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")));
                restartTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restartTimer();
            });
        }

        restartTimer();
    }

    var controlPanel = document.querySelector("[data-catalog-controls]");
    var cardList = document.querySelector("[data-card-list]");

    if (controlPanel && cardList) {
        var keywordInput = controlPanel.querySelector("[data-filter-keyword]");
        var regionSelect = controlPanel.querySelector("[data-filter-region]");
        var typeSelect = controlPanel.querySelector("[data-filter-type]");
        var yearSelect = controlPanel.querySelector("[data-filter-year]");
        var sortSelect = controlPanel.querySelector("[data-sort-cards]");
        var cards = Array.prototype.slice.call(cardList.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);

        function setInitialValue(element, value) {
            if (element && value) {
                element.value = value;
            }
        }

        setInitialValue(keywordInput, params.get("q"));
        setInitialValue(regionSelect, params.get("region"));
        setInitialValue(typeSelect, params.get("type"));
        setInitialValue(yearSelect, params.get("year"));

        function textOf(card) {
            return card.textContent.toLowerCase() + " " + (card.getAttribute("data-title") || "").toLowerCase();
        }

        function applyFilters() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var region = regionSelect ? regionSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var sort = sortSelect ? sortSelect.value : "default";
            var visibleCards = cards.slice();

            visibleCards.forEach(function (card) {
                var matchesKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
                var matchesRegion = !region || card.getAttribute("data-region") === region;
                var matchesType = !type || card.getAttribute("data-type") === type;
                var matchesYear = !year || card.getAttribute("data-year") === year;
                card.hidden = !(matchesKeyword && matchesRegion && matchesType && matchesYear);
            });

            if (sort !== "default") {
                visibleCards.sort(function (a, b) {
                    if (sort === "year-desc") {
                        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                    }

                    if (sort === "score-desc") {
                        return Number(b.getAttribute("data-score")) - Number(a.getAttribute("data-score"));
                    }

                    if (sort === "title-asc") {
                        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                    }

                    return 0;
                });

                visibleCards.forEach(function (card) {
                    cardList.appendChild(card);
                });
            }
        }

        [keywordInput, regionSelect, typeSelect, yearSelect, sortSelect].forEach(function (element) {
            if (element) {
                element.addEventListener("input", applyFilters);
                element.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    }
}());
