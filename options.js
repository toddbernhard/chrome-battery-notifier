$(function() {

  var $enabled = $('input[name=enabled]'),
      $allButEnabled = $('.all-but-enabled'),
      $typeRadios = $('input[name=type]'),
      $percentArg = $('.percent-arg'),
      $timeArg = $('.time-arg'),
      $timeArgAmount = $timeArg.find('input[name=timeArgAmount]'),
      $timeArgUnit = $timeArg.find('input[name=timeArgUnit]');

  tempOptions = [{},{},{}];

  function loadOptions() {
    var options;
    chrome.runtime.getBackgroundPage(function (monitor) {
      tempOptions = monitor.warnings;
      updateDom(tempOptions[0]);
    });
  }

  function cacheOptions() {
    var current = {};
    current.enabled = $enabled.is(':checked');
    current.trigger = {};
    if (isTimeType()) {
      current.trigger.timeAmount = parseInt($timeArgAmount.val());
      current.trigger.timeUnit = $timeArgUnit.val();
    } else {
      current.trigger.percent = parseInt($percentArg.find('input').val());
    }
    return current;
  }

  function saveOptions() {
    var options = cacheOptions();
    chrome.storage.local.set({'warnings': [options]});
    chrome.runtime.getBackgroundPage(function (monitor) {
      monitor.setOptions([options]);
      console.log("Options saved.");
    });
  }


  function updateDom(warning) {
    var triggerType = (warning.trigger.percent !== null) ? 'percent' : 'time';

    $enabled.prop('checked', warning.enabled);
    $typeRadios.find('*[value=' + triggerType + ']').prop('checked', true);
    updateTypeDom(warning);
    updateEnabledDom();
  }

  function updateEnabledDom() {
    if ($enabled.prop('checked')) {
      $allButEnabled.removeClass('disabled').find('input').prop('disabled', false);
    } else {
      $allButEnabled.addClass('disabled').find('input').prop('disabled', true);
    }
  }

  function isTimeType() {
    return $typeRadios.filter('*:checked').val() == 'time';
  }

  function updateTypeDom(warning) {

    if ( ! isTimeType() ) {
      $percentArg.show();
      $timeArg.hide();
      if (warning) {
        $percentArg.find('input').val(warning.trigger.percent);
      }
    } else {
      $timeArg.show();
      $percentArg.hide();
      if (warning) {
        $timeArgAmount.val(warning.trigger.timeAmount);
        $timeArgUnit.val(warning.trigger.timeUnit);
      }
    }
  }


  $enabled.on('click', updateEnabledDom);

  $typeRadios.on('click', updateTypeDom);

  $('#save').on('click', saveOptions);

  loadOptions();
});