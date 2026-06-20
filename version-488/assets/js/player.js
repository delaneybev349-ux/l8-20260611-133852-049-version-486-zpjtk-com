import { H as Hls } from './hls-vendor.js';

var configNode = document.getElementById('player-config');
var video = document.getElementById('videoElement');
var button = document.getElementById('playButton');
var player = document.getElementById('moviePlayer');
var message = document.getElementById('playerMessage');
var hls = null;
var initialized = false;
var source = '';

if (configNode) {
  try {
    source = JSON.parse(configNode.textContent).src || '';
  } catch (error) {
    source = '';
  }
}

function showMessage() {
  if (message) {
    message.hidden = false;
  }
}

function markPlaying() {
  if (player) {
    player.classList.add('is-playing');
  }
}

function startVideo() {
  if (!video || !source) {
    showMessage();
    return;
  }

  if (!initialized) {
    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().then(markPlaying).catch(showMessage);
      }, { once: true });
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().then(markPlaying).catch(showMessage);
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage();
        }
      });
    } else {
      showMessage();
    }
  } else if (video.paused) {
    video.play().then(markPlaying).catch(showMessage);
  }
}

if (button) {
  button.addEventListener('click', startVideo);
}

if (video) {
  video.addEventListener('click', function () {
    if (video.paused) {
      startVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', markPlaying);
  video.addEventListener('pause', function () {
    if (player) {
      player.classList.remove('is-playing');
    }
  });
}

window.addEventListener('beforeunload', function () {
  if (hls) {
    hls.destroy();
  }
});
