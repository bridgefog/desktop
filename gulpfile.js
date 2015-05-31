var browserSync = require('browser-sync')
var buffer = require('vinyl-buffer')
var gulp = require('gulp')
var gutil = require('gulp-util')
var source = require('vinyl-source-stream')
var sourcemaps = require('gulp-sourcemaps')
var react = require('gulp-react')

var globs = {
  javascripts: ['./lib/**/*.js'],
  package_json: ['./package.json'],
  html: ['./static/*.html'],
  rc_files: ['./.js*rc'],
  tests: ['./test/*.js'],
}

gulp.task('js-bundle', function () {
})

gulp.task('watch-js-bundle', function () {
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
  return browserSync({
    open: false,
    server: {
      baseDir: './dist',
    },
  })
})

gulp.task('dev-server', [
  'browser-sync-server',
  'watch-js-bundle',
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

gulp.task('dist', ['js-bundle', 'html-bundle'])

gulp.task('default', [
  'watch-lint',
  'watch-gulpfile',
  'dev-server',
])
