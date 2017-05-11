/**
 * Created by common on 2017/5/11.
 */
var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename');

gulp.task('js', function () {
  return gulp.src(['src/dom7.js'])
    .pipe(gulp.dest('dist'));
});

gulp.task('compress-js', function () {
  return gulp.src(['src/dom7.js'])
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['js', 'compress-js']);