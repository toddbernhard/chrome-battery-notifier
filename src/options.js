$(function() {

  var $select = $('select.main'),
      $allOptions = $('div.table'),
      $enabled = $('input[name=enabled]'),
      $allButEnabled = $('.all-but-enabled'),
      $typeRadios = $('input[name=type]'),
      $percentArg = $('.percent-arg'),
      $timeArg = $('.time-arg'),
      $timeAmount = $timeArg.find('input[name=timeArgAmount]'),
      $timeUnit = $timeArg.find('select[name=timeArgUnit]'),
      $save = $('#save');

  var defaultOptions = {
    enabled: false,
    trigger: {
      percent: 5,
      timeUnit: null,
      timeAmount: null
    }
  };

  var temp = {
        options: [defaultOptions, defaultOptions, defaultOptions],
        index: 0,
        getOptions: function(index) {
          index = index || temp.index;
          if (index < temp.options.length) {
            return temp.options[index];
          } else {
            return defaultOptions;
          }
        },
        getAllOptions: function() {
          return [temp.getOptions(0), temp.getOptions(1), temp.getOptions(2)];
        },
        set: function(options) {
          temp.options = options;
        },
        setCurrent: function() {
          temp.options[temp.index] = currentInput();
        }
      };

  function loadOptions() {
    var options;
    chrome.runtime.getBackgroundPage(function (monitor) {
      temp.set(monitor.warnings);
      updateDom(temp.getOptions());
    });
  }

  function currentInput() {
    var current = {};
    current.enabled = $enabled.is(':checked');
    current.trigger = {};
    if (isTimeType()) {
      current.trigger.percent = null;
      current.trigger.timeAmount = parseInt($timeAmount.val());
      current.trigger.timeUnit = $timeUnit.val();
    } else {
      current.trigger.percent = parseInt($percentArg.find('input').val());
      current.trigger.timeAmount = null;
      current.trigger.timeUnit = null;
    }
    return current;
  }

  function saveOptions() {
    temp.setCurrent();
    chrome.storage.local.set({'warnings': temp.getAllOptions()});
    chrome.runtime.getBackgroundPage(function (monitor) {
      monitor.setOptions(temp.getAllOptions());
      console.log("Options saved.");
      $save.prop('disabled', true);
    });
  }


  function changeSelect() {
    temp.setCurrent();
    $allOptions.fadeOut(150, function() {
      temp.index = $select.val();
      updateDom(temp.getOptions());
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
          saved = temp.getOptions();

      var areSame =
        current.enabled === saved.enabled &&
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