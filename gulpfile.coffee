gulp     = require 'gulp'
eslint   = require 'gulp-eslint'
plumber  = require 'gulp-plumber'
mocha    = require 'gulp-mocha'
gutil    = require 'gulp-util'

files =
  src:  './src/*.js'
  spec: './test/*.js'

gulp.task 'lint', ->
  gulp.src files.src
    .pipe plumber()
    .pipe eslint()
    .pipe eslint.format()
    .pipe eslint.failAfterError()

gulp.task 'mocha', ->
  gulp.src files.spec
    .pipe plumber()
    .pipe mocha({ reporter: 'list' })
    .on('error', gutil.log)

gulp.task 'watch', ->
  gulp.watch files.src, ['mocha', 'lint']
  gulp.watch files.spec, ['mocha']
