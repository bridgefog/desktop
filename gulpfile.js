var livereload = require('gulp-livereload')
var gulp = require('gulp')
var sourcemaps = require('gulp-sourcemaps')
var gulpReact = require('gulp-react')
var gulpBabel = require('gulp-babel')
var electron = require('electron-prebuilt')
var proc = require('child_process')
var gulpJshint = require('gulp-jshint')
var jscs = require('gulp-jscs')
var jsxhint = require('jshint-jsx').JSXHINT

var globs = {
  javascripts: ['./lib/**/*.js'],
  package_json: ['./package.json'],
  html: ['./static/*.html'],
  rc_files: ['./.js*rc'],
  gulpfile: [__filename],
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

gulp.task('watch-js-bundle', function () {
  // run once straight away; not a task dependency because we don't want the
  // watch task dependent on success of initial `js-bundle` run
  gulp.start('js-bundle')
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
  return gulp.src([].concat(globs.javascripts).concat(globs.gulpfile))
    .pipe(jscs())
})

gulp.task('jshint', function () {
  var jsAndJSONFiles = [].concat(
    globs.javascripts,
    globs.gulpfile,
    globs.rc_files,
    globs.package_json
  )

  return gulp.src(jsAndJSONFiles)
    .pipe(gulpJshint({ linter: jsxhint }))
})

gulp.task('livereload', function () {
  return livereload.listen({ port: 35729 })
})

gulp.task('electron', function (done) {
  var electronProc = proc.spawn(electron, [__dirname])
  electronProc.on('exit', function () {
    done()
    gulp.start('electron')
  })
})

gulp.task('default', [
  'livereload',
  'watch-lint',
  'watch-js-bundle',
  'watch-html-bundle',
  'electron',
])

gulp.task('lint', ['jscs', 'jshint'])

gulp.task('watch-lint', function () {
  // run once straight away; not a task dependency because we don't want the
  // watch task dependent on success of initial `lint` run
  gulp.start('lint')

  return gulp.watch(globs.javascripts, ['lint'])
})

gulp.task('test', ['lint'])

gulp.task('dist', ['js-bundle', 'html-bundle'])
