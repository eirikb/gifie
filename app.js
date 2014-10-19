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
  var token = extractToken(document.location.hash);
  var $imgur = $('#imgur');
  var $imgurOauth = $('#imgur a:first');
  var $imgurAnon = $('#imgur a:last');
  var $imgurUpload = $('#imgur-upload');
  var clientId = '6a5400948b3b376';
  var loader;

  $imgurUpload.hide();
  $imgur.hide();
  $group.hide();
  $error.hide();
  $record.hide();

  $loader.knob().hide();
  $countdown.knob().hide();

  $imgur.find('a').click(function() {
    localStorage.doUpload = true;
  });

  $imgurOauth.attr('href', $imgurOauth.attr('href') + '&client_id=' + clientId);

  $imgurAnon.click(function() {
    imgurUpload();
  });

  function extractToken(hash) {
    var match = hash.match(/access_token=(\w+)/);
    return !!match && match[1];
  }

  function imgurUpload(token) {
    $imgurUpload.show();
    $group.hide();

    var auth;
    if (token) auth = 'Bearer ' + token;
    else auth = 'Client-ID ' + clientId;

    $.ajax({
      url: 'https://api.imgur.com/3/image',
      type: 'POST',
      headers: {
        Authorization: auth,
        Accept: 'application/json'
      },
      data: {
        image: localStorage.dataBase64,
        type: 'base64'
      },
      success: function(result) {
        var id = result.data.id;
        window.location = 'https://imgur.com/gallery/' + id;
      }
    });
  }

  if (token && JSON.parse(localStorage.doUpload)) {
    localStorage.doUpload = false;

    imgurUpload(token);

    return;
  }

  if (!('sendAsBinary' in XMLHttpRequest.prototype)) {
    XMLHttpRequest.prototype.sendAsBinary = function(string) {
      var bytes = Array.prototype.map.call(string, function(c) {
        return c.charCodeAt(0) & 0xff;
      });
      this.send(new Uint8Array(bytes).buffer);
    };
  }

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

  on('gif', function(dataBase64) {
    stopLoader();
    $record.removeClass('disabled recording');
    $info.text('Record');

    localStorage.dataBase64 = dataBase64;
    var dataUrl = 'data:image/gif;base64,' + dataBase64;
    $gif.attr('src', dataUrl).show();
    $gifLink.attr('href', dataUrl);
    $imgur.show();
  });

  function loading() {
    $gif.hide();
    $imgur.hide();
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
