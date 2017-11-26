var gulp = require('gulp')
var sass = require('gulp-sass')
var browserSync = require('browser-sync')
var useref = require('gulp-useref')
var uglify = require('gulp-uglify')
var gulpIf = require('gulp-if')
var cssnano = require('gulp-cssnano')
var cache = require('gulp-cache')
var del = require('del')
var minifyjs = require('gulp-js-minify')
var runSequence = require('run-sequence')

// Development Tasks
// -----------------

// Start browserSync server
gulp.task('browserSync', function () {
  browserSync({
    server: {
      baseDir: 'src'
    }
  })
})

gulp.task('sass', function () {
  return gulp.src('src/scss/**/*.scss') // Gets all files ending with .scss in src/scss and children dirs
    .pipe(sass().on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
    .pipe(gulp.dest('src/css')) // Outputs it in the css folder
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
    }))
})

// Watchers
gulp.task('watch', function () {
  gulp.watch('src/scss/**/*.scss', ['sass'])
  gulp.watch('src/*.html', browserSync.reload)
  gulp.watch('src/js/**/*.js', browserSync.reload)
})

// Optimization Tasks
// ------------------

// Optimizing CSS and JavaScript
gulp.task('useref', function () {
  return gulp.src('src/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
})

gulp.task('js', function () {
  return gulp.src('src/js/**/*')
    .pipe(gulp.dest('dist/js'))
})

// Copying fonts
gulp.task('fonts', function () {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
})

// Copying fonts
gulp.task('images', function () {
  return gulp.src('src/img/**/*')
    .pipe(gulp.dest('dist/img'))
})

// Copying fonts
gulp.task('sounds', function () {
  return gulp.src('src/sounds/**/*')
    .pipe(gulp.dest('dist/sounds'))
})

// Cleaning
gulp.task('clean', function () {
  return del.sync('dist').then(function (cb) {
    return cache.clearAll(cb)
  })
})

gulp.task('clean:dist', function () {
  return del.sync(['dist/**/*'])
})

// Build Sequences
// ---------------

gulp.task('default', function (callback) {
  runSequence(['sass', 'browserSync'], 'watch',
    callback
  )
})

gulp.task('build', function (callback) {
  runSequence(
    'clean:dist',
    'sass',
    ['useref', 'js', 'fonts', 'sounds', 'images'],
    callback
  )
})
