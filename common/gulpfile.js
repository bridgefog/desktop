var gulp = require('gulp')
var gutil = require('gulp-util')
var jscs = require('gulp-jscs')
var jshint = require('jshint')
var gulpJshint = require('gulp-jshint')
var jshintStylish = require('jshint-stylish')
var mocha = require('gulp-mocha')
require('babel/register')
var mochaReporter = require('./test/support/gulp-mocha-reporter')
var ipfsMock = require('./test/mock-ipfs')

var globs = {
  javascripts: ['{lib,test,bin,demos,script}/**/*.js', '*.js'],
  package_json: ['package.json'],
  rc_files: ['../.js*rc'],
  tests: ['test/*.js'],
}

gulp.task('jscs', function () {
  return gulp.src(globs.javascripts)
    .pipe(jscs())
})

gulp.task('jshint', function () {
  return gulp.src(globs.javascripts + globs.package_json + globs.rc_files)
    .pipe(gulpJshint({ linter: jshint.JSHINT }))
    .pipe(gulpJshint.reporter(jshintStylish))
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
