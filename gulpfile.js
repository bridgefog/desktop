var electron = require('electron-prebuilt')
var gulp = require('gulp')
var gulpBabel = require('gulp-babel')
var gulpJshint = require('gulp-jshint')
var gulpReact = require('gulp-react')
var jscs = require('gulp-jscs')
var jsxhint = require('jshint-jsx').JSXHINT
var livereload = require('gulp-livereload')
var newer = require('gulp-newer')
var plumber = require('gulp-plumber')
var proc = require('child_process')
var sourcemaps = require('gulp-sourcemaps')

var globs = {
  javascripts: ['./lib/**/*.js'],
  package_json: ['./package.json'],
  static: ['./static/**/*'],
  rc_files: ['./.js*rc'],
  gulpfile: [__filename],
  tests: ['./test/*.js'],
  dest: ['./dist'],
  bin: ['./bin/*'],
}
globs.jsAndJSONFiles = [].concat(
  globs.javascripts,
  globs.tests,
  globs.bin,
  globs.gulpfile,
  globs.rc_files,
  globs.package_json
)

gulp.task('js-bundle', function () {
  return gulp.src(globs.javascripts)
    .pipe(plumber(function (err) { console.log('[js-bundle ERROR]', err.stack) }))
    .pipe(newer(globs.dest[0]))
    .pipe(sourcemaps.init())
    .pipe(gulpBabel())
    .pipe(gulpReact())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(globs.dest[0]))
    .pipe(livereload())
})

gulp.task('watch-js-bundle', function () {
  // run once straight away; not a task dependency because we don't want the
  // watch task dependent on success of initial `js-bundle` run
  gulp.start('js-bundle')
  return gulp.watch(globs.javascripts, ['js-bundle'])
})

gulp.task('static-bundle', function () {
  return gulp.src(globs.static)
    .pipe(newer(globs.dest[0]))
    .pipe(gulp.dest(globs.dest[0]))
    .pipe(livereload())
})

gulp.task('watch-static-bundle', ['static-bundle'], function () {
  return gulp.watch(globs.static, ['static-bundle'])
})

gulp.task('jscs', function () {
  return gulp.src([].concat(globs.javascripts, globs.tests, globs.bin, globs.gulpfile))
    .pipe(jscs())
})

gulp.task('jshint', function () {
  return gulp.src(globs.jsAndJSONFiles)
    .pipe(gulpJshint({ linter: jsxhint }))
})

gulp.task('livereload', function () {
  return livereload.listen({ port: 35729 })
})

gulp.task('electron', ['js-bundle', 'static-bundle'], function (done) {
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
  'watch-static-bundle',
  'electron',
])

gulp.task('lint', ['jscs', 'jshint'])

gulp.task('watch-lint', function () {
  // run once straight away; not a task dependency because we don't want the
  // watch task dependent on success of initial `lint` run
  gulp.start('lint')

  return gulp.watch(globs.jsAndJSONFiles, ['lint'])
})

gulp.task('test', ['lint'])

gulp.task('dist', ['js-bundle', 'static-bundle'])
