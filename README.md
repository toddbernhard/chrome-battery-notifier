[View in Chrome Web Store](https://chrome.google.com/webstore/detail/battery-notifier/naeehnbamndblediboamhigjpegencee)

This small extension which provides 3 configurable notifications.  They can be triggered by either

- percent power remaining, _or_
- estimated time left

The notification built into Chrome OS appears at 15 minutes remaining. As of v.43, it is not configurable. Requires v.38+ and no permissions.

### Development

    npm install   # install dependecies

##### Grunt build steps:

    grunt         # clean, test, dist

    grunt clean   # build directory
    grunt test    # JS-lint + mocha tests, single run
    grunt watch   # run "test" when files change
    grunt dist    #- copy files to build directory,
                  #- browserify and uglify JS sources,
                  #- pack the .crx

### Credits and Legal
The icon was created by [P.J. Onori](http://www.somerandomdude.com/),  licensed [Attribution-Non-Commercial 3.0 Netherlands](http://creativecommons.org/licenses/by-nc/3.0/nl/deed.en_GB). Found on [iconfinder.com](https://www.iconfinder.com/icons/118734/battery_charging_icon).

The GitHub stuff is, of course, [owned by GitHub](https://github.com/logos).

Project structure is based on [salsita/chrome-extension-skeleton](https://github.com/salsita/chrome-extension-skeleton).

Everything else is [MIT](http://en.wikipedia.org/wiki/MIT_License).
