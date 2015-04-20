describe("", function() {

  var chrome = {
    notifications: {
      onClicked: {}
    },
    storage: {
      local: {}
    }
  };

  var navigator = {
    onClicked: {}
  };

  var batteryManager = {
    then: function () {}
  };

  beforeEach(function() {
    chrome.notifications.create = jasmine.createSpy('create');
    chrome.notifications.onClicked.addListener = jasmine.createSpy('addListener');
    chrome.storage.local.get = jasmine.createSpy('get');
    navigator.getBattery = jasmine.createSpy('getBattery').and.returnValue(batteryManager);

    init(chrome, navigator);
  });

  describe("Time formatting", function() {
    it("should convert qantity and units to seconds", function() {
      expect(unformatTime(1, 'seconds')).toBe(1);
      expect(unformatTime(2, 'seconds')).toBe(2);
      expect(unformatTime(70, 'seconds')).toBe(70);
      expect(unformatTime(0, 'minutes')).toBe(0);
      expect(unformatTime(1, 'minutes')).toBe(60);
      expect(unformatTime(2, 'minutes')).toBe(120);
      expect(unformatTime(40, 'minutes')).toBe(2400);
      expect(unformatTime(0, 'hours')).toBe(0);
      expect(unformatTime(1, 'hours')).toBe(3600);
      expect(unformatTime(2, 'hours')).toBe(7200);
      expect(unformatTime(10, 'hours')).toBe(36000);
    });

    it("should convert seconds to text", function() {
      expect(formatTime(0)).toBe("0 minutes");
      expect(formatTime(59)).toBe("0 minutes");
      expect(formatTime(60)).toBe("1 minute");
      expect(formatTime(119)).toBe("1 minute");
      expect(formatTime(120)).toBe("2 minutes");
      expect(formatTime(1238)).toBe("20 minutes");
      expect(formatTime(3600)).toBe("1 hour");
      expect(formatTime(3660)).toBe("1 hour, 1 minute");
      expect(formatTime(3800)).toBe("1 hour, 3 minutes");
      expect(formatTime(19238)).toBe("5 hours, 20 minutes");
    });
  });

  describe("Triggers", function() {
    var triggers;

    beforeEach(function() {
      triggers = [
        new Trigger(50),
        new Trigger(10),
        new Trigger(null, 30, "seconds"),
        new Trigger(null, 15, "minutes")
      ];
    });

    it("can be parsed from json", function() {
      var json = [
        {percent: 50},
        {percent: 10},
        {timeAmount: 30, timeUnit: 'seconds'},
        {timeAmount: 15, timeUnit: 'minutes'}
      ];

      var asTriggers = json.map(function(js) {
        return Trigger.fromJsonObject(js);
      });

      expect(asTriggers).toEqual(triggers);
    });

    xit("should return true when battery matches", function() {
      var batteries = [
        {}
      ];
    });

  });
});
