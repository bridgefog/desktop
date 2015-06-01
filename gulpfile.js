var livereload = require('gulp-livereload')
var gulp = require('gulp')
// var gutil = require('gulp-util')
// var path = require('path')
var sourcemaps = require('gulp-sourcemaps')
var gulpReact = require('gulp-react')
var gulpBabel = require('gulp-babel')

var globs = {
  javascripts: ['./lib/**/*.js'],
  package_json: ['./package.json'],
  html: ['./static/*.html'],
  rc_files: ['./.js*rc'],
  tests: ['./test/*.js'],
  dest: ['./dist'],
}

gulp.task('js-bundle', function () {
  return gulp.src(globs.javascripts)
    .pipe(sourcemaps.init())
    .pipe(gulpBabel())
    .pipe(gulpReact())
    .pipe(sourcemaps.write('.'))
    .pipe(livereload())
    .pipe(gulp.dest(globs.dest[0]))
})

gulp.task('watch-js-bundle', ['js-bundle'], function () {
  return gulp.watch(globs.javascripts, ['js-bundle'])
})

gulp.task('html-bundle', function () {
  return gulp.src(globs.html)
    .pipe(gulp.dest('./dist/'))
    .pipe(livereload())
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

gulp.task('livereload', function () {
  return livereload.listen({ port: 35729 })
})

gulp.task('electron', function (done) {
  var electron = require('electron-prebuilt')
  var proc = require('child_process')
  var electronProc = proc.spawn(electron, [__dirname])
  electronProc.on('exit', function() {
    done()
    gulp.start('electron')
  })
})

gulp.task('dev', [
  'livereload',
  'watch-js-bundle',
  'watch-html-bundle',
  'electron',
])

gulp.task('lint', ['jscs', 'jshint'])

gulp.task('watch-lint', ['lint'], function () {
  return gulp.watch(globs.javascripts, ['lint'])
})

gulp.task('test', ['lint'])

gulp.task('dist', ['js-bundle', 'html-bundle'])

gulp.task('default', [
  'watch-lint',
  'dev',
])
