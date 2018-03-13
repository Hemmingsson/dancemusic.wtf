// utils
var gulp = require('gulp')
var browserSync = require('browser-sync').create()
var gutil = require('gulp-util')
var rename = require('gulp-rename')
var del = require('del')

// css
var sass = require('gulp-sass')
var cssnano = require('cssnano')
var autoprefixer = require('autoprefixer')

// browserify
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var uglify = require('gulp-uglify')

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
gulp.task('html', function () {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream())
})

// Copying fonts
gulp.task('sounds', function () {
  return gulp.src('src/sounds/**/*')
    .pipe(gulp.dest('dist/sounds'))
})

// Cleaning

gulp.task('clean:dist', function () {
  return del.sync(['dist/**/*'])
})

gulp.task('default', ['clean:dist', 'html', 'sass', 'js', 'fonts', 'sounds', 'images'], function () {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  })
  gulp.watch('./src/*.html', ['html'])
  gulp.watch('./src/scss/**/*.scss', ['sass'])
  gulp.watch('./src/js/*.js', ['js'])
})

gulp.task('sass', function () {
  var plugins = [autoprefixer({browsers: ['last 2 versions']}), cssnano()]
  return gulp.src('./src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream())
})

gulp.task('js', function () {
  browserify({
    entries: './src/js/main.js',
    debug: true
  })
    .on('error', gutil.log)
    .bundle()
    .on('error', gutil.log)
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream())
})
