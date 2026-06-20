(function () {
    function attachStream(video, url) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(url);
            hls.attachMedia(video);
            return;
        }

        video.src = url;
    }

    window.initializePlayer = function (url, videoId, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var attached = false;

        if (!video || !overlay || !url) {
            return;
        }

        function playVideo() {
            if (!attached) {
                attachStream(video, url);
                attached = true;
            }

            overlay.classList.add("is-hidden");
            video.controls = true;

            var playTask = video.play();

            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {});
            }
        }

        overlay.addEventListener("click", playVideo);

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
    };
})();
