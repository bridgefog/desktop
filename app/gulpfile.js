var browserSync = require('browser-sync')
var buffer = require('vinyl-buffer')
var gulp = require('gulp')
var gutil = require('gulp-util')
var source = require('vinyl-source-stream')
var sourcemaps = require('gulp-sourcemaps')

var globs = {
  javascripts: ['./src/js/**/*.js'],
  css: ['./src/css/**/*.css'],
  html: ['./src/**/*.html'],
  package_json: ['package.json'],
  rc_files: ['.js*rc'],
  tests: ['test/*.js'],
}

function buildBrowserifyBundler() {
  var browserify = require('browserify')
  var babelify = require('babelify')

  var opts = {
    debug: true,
    cache: {},
    packageCache: {},
  }
  return browserify(opts)
    .transform(babelify)
    .add('./src/js/index.js')
    .on('log', gutil.log)
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
}

function buildBrowserBundle(bundler) {
  browserSync.notify('Browserify rebuilding...')
  gutil.log('Browserify rebuilding...')
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./dist/js/'))
    .pipe(browserSync.reload({ stream: true }))
}

gulp.task('js-bundle', function () {
  return buildBrowserBundle(buildBrowserifyBundler())
})

gulp.task('watch-js-bundle', function () {
  var watchify = require('watchify')

  var bundler = watchify(buildBrowserifyBundler())
  bundler.on('update', function () { buildBrowserBundle(bundler) })
  return buildBrowserBundle(bundler)
})

gulp.task('css-bundle', function () {
  var postcss = require('gulp-postcss')
  var cssnext = require('cssnext')
  var importcss = require('postcss-import')
  var logWarnings = require('postcss-log-warnings')

  return gulp.src(globs.css)
    .pipe(sourcemaps.init())
    .pipe(postcss([
      cssnext(),
      importcss(),
      logWarnings(),
    ]))
    .on('error', gutil.log.bind(gutil, 'PostCSS Error'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/css/'))
    .pipe(browserSync.reload({ stream: true }))
})

gulp.task('watch-css-bundle', ['css-bundle'], function () {
  return gulp.watch(globs.css, ['css-bundle'])
})

gulp.task('html-bundle', function () {
  return gulp.src(globs.html)
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.reload({ stream: true }))
})

gulp.task('watch-html-bundle', ['html-bundle'], function () {
  return gulp.watch(globs.html, ['html-bundle'])
})

gulp.task('jscs', function () {
  var jscs = require('gulp-jscs')

  return gulp.src(globs.javascripts)
    .pipe(jscs())
})

gulp.task('jshint', function () {
  var jshint = require('gulp-jshint')

  return gulp.src(globs.javascripts + globs.package_json + globs.rc_files)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
})

gulp.task('browser-sync-server', function () {
  var ipfsProxy = require('./dev-support/ipfs-proxy')
  return browserSync({
    open: false,
    server: {
      baseDir: './dist',
      middleware: [
        ipfsProxy({ host: 'localhost', gatewayPort: 8080, apiPort: 5001 })
      ],
    },
  })
})

gulp.task('dev-server', [
  'browser-sync-server',
  'watch-js-bundle',
  'watch-css-bundle',
  'watch-html-bundle',
])

gulp.task('watch-gulpfile', function () {
  // run a gulp loop like this: `(set -e; while true; do clear; gulp; done)`
  return gulp.watch(__filename, function () {
    gutil.log(__filename + ' has changed; exiting.')
    process.exit()
  })
})

gulp.task('lint', ['jscs', 'jshint'])

gulp.task('watch-lint', ['lint'], function () {
  return gulp.watch(globs.javascripts, ['lint'])
})

gulp.task('test', ['lint'])

gulp.task('dist', ['js-bundle', 'css-bundle', 'html-bundle'])

gulp.task('default', [
  'watch-lint',
  'watch-gulpfile',
  'dev-server',
])
