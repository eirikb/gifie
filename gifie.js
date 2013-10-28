window.onload = function() {
  var video = document.createElement('video');
  var canvas = document.createElement('canvas');
  var img = document.querySelector('img');
  var record = document.querySelector('button');
  var label = document.querySelector('label');
  var ctx = canvas.getContext('2d');
  var worker = new Worker('worker.js');
  var width = 320;
  var height = 240;
  var maxFrames = 20;
  var delay = 200;
  var frames;

  video.autoplay = true;
  video.width = canvas.width = width;
  video.height = canvas.height = height;

  worker.addEventListener('message', function(event) {
    img.src = 'data:image/gif;base64,' + btoa(event.data);
    img.classList.remove('hide');
    label.className = 'hide';
  }, false);

  function snapshot() {
    frames--;
    if (frames > 0) {
      ctx.drawImage(video, 0, 0, width, height);
      worker.postMessage(ctx.getImageData(0, 0, width, height).data);
    } else if (frames === 0) {
      record.classList.remove('disabled');
      record.classList.remove('alert-danger');
      label.className = '';
      worker.postMessage({
        cmd: 'end'
      });
    }
  }
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia;

  navigator.getUserMedia({
    video: true
  }, function(stream) {
    video.src = window.URL.createObjectURL(stream);
    record.classList.remove('hide');
  }, function(err) {
    console.log(err);
  });

  record.addEventListener('click', function() {
    worker.postMessage({
      cmd: 'init',
      width: width,
      height: height,
      delay: delay
    });

    img.classList.add('hide');
    record.classList.add('disabled');
    record.classList.add('alert-danger');
    frames = maxFrames;
  });

  setInterval(snapshot, delay);
};
