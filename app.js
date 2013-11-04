$(function() {
  var $gif = $('#gif');
  var $gifLink = $('#gifLink');
  var $error = $('#error');
  var $record = $('#record');
  var $info = $record.find('.info');
  var $qualityBad = $('#quality-bad');
  var $lengthShort = $('#length-short');
  var $group = $('.group');
  var $countdown = $('#countdown');
  var $loader = $('#loader');
  var loader;

  $group.hide();
  $error.hide();
  $record.hide();

  $loader.knob().hide();
  $countdown.knob().hide();

  function startLoader() {
    var i = 0;
    loader = setInterval(function() {
      $loader.val(++i % 100).trigger('change');
    }, 10);
    $loader.knob().show();
  }

  function stopLoader() {
    clearInterval(loader);
    $loader.knob().hide();
  }

  on('prepare', function(err) {
    if ( !! err) {
      $error.show();
    } else {
      $record.show();
      $group.show();
    }
  });

  on('building', function() {
    $info.text('Building...');
    startLoader();
  });

  on('gif', function(dataUrl) {
    stopLoader();
    $record.removeClass('disabled recording');
    $info.text('Record');

    $gif.attr('src', dataUrl).show();
    $gifLink.attr('href', dataUrl);
  });

  function loading() {
    $gif.hide();
    $record.addClass('disabled');
    $info.text('Wait...');
    $countdown.knob().show();
  }

  function record() {
    $record.addClass('recording');
    $info.text('Recording...');

    var qualityBad = $qualityBad.prop('checked');
    var lengthShort = $lengthShort.prop('checked');

    gifie.init({
      quality: qualityBad ? 10 : 30,
      length: lengthShort ? 15 : 5
    });
  }

  $record.click(function() {
    loading();
    $countdown.val($countdown.data('max')).trigger('change');
    var interval = setInterval(function() {
      $countdown.val($countdown.val() - 1).trigger('change');
      if ($countdown.val() > 0) return;

      clearInterval(interval);
      $countdown.knob().hide();
      record();
    }, 10);
  });

  gifie.prepare();
});

var listeners = {};
on = function(name, cb) {
  listeners[name] = cb;
};
trigger = function(name) {
  var cb = listeners[name];
  if (cb) cb.apply(null, [].slice.call(arguments, 1));
};
