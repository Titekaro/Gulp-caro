"use strict";

var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    babel = require('gulp-babel'),
    cache = require('gulp-cached'),
    cssmin = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    gulpif = require('gulp-if'),
    jshint = require('gulp-jshint'),
    livereload = require('gulp-livereload'),
    modernizr = require('gulp-modernizr'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    sass = require('gulp-ruby-sass'),
    uglify = require('gulp-uglify'),
    notifier = require('node-notifier');

var env = process.env.NODE_ENV || 'dev';


/* STYLES */

gulp.task('styles', function(){
  return sass('dev/styles/**/*.sass')
    .on('error', sass.logError)
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(autoprefixer({
      browser: 'last 2 versions',
      remove: false
    }))
    .pipe(gulpif(
      env === 'dev',
      gulp.dest('dev/styles/')
    ))
    .pipe(rename({suffix: '.min'}))
    .pipe(cssmin({debug: true}, function(details) {
        console.log(details.name + ': ' + details.stats.originalSize);
        console.log(details.name + ': ' + details.stats.minifiedSize);
    }))
    .pipe(gulpif(
      env === 'dev',
      gulp.dest('dev/styles/'),
      gulp.dest('dist/styles/')
    ))
    .pipe(livereload())
    .pipe(notify("STYLE task done!"));
});



/* SCRIPTS */

gulp.task('scripts', function(){
  return gulp.src('dev/scripts/**/*.js')
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(cache('linting'))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    //.pipe(babel())
    .pipe(gulpif(
      env === 'dev',
      gulp.dest('dev/scripts/')
    ))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulpif(
      env === 'dev',
      gulp.dest('dev/scripts/'),
      gulp.dest('dist/scripts/')
    ))
    .pipe(livereload())
    .pipe(notify("SCRIPT task done!"));
});

gulp.task('modernizr', function(){
  return gulp.src('dev/scripts/lib/')
    .pipe(modernizr())
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulpif(
      env === 'dev',
      gulp.dest('dev/scripts/lib/'),
      gulp.dest('dist/scripts/lib/')
    ))
    .pipe(livereload())
    .pipe(notify("MODERNIZR task done!"));
});



/* IMAGES */

gulp.task('images', function(){
  gulp.src('dev/images/**/*')
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images/'))
    .pipe(notify("IMAGES task done!"));
});


/* HTML */
gulp.task('html', function() {
  gulp.src('dev/*.html')
    .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
    .pipe(gulp.dest('dist'))
    .pipe(livereload())
    .pipe(notify("HTML task done!"));
});


/* RUN */

gulp.task('default', ['dev']);

gulp.task('dev', ['watch'], function(){
  notifier.notify({
    title: 'Gulp notification',
    message: 'DEV task COMPLETE!'
  });
});

gulp.task('init-build', function () {
  env = 'build';
  console.time('BUILD TIME');
});

gulp.task('build', ['init-build', 'modernizr', 'styles', 'scripts', 'images', 'html'], function(){
  console.timeEnd('BUILD TIME')
  notifier.notify({
    title: 'Gulp notification',
    message: 'BUILD task COMPLETE!'
  });
});

gulp.task('watch', function(){
  livereload.listen();
  gulp.watch("dev/styles/**/*.sass", ['styles']);
  gulp.watch("dev/scripts/**/*.js", ['scripts', 'modernizr']);
  gulp.watch("dev/*.html", ['html']);
});