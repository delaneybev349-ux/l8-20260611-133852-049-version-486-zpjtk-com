function attachMoviePlayer(videoId, streamUrl, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hlsInstance = null;
    var loaded = false;

    if (!video || !button || !streamUrl) {
        return;
    }

    function loadAndPlay() {
        if (!loaded) {
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else {
                video.src = streamUrl;
            }

            loaded = true;
        }

        button.classList.add("hidden");
        var playResult = video.play();

        if (playResult && typeof playResult.catch === "function") {
            playResult.catch(function () {
                button.classList.remove("hidden");
            });
        }
    }

    button.addEventListener("click", loadAndPlay);
    video.addEventListener("click", function () {
        if (video.paused) {
            loadAndPlay();
        }
    });
    video.addEventListener("play", function () {
        button.classList.add("hidden");
    });
    video.addEventListener("pause", function () {
        if (!video.ended) {
            button.classList.remove("hidden");
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
