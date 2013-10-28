importScripts('trix.js',
  'gif.js/NeuQuant.js',
  'gif.js/LZWEncoder.js',
  'gif.js/GIFEncoder.js');

var encoder;

var cmd = {
  init: function(data) {
    encoder = new self.GIFEncoder(data.width, data.height);
    encoder.setQuality(data.quality || 30);
    encoder.setDelay(data.delay || 0);
    encoder.setRepeat(data.repeat || 0);
    encoder.writeHeader();
    encoder.firstFrame = true;
  },

  addFrame: function(data) {
    encoder.addFrame(data);
    encoder.firstFrame = false;
  },

  end: function() {
    self.postMessage(encoder.out.getData());
  }
};

self.addEventListener('message', function(event) {
  var data = event.data;
  var c = cmd[event.data.cmd];
  if (!c) c = cmd.addFrame;
  c(data);
}, false);
