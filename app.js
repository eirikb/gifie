$(function() {
  var spinner = new Spinner({
    lines: 17,
    length: 40,
    width: 10,
    radius: 45,
    top: 'auto',
    left: 'auto'
  });

  var $gif = $('#gif');
  var $gifLink = $('#gifLink');
  var $error = $('#error');
  var $record = $('#record');
  var $knob = $('#knob');
  var $spin = $('#spin');
  var $info = $record.find('.info');
  var $qualityBad = $('#quality-bad');
  var $lengthShort = $('#length-short');
  var $group = $('.group');

  $knob.knob();

  $group.hide();
  $error.hide();
  $record.hide();
  $spin.hide();
  $('#knob, canvas').hide();

  on('prepare', function(err) {
    if (!!err) {
      $error.show();
    } else {
      $record.show();
      $group.show();
    }
  });

  on('building', function() {
    $info.text('Building...');
    $spin.show();
    spinner.spin($spin[0]);
  });

  on('gif', function(dataUrl) {
    $spin.hide();
    spinner.stop();
    $record.removeClass('disabled recording');
    $info.text('Record');

    $gif.attr('src', dataUrl).show();
    $gifLink.attr('href', dataUrl);
  });

  function loading() {
    $('#knob, canvas').show();
    $gif.hide();
    $record.addClass('disabled');
    $info.text('Wait...');
  }

  function record() {
    $record.addClass('recording');
    $('#knob, canvas').hide();
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
    $knob.val(2).trigger('change');
    var interval = setInterval(function() {
      $knob.val($knob.val() - 1).trigger('change');
      if ($knob.val() > 0) return;

      clearInterval(interval);
      record();
    }, 1000);
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
