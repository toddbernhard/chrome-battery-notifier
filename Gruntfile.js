module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/options.js', 'src/monitor.js', 'test/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'karma']
    },
    karma: {
      unit: {
        autoWatch: false,
        browsers: ['PhantomJS'],
        frameworks: ['jasmine'],
        singleRun: true,
        files: [{
          src: 'test/**/*.js'
        }, {
          src: 'src/lib/*.js'
        }, {
          src: 'src/monitor.js'
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['jshint', 'karma']);
};
