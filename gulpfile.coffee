gulp     = require 'gulp'
eslint   = require 'gulp-eslint'
plumber  = require 'gulp-plumber'
mocha    = require 'gulp-mocha'
gutil    = require 'gulp-util'
istanbul = require 'gulp-istanbul'

files =
  src:  './src/*.js'
  spec: './test/*.js'

gulp.task 'lint', ->
  gulp.src files.src
    .pipe plumber()
    .pipe eslint()
    .pipe eslint.format()
    .pipe eslint.failAfterError()

gulp.task 'test', ->
  gulp.src files.spec
    .pipe plumber()
    .pipe mocha({ reporter: 'list' })
    .on('error', gutil.log)

gulp.task 'pre-coverage', ->
  gulp.src files.src
    .pipe plumber()
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())

gulp.task 'coverage', ['pre-coverage'], ->
  gulp.src files.spec
    .pipe plumber()
    .pipe(mocha({reporter: "xunit-file", timeout: "5000"}))
    .pipe(istanbul.writeReports('coverage'))
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 60 } }))

gulp.task 'watch', ->
  gulp.watch files.src, ['test', 'lint']
  gulp.watch files.spec, ['test']
