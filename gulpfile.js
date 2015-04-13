var babelify = require('babelify')
var browserify = require('browserify')
var buffer = require('vinyl-buffer')
var gulp = require('gulp')
var gutil = require('gulp-util')
var jscs = require('gulp-jscs')
var jshint = require('gulp-jshint')
var mocha = require('gulp-mocha')
var source = require('vinyl-source-stream')
var sourcemaps = require('gulp-sourcemaps')
var watchify = require('watchify')
require('babel/register')
var mochaReporter = require('./test/support/gulp-mocha-reporter')
var ipfsMock = require('./test/mock-ipfs')

var globs = {
  javascripts: ['{lib,test,bin,demos,script}/**/*.js', '*.js'],
  package_json: ['package.json'],
  rc_files: ['.js*rc'],
  tests: ['test/*.js'],
}

var bundler = watchify(browserify(watchify.args)).
  transform(babelify).
  add('./index.js').
  on('update', buildBrowserBundle).
  on('log', gutil.log)

function buildBrowserBundle() {
  bundler
    .bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error')) // log errors if they happen
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./browser'))
}

gulp.task('browser-bundle', buildBrowserBundle)

gulp.task('jscs', function () {
  return gulp.src(globs.javascripts)
    .pipe(jscs())
})

gulp.task('jshint', function () {
  return gulp.src(globs.javascripts + globs.package_json + globs.rc_files)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
})

gulp.task('lint', ['jscs', 'jshint'])

gulp.task('watch-lint', function () {
  return gulp.watch(globs.javascripts, ['lint'])
})

gulp.task('mocha', function () {
  return gulp.src(globs.tests, { read: false })
    .pipe(mocha({ reporter: mochaReporter }))
    .once('end', function () {
      return ipfsMock.stop()
    })
})

gulp.task('test', ['mocha', 'lint'])

gulp.task('watch-mocha', function () {
  gulp.watch(globs.javascripts, ['mocha'])
})

gulp.task('default', [
  'watch-lint',
  'watch-mocha',
  'browser-bundle',
  'test',
  'watch-gulpfile',
])

gulp.task('watch-gulpfile', function () {
  // run a gulp loop like this: `(set -e; while true; do clear; gulp; done)`
  return gulp.watch(__filename, function () {
    gutil.log(__filename + ' has changed; exiting.')
    process.exit()
  })
})
