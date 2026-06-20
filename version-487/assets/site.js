(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", root);
        var dots = selectAll("[data-hero-dot]", root);
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
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

    function setupFilters() {
        var input = document.querySelector("[data-filter-input]");
        var yearSelect = document.querySelector("[data-filter-select='year']");
        var cards = selectAll("[data-card]");
        if (!cards.length || (!input && !yearSelect)) {
            return;
        }
        var noResult = document.createElement("div");
        noResult.className = "no-result";
        noResult.textContent = "没有找到匹配影片";
        var container = cards[0].parentNode;

        function textOf(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" ").toLowerCase();
        }

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var matchedKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
                var matchedYear = !year || card.getAttribute("data-year") === year;
                var show = matchedKeyword && matchedYear;
                card.classList.toggle("is-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });
            if (container) {
                if (!visible && !noResult.parentNode) {
                    container.appendChild(noResult);
                }
                if (visible && noResult.parentNode) {
                    noResult.parentNode.removeChild(noResult);
                }
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (yearSelect) {
            yearSelect.addEventListener("change", apply);
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();

function setupVideoPlayer(videoId, triggerId, streamUrl) {
    var video = document.getElementById(videoId);
    var trigger = document.getElementById(triggerId);
    if (!video || !streamUrl) {
        return;
    }

    var hlsPlayer = null;
    var hlsReady = false;

    function finishPlay() {
        if (trigger) {
            trigger.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (trigger) {
                    trigger.classList.remove("is-hidden");
                }
            });
        }
    }

    function play() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (!video.getAttribute("src")) {
                video.src = streamUrl;
            }
            finishPlay();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!hlsPlayer) {
                hlsPlayer = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsPlayer.loadSource(streamUrl);
                hlsPlayer.attachMedia(video);
                hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    hlsReady = true;
                    finishPlay();
                });
            } else if (hlsReady) {
                finishPlay();
            }
            return;
        }

        if (!video.getAttribute("src")) {
            video.src = streamUrl;
        }
        finishPlay();
    }

    if (trigger) {
        trigger.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
}
