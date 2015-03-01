/**
 * Time to text conversions
 */
function formatTime(seconds) {
  var minutes = Math.floor(seconds / 60),
      hours = Math.floor(minutes / 60),
      days = Math.floor(hours / 24),

      moddedSeconds = seconds % 60,
      moddedMinutes = minutes % 60,
      moddedHours = hours % 24,

      secondsText = (moddedSeconds == 1) ? "1 second" : moddedSeconds + " seconds",
      minutesText = (moddedMinutes == 1) ? "1 minute" : moddedMinutes + " minutes",
      hoursText = (moddedHours == 1) ? "1 hour" : moddedHours + " hours",
      daysText = (days == 1) ? "1 day" : days + " days";

  if (days >= 1) {
    return (moddedHours == 0) ? daysText : daysText + ", " + hoursText;
  }
  else if (hours >= 1) {
    return (moddedMinutes == 0) ? hoursText : hoursText + ", " + minutesText;
  }
  else if (minutes >= 1) {
    return (moddedSeconds == 0) ? minutesText : minutesText + ", " + secondsText;
  }
  else {
    return secondsText;
  }
}

function unformatTime(count, unit) {
  switch (unit) {
    case "seconds":
      return count;
    case "minutes":
      return unformatTime(count * 60, "seconds");
    case "hours":
      return unformatTime(count * 60, "minutes");
    case "days":
      return unformatTime(count * 24, "hours");
  }
}


/**
 * Triggers
 */
var Trigger = function(_percent, _timeAmount, _timeUnit) {
  this.percent = _percent ? _percent : null;
  if (_timeAmount && _timeUnit) {
    this.timeAmount = _timeAmount;
    this.timeUnit = _timeUnit;
  } else {
    this.timeAmount = null;
    this.timeUnit = null;
  }

  return this;
};

Trigger.prototype.check = function(battery) {
  if (this.percent !== null) {
    if(this.percent === Math.ceil(battery.level * 100) ||
       this.percent === Math.floor(battery.level * 100)) {
         return true;
    }
  }

  if (this.time() !== null) {
    if (this.time() === battery.chargingTime ||
        this.time() === battery.dischargingTime) {
          return true;
    }
  }

  /* otherwise.. */
  return false;
};

Trigger.prototype.time = function() {
  if (this.timeAmount !== null && this.timeUnit !== null) {
    return unformatTime(this.timeAmount, this.timeUnit);
  } else {
    return null;
  }
}

Trigger.fromJsonObject = function(obj) {
  return new Trigger(obj.percent, obj.timeAmount, obj.timeUnit);
};


/**
 * Warnings
 */
function Warning(options) {
  options = options || {};

  this.enabled = options.enabled ? options.enabled : true;
  this.trigger = options.trigger ? options.trigger : new Trigger(10);

  this.shown = false;
}

Warning.prototype.notificationId = "battery-warning";

Warning.prototype.name = function() {
  var percentText, timeText;

  if (this.trigger.percent !== null) {
    percentText = this.trigger.percent + "%";
  }

  if (this.trigger.time() !== null) {
    timeText = formatTime(this.trigger.time());
  }

  if (percentText && timeText) {
    return "Warning: " + percentText + ", " + timeText;
  }
  else if (percentText) {
    return "Warning: " + percentText;
  }
  else if (timeText) {
    return "Warning: " + timeText;
  }
};

Warning.prototype.checkBattery = function(battery) {

  var isTriggered = this.trigger.check(battery);

  if (this.enabled) {
  if (!battery.charging) {
  if (!this.shown && isTriggered) {
    this.showNotification(battery);
  }}}

  this.shown = isTriggered;
};

Warning.prototype.updateNotificationId = function(newId) {
  Warning.prototype.notificationId = newId;
};

Warning.prototype.showNotification = function(battery) {
  var percentage = Math.floor(battery.level * 100);

  chrome.notifications.create(
    this.notificationId,
    {
      type: "progress",
      title: "Battery Warning",
      message: "battery is " + percentage + "%",
      iconUrl: "assets/icon_128.png",
      progress: percentage
    },
    this.updateNotificationId
  );
};

Warning.fromJsonObject = function(obj) {
  obj.trigger = Trigger.fromJsonObject(obj.trigger);
  return new Warning(obj);
};


var warnings = [
  new Warning({})
];

var setOptions = function(json) {
  warnings = json.map(function (obj) {
    return Warning.fromJsonObject(obj);
  });
  console.log("Options set.");
};

function loadFromStorage() {
  var storeKey = "warnings";
  try {
    chrome.storage.local.get(storeKey, function(results) {
      if (results[storeKey]) {
        var json = results[storeKey]
        setOptions(json);
        console.log(warnings.length + " settings loaded from local storage.");
      }  else {
        console.log("No settings found.");
      }
    });
  }
  catch (err) {
    console.log("Error loading settings from local storage:");
    console.log(err + " " + JSON.stringify(err));
    return null;
  }
}


/* See https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API */
navigator.getBattery().then(function(battery){

  loadFromStorage();

  battery.addEventListener('levelchange', function() {
    var battery = this;
    warnings.forEach(function(warning) {
      warning.checkBattery(battery);
    });
  });

}, function() {
  console.log("no battery found");
});