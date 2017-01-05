module.exports = function () {
  var src = './src/',
     app = src + 'app/',
     temp = './src/.tmp/',
     dest = './src/',
     build = './www/',
     bower = {
      json: require('./bower.json'),
      directory: './src/bower_components/',
      ignorePath: '../..',
      exclude: [
        'src/bower_components/angular/angular.js',
        'src/bower_components/angular-animate/*.js',
        'src/bower_components/angular-sanitize/*.js',
        'src/bower_components/angular-ui-router/release/*.js'
      ]
    },
    wiredep = require('wiredep'),
    bowerFiles = wiredep({
      devDependencies: true
    })['js'],
    config = {

      /**
       * File paths
       */

      // All javascript that we want to vet
      alljs: [
        './src/app/**/*.js',
        './*.js'
      ],
      libjson: bower.directory + 'nf-*/**/*.json',
      bower: bower,
      build: build,
      css: temp + 'ionic.app.css',
      libcss: bower.directory + 'nf-*/**/*.css',
      dest: dest,
      fonts: [
        bower.directory + 'ionic/release/fonts/**/*.*',
        bower.directory + 'roboto-fontface/fonts/**/*.*'
      ],
      json: src + 'json/**/*.*',
      htmltemplates: app + '**/*.html',
      momentFiles: bower.directory + 'moment/min/*.*',
      libhtmltemplates: bower.directory + 'nf-*/**/*.html',
      images: src + 'images/**/*.*',
      libsvg: bower.directory + 'nf-*/**/*.svg',
      libimages: bower.directory + 'nf-*/**/*.png',
      index: src + 'index.html',
      locales: src + 'locales/*.*',
      masterLocale: src + 'locales/en.json',
      extlib: src + 'apig/**/*.*',
      globalFiles: src + 'globals/**/*.*',
      apigPath: src + 'external_components/apig',
      apigTmp: src + 'apig/',
      globalsIn: app + 'globals/',
      globalsTmp: src + 'globals/',
      globalsBuild: build + 'globals/',

      // App js, with no specs

      js: [
        src + '**/*.module.js',
        src + '**/*.js',
        '!' + src + '**/*.spec.js',
        '!' + bower.directory + '**/*.js',
        '!' + src + 'external_components/**/*.*',
        '!' + src + 'apig/**',
        '!' + src + 'globals/**',
        '!' + app + 'globals/**'
      ],
      jsOrder: [
        '**/app.module.js',
        '**/*.module.js',
        '**/*.js'
      ],

      /**
       * Optimized files
       */

      optimized: {
        app: 'app.js',
        lib: 'lib.js'
      },
      sass: src + 'styles/ionic.app.scss',
      src: src,
      temp: temp,

      /**
       * Template cache
       */

      templateCache: {
        file: 'templates.js',
        options: {
          module: 'app.core',
          root: 'app/',
          standalone: false
        }
      },
      specHelpers: [src + 'test-helpers/*.js']
    };

  /**
   * Wiredep and bower settings
   */

  config.getWiredepDefaultOptions = function () {
    var options = {
      bowerJson: config.bower.json,
      directory: config.bower.directory,
      ignorePath: config.bower.ignorePath,
      exclude: config.bower.exclude
    };
    return options;
  };

  /**
   * Karma settings
   */

  config.karma = getKarmaOptions();

  return config;

  function getKarmaOptions() {
    var options = {
      files: [].concat(
        bowerFiles,
        config.specHelpers,
        app + '**/*.module.js',
        app + '**/*.js',
        temp + config.templateCache.file
      ),
      exclude: [],
      preprocessors: {}
    };

    return options;
  }
};
