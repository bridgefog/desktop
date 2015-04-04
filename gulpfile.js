var babelify = require('babelify')
var browserify = require('browserify')
var buffer = require('vinyl-buffer')
var gulp = require('gulp')
var gutil = require('gulp-util')
var ipfsMock = require('./test/mock-ipfs')
var jscs = require('gulp-jscs')
var jshint = require('gulp-jshint')
var mocha = require('gulp-mocha')
var mochaReporter = require('./test/support/gulp-mocha-reporter')
var source = require('vinyl-source-stream')
var sourcemaps = require('gulp-sourcemaps')
var watchify = require('watchify')

var bundler = watchify(browserify(watchify.args))

function buildBrowserBundle() {
  bundler
    .transform(babelify)
    .bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error')) // log errors if they happen
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./browser'))
}

bundler.add('./index.js')

bundler.on('update', buildBrowserBundle)
bundler.on('log', gutil.log)

gulp.task('browser-bundle', buildBrowserBundle)

gulp.task('jscs', function () {
  return gulp.src(['{lib,test,bin,demos,script}/**/*.js', '*.js'])
    .pipe(jscs())
})

gulp.task('jshint', function () {
  return gulp.src(['{lib,test,bin,demos,script}/**/*.js', 'package.json', '*.js', '.js*rc'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
})

gulp.task('lint', ['jscs', 'jshint'])

gulp.task('watch-lint', function () {
  return gulp.watch(['{lib,test,bin,demos,script}/**/*.js', '*.js'], ['lint'])
})

gulp.task('mocha', function () {
  return gulp.src(['test/*.js'], { read: false })
    .pipe(mocha({ reporter: mochaReporter }))
    .once('end', function () {
      return ipfsMock.stop()
    })
})

gulp.task('test', ['mocha', 'lint'])

gulp.task('watch-mocha', function () {
  gulp.watch(['lib/**', 'test/**'], ['mocha'])
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
