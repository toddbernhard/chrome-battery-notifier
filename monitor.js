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
var Trigger = function(_percent, _time) {
  this.percent = _percent || null;
  this.time = _time || null;  /* time in seconds */

  return this;
};

Trigger.prototype.check = function(battery) {
  if (this.percent !== null) {
    if(this.percent === Math.ceil(battery.level * 100) ||
       this.percent === Math.floor(battery.level * 100)) {
         return true;
    }
  }

  if (this.time !== null) {
    if (this.time === battery.chargingTime ||
        this.time === battery.dischargingTime) {
          return true;
    }
  }

  /* otherwise.. */
  return false;
};


/**
 * Warnings
 */
function Warning(options) {
  options = options || {};

  this.enabled = options.enabled || true; // unsupported
  this.trigger = options.trigger || new Trigger(43, null);
  this.name = ""; // unsupported
  this.whenCharging = false; // unsupported
  this.whenDischarging = true; // unsupported

  this.shown = false;
  this.battery = undefined;
}

Warning.prototype.notificationId = "battery-warning";

Warning.prototype.defaultName = function() {
  var percentText, timeText;

  if (this.trigger.percent !== null) {
    percentText = this.trigger.percent + "%";
  }

  if (this.trigger.time !== null) {
    timeText = formatTime(this.trigger.time);
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
  this.battery = battery;

  var isTriggered = this.trigger.check(this.battery);

  if (!this.shown && isTriggered) {
    this.showNotification();
  }

  this.shown = isTriggered;
};

Warning.prototype.updateNotificationId = function(newId) {
  Warning.prototype.notificationId = newId;
};

Warning.prototype.showNotification = function() {
  chrome.notifications.create(
    this.notificationId,
    {
      type: "progress",
      title: "Battery Warning",
      message: "battery is " + this.battery.level * 100 + "%",
      iconUrl: "assets/icon_128.png",
      progress: Math.floor(this.battery.level * 100)
    },
    this.updateNotificationId
  );
};


var warnings = [
  new Warning({})
];

Warning.prototype.listenToBattery = function(battery) {
  if (this.battery) {
    stopListening();
  }

  if (battery) {
    this.battery = battery;

    if (this.trigger.time !== null) {
      battery.addEventListener('dischargingtimechange', this.checkBattery);
    }

    if (this.trigger.percent !== null) {
      battery.addEventListener('levelchange', this.checkBattery);
    }
  }
};

Warning.prototype.stopListening = function() {
  if (this.battery) {
    this.battery.removeEventListener('dischargingtimechange', this.checkBattery);
    this.battery.removeEventListener('levelchange', this.checkBattery);
  }
};


/* See https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API */
navigator.getBattery().then(function(battery){

  battery.addEventListener('levelchange', function(huh) {
    var battery = this;
    warnings.forEach(function (warning) {
      warning.checkBattery(battery);
    });
  });

});