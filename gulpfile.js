var gulp = require('gulp')
var gutil = require('gulp-util')
var sourcemaps = require('gulp-sourcemaps')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var watchify = require('watchify')
var browserify = require('browserify')
var mocha = require('gulp-mocha')
var jshint = require('gulp-jshint')
var jscs = require('gulp-jscs')
var jsbeautifier = require('gulp-jsbeautifier')

var ipfsMock = require('./test/mock-ipfs')

var bundler = watchify(browserify(watchify.args))
  // var bundler = browserify(watchify.args)

function buildBrowserBundle() {
  bundler.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    // optional, remove if you dont want sourcemaps
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    })) // loads map from browserify file
    .pipe(sourcemaps.write('./')) // writes .map file
    //
    .pipe(gulp.dest('./browser'))
}

// add the file to bundle
bundler.add('./index.js')

// add any other browserify options or transforms here
// bundler.transform('brfs')
bundler.on('update', buildBrowserBundle) // on any dep update, runs the bundler
bundler.on('log', gutil.log) // output build logs to terminal

gulp.task('browser-bundle', buildBrowserBundle) // so you can run `gulp js` to build the file

gulp.task('default', ['watch-mocha', 'browser-bundle'], function () {
  // place code for your default task here
})

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

gulp.task('format-js', function () {
  gulp.src(['{lib,test,bin,demos,script}/**/*.js', 'package.json', '*.js'])
    .pipe(jsbeautifier({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('.'))
})

gulp.task('mocha', function () {
  return gulp.src(['test/*.js'], {
      read: false
    })
    .pipe(mocha({
      reporter: 'spec'
    }))
    .once('end', function () {
      ipfsMock.stop()
    })
    .on('error', gutil.log)
})

gulp.task('watch-mocha', function () {
  gulp.watch(['lib/**', 'test/**'], ['mocha'])
})
