gifie = (function() {
  var video = $('<video autoplay>')[0];
  var canvas = $('<canvas>')[0];
  var ctx = canvas.getContext('2d');
  var worker = new Worker('worker.js');
  var width = 320;
  var height = 240;
  var delay = 200;
  var maxFrames, frames;

  video.autoplay = true;
  video.width = canvas.width = width;
  video.height = canvas.height = height;

  worker.addEventListener('message', function(event) {
    var dataBase64 = btoa(event.data);
    trigger('gif', dataBase64);
  }, false);

  function prepare(cb) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia || navigator.msGetUserMedia;

    navigator.getUserMedia({
      video: true
    }, function(stream) {
      video.src = window.URL.createObjectURL(stream);
      trigger('prepare');
    }, function(err) {
      trigger('prepare', err);
    });
  }

  function init(options) {
    maxFrames = options.length;

    worker.postMessage({
      cmd: 'init',
      width: width,
      height: height,
      delay: delay,
      quality: options.quality
    });

    frames = maxFrames;
    var interval = setInterval(function() {
      ctx.drawImage(video, 0, 0, width, height);
      worker.postMessage(ctx.getImageData(0, 0, width, height).data);

      frames--;
      if (frames > 0) return;

      trigger('building');
      clearInterval(interval);
      worker.postMessage({
        cmd: 'end'
      });
    }, delay);
  }

  return {
    init: init,
    prepare: prepare
  };
})();
