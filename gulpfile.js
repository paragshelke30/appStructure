var yargs = require('yargs').argv;
var config = require('./gulp.config')();
var del = require('del');
var gulp = require('gulp');
var Server = require('karma').Server;
var plug = require('gulp-load-plugins')({lazy: true});

/**
 * Yargs variables can be passed in to alter the behavior, when present.
 * Example: gulp serve-dev
 *
 * --verbose  : Various tasks will produce more output to the console.
 */

/**
 * List the available gulp tasks
 */
gulp.task('help', plug.taskListing);
gulp.task('default', ['help']);
gulp.task('serve:before', ['inject', 'watch']);

/**
 * Vet the code and create coverage report
 * @return {Stream}
 */
gulp.task('vet', function () {
  log('Analyzing source with JSHint and JSCS');

  return gulp
    .src(config.alljs)
    .pipe(_handleErrors())
    .pipe(_printVerbose())
    .pipe(plug.jshint())
    .pipe(plug.jshint.reporter('jshint-stylish', {verbose: true}))
    .pipe(plug.if(yargs.fail, plug.jshint.reporter('fail')))
    .pipe(plug.jscs());

  // TODO fixit
  // .pipe(plug.jscs.reporter())
  // .pipe(plug.if(yargs.fail, plug.jscs.reporter('fail')));
});

function _printVerbose() {
  return plug.if(yargs.verbose, plug.print());
}

function _handleErrors() {
  return plug.if(!yargs.fail, plug.plumber(onError));

  function onError(error) {
    plug.util.log(
      plug.util.colors.cyan('Plumber') + plug.util.colors.red(' found unhandled error:\n'),
      error.toString());

    // This line of code solves the watcher crashing on some errors.
    this.emit('end');
  }
}

/**
 * Compile sass to css
 * @return {Stream}
 */
gulp.task('styles', [/*'clean-styles'*/], function (done) {
  log('Compiling SASS --> CSS');

  return gulp
    .src(config.sass)
    .pipe(plug.sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest(config.temp));
});

/**
 * Copy ionic fonts
 * @return {Stream}
 */
gulp.task('fonts', ['clean-fonts'], function () {
  log('Copying fonts');

  return gulp
    .src(config.fonts)
    .pipe(gulp.dest(config.build + 'fonts'));
});

/**
 * Copy json files
 * @return {Stream}
 */
gulp.task('json', ['clean-json'], function () {
  log('Copying json');

  return gulp
    .src(config.json)
    .pipe(gulp.dest(config.build + 'json'));
});

/**
 * Compress images
 * @return {Stream}
 */
gulp.task('images', ['clean-images'], function () {
  log('Compressing and copying images');

  return gulp
    .src(config.images)
    .pipe(plug.imagemin({optimizationLevel: 4}))
    .pipe(gulp.dest(config.build + 'images'));
});

/**
 * Copy lib files
 * @return {Stream}
 */
gulp.task('libfiles', ['clean-libfiles'], function () {
  log('Copying lib files');

  return gulp
    .src([config.libhtmltemplates, config.libjson, config.libimages,
         config.libsvg, config.libcss, config.momentFiles])
    .pipe(gulp.dest(config.build + 'bower_components'));
});

/**
 * Copy lib files
 * @return {Stream}
 */
gulp.task('momentfiles', ['clean-libfiles'], function () {
  log('Copying lib files');

  return gulp
    .src([config.momentFiles])
    .pipe(gulp.dest(config.build + 'bower_components/moment/min'));
});

/**
 * Copy external lib files
 * @return {Stream}
 */
gulp.task('extlibfiles', ['clean-extlibfiles'], function () {
  log('Copying external lib files');

  return gulp
    .src([config.extlib])
    .pipe(gulp.dest(config.build + 'apig'));
});

/**
 * Copy external lib files
 * @return {Stream}
 */
gulp.task('copyglobalsettings', ['clean-copyglobalsettings'], function () {
  log('Copying global settings files');

  return gulp
    .src([config.globalFiles])
    .pipe(gulp.dest(config.build + 'globals'));
});

/**
 * Copy locales folder
 * @return {Stream}
 */
gulp.task('locales', ['clean-locales'], function () {
  log('Copying Locales folder');

  return gulp
        .src(config.locales)
        /* Comments
        .pipe(translations(config.masterLocale, {
          failMissing: yargs.fail,
          failOrphan: yargs.fail
        }))
        */
        .pipe(gulp.dest(config.build + 'locales'));
});

/**
 * Create $templateCache from the html templates
 * @return {Stream}
 */
gulp.task('templatecache', ['clean-code'], function () {
  log('Creating an AngularJS $templateCache');

  return gulp
    .src(config.htmltemplates)
    .pipe(plug.if(yargs.verbose, plug.bytediff.start()))
    .pipe(plug.minifyHtml({empty: true}))
    .pipe(plug.if(yargs.verbose, plug.bytediff.stop(bytediffFormatter)))
    .pipe(plug.angularTemplatecache(
      config.templateCache.file,
      config.templateCache.options
    ))
    .pipe(gulp.dest(config.temp));
});

/**
 * Wire-up the bower dependencies
 * @return {Stream}
 */
gulp.task('wiredep', function () {
  log('Wiring the bower dependencies into the html');

  var wiredep = require('wiredep').stream;
  var options = config.getWiredepDefaultOptions();

  return gulp
    .src(config.index)
    .pipe(wiredep(options))
    .pipe(inject(config.js, '', config.jsOrder))
    .pipe(gulp.dest(config.src));
});

gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function () {
  log('Wire up css into the html, after files are ready');

  return gulp
    .src(config.index)
    .pipe(inject(config.css))
    .pipe(gulp.dest(config.src));
});

gulp.task('watch', function () {
  gulp.watch(config.sass, ['styles']);
  gulp.watch(config.alljs, ['vet']);
});

/**
 * Build everything
 * This is separate so we can run tests on
 * optimize before handling image or fonts
 */
gulp.task('build', ['optimize', 'images', 'fonts', 'libfiles', 'extlibfiles',
          'momentfiles', 'copyglobalsettings', 'json', 'locales'], function () {
  log('Building everything');

  var msg = {
    title: 'gulp build',
    subtitle: 'Deployed to the build folder'
  };
  del(config.temp);
  log(msg);
});

/**
 * Optimize all files, move to a build folder,
 * and inject them into the new index.html
 * @return {Stream}
 */
gulp.task('optimize', ['inject', 'test'], function () {
  log('Optimizing the js, css, and html');

  var assets = plug.useref.assets();
  var templateCache = config.temp + config.templateCache.file;

  return gulp
    .src(config.index)
    .pipe(plug.plumber())
    .pipe(inject(templateCache, 'templates'))
    .pipe(assets)
    .pipe(plug.if('*.css', plug.minifyCss()))

    // Fix ionic fonts path
    .pipe(plug.if('*.css', plug.cssUrlAdjuster({
      replace: ['../bower_components/ionic/release/fonts', '../fonts'],
    })))

    // Fix ruboto fonts path
    .pipe(plug.if('*.css', plug.cssUrlAdjuster({
      replace: ['../../fonts', '../fonts'],
    })))

    .pipe(plug.if('**/' + config.optimized.app, plug.ngAnnotate({add: true})))
    .pipe(plug.if('**/' + config.optimized.app, plug.uglify()))
    .pipe(plug.if('**/' + config.optimized.lib, plug.uglify()))
    .pipe(assets.restore())
    .pipe(plug.useref())
    .pipe(gulp.dest(config.build));
});

/**
 * Remove all files from the build and temp folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean', ['clean-code', 'clean-apig', 'clean-global-settings'], function (done) {
  var delconfig = [].concat(config.build + '**/*', config.temp);
  log('Cleaning: ' + plug.util.colors.blue(delconfig));
  del(delconfig, done);
});

/**
 * Remove all fonts from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-fonts', function (done) {
  clean(config.build + 'fonts/**/*.*', done);
});

/**
 * Remove all fonts from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-extlibfiles', function (done) {
  clean(config.build + 'apig/**/*.*', done);
});

/**
 * Remove all fonts from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-copyglobalsettings', function (done) {
  clean(config.build + 'globals/**/*.*', done);
});

/**
 * Remove all fonts from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-libfiles', function (done) {
  clean(config.build + 'bower_components/**/*.*', done);
});

/**
 * Remove all fonts from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-extlibfiles', function (done) {
  clean(config.build + 'external_components/**/*.*', done);
});

/**
 * Remove all json from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-json', function (done) {
  clean(config.build + 'json/**/*.*', done);
});

/**
 * Remove locale from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-locales', function (done) {
  clean(config.build + 'locales/*.*', done);
});

/**
 * Remove all images from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-images', function (done) {
  clean(config.build + 'images/**/*.*', done);
});

/**
 * Remove all styles from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-styles', function (done) {
  var files = [].concat(
    config.temp + '**/*.css',
    config.build + 'styles/**/*.css'
  );
  clean(files, done);
});

/**
 * Remove all js and html from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-code', function (done) {
  var files = [].concat(
    config.temp + '**/*.js',
    config.build + 'js/**/*.js',
    config.build + '**/*.html'
  );
  clean(files, done);
});

/**
 * Run specs once and exit
 * To start servers and run midway specs as well:
 *    gulp test --startServers
 * @return {Stream}
 */
gulp.task('test', ['vet', 'templatecache'], function (done) {
  var excludeFiles = [];

  new Server({
    configFile: __dirname + '/karma.conf.js',
    exclude: excludeFiles,
    singleRun: true
  }, function () {
    done();
  }).start();
});

gulp.task('install', ['git-check'], function () {
  return plug.bower.commands.install()
    .on('log', function (data) {
      plug.gutil.log('bower', plug.gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function (done) {
  if (!plug.shelljs.which('git')) {
    console.log(
      '  ' + plug.gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', plug.gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + plug.gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }

  done();
});

/**
 * Formatter for bytediff to display the size changes after processing
 * @param  {Object} data - byte data
 * @return {String}      Difference in bytes, formatted
 */
function bytediffFormatter(data) {
  var difference = (data.savings > 0) ? ' smaller.' : ' larger.';
  return data.fileName + ' went from ' +
  (data.startSize / 1000).toFixed(2) + ' kB to ' +
  (data.endSize / 1000).toFixed(2) + ' kB and is ' +
  formatPercent(1 - data.percent, 2) + '%' + difference;
}

/**
 * Format a number as a percentage
 * @param  {Number} num       Number to format as a percent
 * @param  {Number} precision Precision of the decimal
 * @return {String}           Formatted perentage
 */
function formatPercent(num, precision) {
  return (num * 100).toFixed(precision);
}

/**
 * Delete all files in a given path
 * @param  {Array}   path - array of paths to delete
 * @param  {Function} done - callback when complete
 */
function clean(path, done) {
  log('Cleaning: ' + plug.util.colors.blue(path));
  del(path, done);
}

/**
 * Inject files in a sorted sequence at a specified inject label
 * @param   {Array} src   glob pattern for source files
 * @param   {String} label   The label name
 * @param   {Array} order   glob pattern for sort order of the files
 * @returns {Stream}   The stream
 */
function inject(src, label, order) {
  var options = {
    relative: true
  };

  if (label) {
    options.name = 'inject:' + label;
  }

  return plug.inject(orderSrc(src, order), options);
}

/**
 * Order a stream
 * @param   {Stream} src   The gulp.src stream
 * @param   {Array} order Glob array pattern
 * @returns {Stream} The ordered stream
 */
function orderSrc (src, order) {
  return gulp
    .src(src, {read: false})
    .pipe(plug.if(order, plug.order(order)));
}

/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */
function log(msg) {
  if (typeof(msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        plug.util.log(plug.util.colors.blue(msg[item]));
      }
    }
  } else {
    plug.util.log(plug.util.colors.blue(msg));
  }
}

module.exports = gulp;
