$(function() {

  var $select = $('select'),
      $allOptions = $('div.table'),
      $enabled = $('input[name=enabled]'),
      $allButEnabled = $('.all-but-enabled'),
      $typeRadios = $('input[name=type]'),
      $percentArg = $('.percent-arg'),
      $timeArg = $('.time-arg'),
      $timeAmount = $timeArg.find('input[name=timeArgAmount]'),
      $timeUnit = $timeArg.find('input[name=timeArgUnit]'),
      $save = $('#save');

  var defaultOptions = {
    enabled: false,
    trigger: {
      percent: 5,
      timeUnit: null,
      timeAmount: null
    }
  };

  var tempOptions = [defaultOptions, defaultOptions, defaultOptions],
      optionIndex = 0;

  function loadOptions() {
    var options;
    chrome.runtime.getBackgroundPage(function (monitor) {
      tempOptions = monitor.warnings;
      updateDom(tempOptions[optionIndex]);
    });
  }

  function currentInput() {
    var current = {};
    current.enabled = $enabled.is(':checked');
    current.trigger = {};
    if (isTimeType()) {
      current.trigger.timeAmount = parseInt($timeAmount.val());
      current.trigger.timeUnit = $timeUnit.val();
    } else {
      current.trigger.percent = parseInt($percentArg.find('input').val());
    }
    return current;
  }

  function saveOptions() {
    tempOptions[optionIndex] = currentInput();
    chrome.storage.local.set({'warnings': tempOptions});
    chrome.runtime.getBackgroundPage(function (monitor) {
      monitor.setOptions(tempOptions);
      console.log("Options saved.");
      $save.prop('disabled', true);
    });
  }


  function changeSelect() {
    tempOptions[optionIndex] = currentInput();
    $allOptions.fadeOut(150, function() {
      optionIndex = $select.val();
      updateDom(tempOptions[optionIndex]);
      $allOptions.fadeIn(400);
    });
  }


  function updateDom(options) {
    if (typeof options === "undefined") {
      options = defaultOptions;
    }

    var triggerType = (options.trigger.percent !== null) ? 'percent' : 'time';

    $enabled.prop('checked', options.enabled);
    $typeRadios.find('*[value=' + triggerType + ']').prop('checked', true);
    updateTypeDom(options);
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
        $timeAmount.val(warning.trigger.timeAmount);
        $timeUnit.val(warning.trigger.timeUnit);
      }
    }
  }

  function updateSaveButton() {
    if (!$save.is(':enabled')) {
      var current = currentInput(),
          saved = tempOptions[optionIndex];

      var areSame =
        current.enabled === saved.enabled &&
        current.trigger === saved.trigger &&
        current.trigger.timeAmount === saved.trigger.timeAmount &&
        current.trigger.timeUnit === saved.trigger.timeUnit &&
        current.trigger.percent === saved.trigger.percent;

      if (areSame) {
        $save.prop('disabled', true);
      } else {
        $save.prop('disabled', false);
      }
    }
  }

  $select.on('change', changeSelect);

  $enabled.on('click', updateEnabledDom);

  $typeRadios.on('click', function() {
    updateTypeDom(currentInput());
  });

  $save.on('click', saveOptions);

  $allOptions.on('click', updateSaveButton);

  loadOptions();
});