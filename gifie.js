$(function() {
  var video = $('<video autoplay>')[0];
  var canvas = $('<canvas>')[0];
  var ctx = canvas.getContext('2d');
  var worker = new Worker('worker.js');
  var width = 320;
  var height = 240;
  var maxFrames = 15;
  var delay = 200;
  var frames;

  video.autoplay = true;
  video.width = canvas.width = width;
  video.height = canvas.height = height;

  worker.addEventListener('message', function(event) {
    var dataUrl = 'data:image/gif;base64,' + btoa(event.data);
    $('img').attr('src', dataUrl).removeClass('hide');
    $('#imglink').attr('href', dataUrl);
    $('label').addClass('hide');
  }, false);

  function snapshot() {
    frames--;
    if (frames > 0) {
      ctx.drawImage(video, 0, 0, width, height);
      worker.postMessage(ctx.getImageData(0, 0, width, height).data);
    } else if (frames === 0) {
      $('button').removeClass('disabled');
      $('.record').text('Record');
      $('label').removeClass('hide');
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
    $('button').removeClass('hide');
  }, function(err) {
    $('#error').removeClass('hide');
    console.log(err);
  });

  $('button').click(function() {
    worker.postMessage({
      cmd: 'init',
      width: width,
      height: height,
      delay: delay
    });

    $('img').addClass('hide');
    $(this).addClass('disabled');
    $('.record').text('Recording...');
    frames = maxFrames;
  });

  setInterval(snapshot, delay);
});
