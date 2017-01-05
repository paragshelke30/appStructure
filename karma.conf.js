// Karma configuration
// Generated on Thu Oct 08 2015 10:40:36 GMT+0200 (CEST)

module.exports = function (config) {
  var gulpConfig = require('./gulp.config')();

  config.set({

    // Base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // Frameworks to use
    // Available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // List of files / patterns to load in the browser
    files: gulpConfig.karma.files,

    // List of files to exclude
    exclude: gulpConfig.karma.exclude,

    // Preprocess matching files before serving them to the browser
    // Available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: gulpConfig.karma.preprocessors,

    // Test results reporter to use
    // Possible values: 'dots', 'progress'
    // Available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec'],
    junitreporter: {
      useBrowserName: false,
      outputfile: 'test-results.xml'
    },

    // Web server port
    port: process.env.KARMA_BROWSER_PORT || 9876,

    // Enable / disable colors in the output (reporters and logs)
    colors: true,

    /**
     * Level of logging
     * possible values:
     * config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG  */
    logLevel: config.LOG_INFO,

    // Enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers
    // Available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // How many browser should be started simultaneous
    concurrency: Infinity
  });
};
