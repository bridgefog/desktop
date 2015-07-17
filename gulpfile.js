var electron = require('electron-prebuilt')
var gulp = require('gulp')
var gulpBabel = require('gulp-babel')
var gulpJshint = require('gulp-jshint')
var gulpReact = require('gulp-react')
var jscs = require('gulp-jscs')
var jsxhint = require('jshint-jsx').JSXHINT
var livereload = require('gulp-livereload')
var newer = require('gulp-newer')
var path = require('path')
var plumber = require('gulp-plumber')
var gulpUtil = require('gulp-util')
var proc = require('child_process')
var sourcemaps = require('gulp-sourcemaps')
var mocha = require('gulp-mocha')
var R = require('ramda')
require('babel/register')
var mochaReporter = require('./test/support/gulp-mocha-reporter')

var electronCtxPath = path.resolve(__dirname, 'electron-context', 'current')
var electronBinPath = process.env.ELECTRON_PATH || electron
var electronVersion = require('./package.json').devDependencies['electron-prebuilt']

var globs = {
  javascripts: ['./lib/**/*.js'],
  package_json: ['./package.json'],
  static: ['./static/**/*'],
  rc_files: ['./.js*rc'],
  gulpfile: [__filename],
  unit_tests: ['test/unit/**/*.js'],
  integration_tests: ['test/integration/**/*.js'],
  test_support: ['test/support/**/*.js'],
  dest: ['./dist'],
  bin: ['./bin/*.js'],
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
  return gulp.src([].concat(globs.allJS), { base: '.' })
    .pipe(jscs())
})

gulp.task('jshint', function () {
  return gulp.src([].concat(globs.allJS, globs.allJSON), { base: '.' })
    .pipe(gulpJshint({ linter: jsxhint }))
})

gulp.task('livereload', function () {
  return livereload.listen({ port: 35729 })
})

gulp.task('electron', ['js-bundle', 'static-bundle'], function (done) {
  console.log('Starting electron shell ', electronBinPath)
  var electronProc = proc.spawn(electronBinPath, ['--disable-http-cache', electronCtxPath], {
    stdio: ['inherit', 'inherit', 'inherit'],
    env: R.merge(process.env, {
      GULP: 'true',
      NODE_DEBUG: 'ipfs-daemon,discovery,storage,discovery/swarm',
    }),
  })
  electronProc.on('exit', done)
})

var defaultPrereqs = [
  'livereload',
  'watch-lint',
  'watch-js-bundle',
  'watch-static-bundle',
  'watch-unit-tests',
  'test',
]

gulp.task('default', defaultPrereqs)

gulp.task('lint', ['jscs', 'jshint'])

gulp.task('watch-lint', function () {
  // run once straight away; not a task dependency because we don't want the
  // watch task dependent on success of initial `lint` run
  gulp.start('lint')

  return gulp.watch([].concat(globs.allJS, globs.allJSON), ['lint'])
})

gulp.task('unit-tests', function () {
  return gulp.src(globs.unit_tests, { read: false })
    .pipe(mocha({ reporter: mochaReporter, }))
})

gulp.task('unit-tests-spec-reporter', function () {
  return gulp.src(globs.unit_tests, { read: false })
    .pipe(mocha({ reporter: 'spec', }))
})

gulp.task('integration-tests', function () {
  return gulp.src(globs.integration_tests, { read: false })
    .pipe(mocha({ reporter: mochaReporter, }))
})

gulp.task('test', ['unit-tests', 'lint'])

gulp.task('watch-unit-tests', function () {
  gulp.watch([].concat(globs.javascripts, globs.unit_tests, globs.test_support), ['unit-tests'])
})

gulp.task('watch-unit-tests-spec-reporter', function () {
  gulp.watch([].concat(globs.javascripts, globs.unit_tests, globs.test_support), ['unit-tests-spec-reporter'])
})

gulp.task('watch-integration-tests', function () {
  gulp.watch([].concat(globs.javascripts, globs.integration_tests, globs.test_support), ['integration-tests'])
})

gulp.task('dist', ['js-bundle', 'static-bundle'])

gulp.task('build', ['dist'], function () {
  var packager = require('electron-packager')
  var opts = {
    dir: electronCtxPath,
    name: 'BridgeFog',
    platform: 'darwin',
    arch: 'x64',
    version: electronVersion,
    out: path.resolve(__dirname, './pkg'),
    icon: path.resolve(__dirname, './static/music-512.icns'),
    'app-bundle-id': 'com.bridgefog.beam',
    'helper-bundle-id': 'com.bridgefog.helper',
    'app-version': require('./package.json').version,
    prune: true,
    protocols: [
      { name: 'com.bridgefog.beam.url', schemes: ['bridgefog'] },
    ],
    // 'version-string': { // windows-only
    //   CompanyName: '',
    //   LegalCopyright: '',
    //   FileDescription: '',
    //   OriginalFilename: '',
    //   FileVersion: '',
    //   ProductVersion: '',
    //   ProductName: '',
    //   InternalName: '',
    // }
  }
  packager(opts, function (err, appPaths) {
    if (err) {
      console.error('BUILD ERROR:', err.stack)
      return
    }

    console.log('BUILD COMPLETE:', appPaths)
  })

})
