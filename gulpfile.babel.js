import R from 'ramda'
import del from 'del'
import electron from 'electron-prebuilt'
import gulp from 'gulp'
import gulpBabel from 'gulp-babel'
import gulpJshint from 'gulp-jshint'
import gulpReact from 'gulp-react'
import jscs from 'gulp-jscs'
import jsxhint from 'jshint-jsx'
import livereload from 'gulp-livereload'
import mocha from 'gulp-mocha'
import newer from 'gulp-newer'
import path from 'path'
import plumber from 'gulp-plumber'
import proc from 'child_process'
import sourcemaps from 'gulp-sourcemaps'

import packageJSON from './package.json'

var electronCtxPath = path.resolve(__dirname, 'dist')
var electronBinPath = process.env.ELECTRON_PATH || electron
var electronVersion = packageJSON.devDependencies['electron-prebuilt']

var globs = {
  bin: ['./bin/*.js'],
  dest: ['./dist'],
  distCompiled: ['./dist/{lib,static,resources}'],
  gulpfile: [__filename],
  integration_tests: ['test/integration/**/*.js'],
  javascripts: ['./lib/**/*.js'],
  package_json: ['./package.json'],
  rc_files: ['./.js*rc'],
  static: ['./static/**/*', './resources/**/*'],
  test_support: ['test/support/**/*.js'],
  unit_tests: ['test/unit/**/*.js'],
}

globs.allJS = [].concat(
  globs.javascripts,
  globs.bin,
  globs.gulpfile,
  globs.unit_tests,
  globs.integration_tests,
  globs.test_support
)
globs.allJSON = [].concat(
  globs.rc_files,
  globs.package_json
)

gulp.task('default', [
  'livereload',
  'watch-lint',
  'watch-js-bundle',
  'watch-static-bundle',
  'watch-unit-tests',
  'test',
])

gulp.task('js-bundle', () => {
  return gulp.src(globs.javascripts, { base: '.' })
    .pipe(plumber(err => console.log('[js-bundle ERROR]', err.stack)))
    .pipe(newer(globs.dest[0]))
    .pipe(sourcemaps.init())
    .pipe(gulpBabel())
    .pipe(gulpReact())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(globs.dest[0]))
    .pipe(livereload())
})

gulp.task('watch-js-bundle', () => {
  // run once straight away; not a task dependency because we don't want the
  // watch task dependent on success of initial `js-bundle` run
  gulp.start('js-bundle')
  return gulp.watch(globs.javascripts, ['js-bundle'])
})

gulp.task('static-bundle', () => {
  return gulp.src(globs.static, { base: '.' })
    .pipe(newer(globs.dest[0]))
    .pipe(gulp.dest(globs.dest[0]))
    .pipe(livereload())
})

gulp.task('watch-static-bundle', ['static-bundle'], () => {
  return gulp.watch(globs.static, ['static-bundle'])
})

gulp.task('jscs', () => {
  return gulp.src([].concat(globs.allJS), { base: '.' })
    .pipe(jscs())
})

gulp.task('jshint', () => {
  return gulp.src([].concat(globs.allJS, globs.allJSON), { base: '.' })
    .pipe(gulpJshint({ linter: jsxhint.JSXHINT }))
})

gulp.task('livereload', () => {
  return livereload.listen({ port: 35729 })
})

gulp.task('electron', ['js-bundle', 'static-bundle'], (done) => {
  console.log('Starting electron shell ', electronBinPath)
  var electronProc = proc.spawn(electronBinPath, ['--disable-http-cache', electronCtxPath], {
    stdio: ['inherit', 'inherit', 'inherit'],
    env: R.merge(process.env, {
      GULP: 'true',
      NODE_DEBUG: 'boot,ipfs-daemon,discovery,storage,discovery/swarm',
    }),
  })
  electronProc.on('exit', done)
})

gulp.task('lint', ['jscs', 'jshint'])

gulp.task('watch-lint', () => {
  // run once straight away; not a task dependency because we don't want the
  // watch task dependent on success of initial `lint` run
  gulp.start('lint')

  return gulp.watch([].concat(globs.allJS, globs.allJSON), ['lint'])
})

gulp.task('unit-tests', () => {
  return gulp.src(globs.unit_tests, { read: false })
    .pipe(mocha({ reporter: testReporter(), }))
})

gulp.task('integration-tests', () => {
  return gulp.src(globs.integration_tests, { read: false })
    .pipe(mocha({ reporter: testReporter(), }))
})

gulp.task('test', ['unit-tests', 'lint'])

gulp.task('watch-unit-tests', () => {
  gulp.watch([].concat(globs.javascripts, globs.unit_tests, globs.test_support), ['unit-tests'])
})

gulp.task('watch-unit-tests-spec-reporter', (done) => {
  process.env.SPEC_REPORTER = '1'
  gulp.start('watch-unit-tests', done)
})

gulp.task('watch-integration-tests', () => {
  gulp.watch([].concat(globs.javascripts, globs.integration_tests, globs.test_support), ['integration-tests'])
})

gulp.task('dist:clean', (done) => {
  del(globs.distCompiled, done)
})

gulp.task('dist', ['dist:clean'], (done) => {
  gulp.start('js-bundle', 'static-bundle', done)
})

gulp.task('build-linux-x64', ['dist'], buildRelease('linux', 'x64'))
gulp.task('build-linux-ia32', ['dist'], buildRelease('linux', 'ia32'))
gulp.task('build-linux', ['build-linux-x64', 'build-linux-ia32'])
gulp.task('build-osx', ['dist'], buildRelease('darwin', 'x64'))
gulp.task('build', ['build-osx', 'build-linux'])

function testReporter() {
  return process.env.SPEC_REPORTER ? 'spec' : require('./test/support/gulp-mocha-reporter')
}

function buildRelease(os, arch) {
  return () => {
    var packager = require('./utils/release-package')
    return packager({
      os,
      arch,
      electronVersion,
      name: packageJSON.name,
      version: packageJSON.version,
      outputDir: path.resolve(__dirname, './pkg'),
      inputDir: electronCtxPath,
    })
  }
}
