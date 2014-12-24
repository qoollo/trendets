'use strict';

var gulp = require('gulp');

//  for 'javascript' task
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

//  for 'css' task
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('default', function () {
    // place code for your default task here
});

gulp.task('javascript', function () {

    var bundler = browserify({
        entries: ['./web/js/main.js'],
        debug: true
    });

    var bundle = function () {
        return bundler
          .bundle()
          .pipe(source(getBundleName() + '.js'))
          .pipe(buffer())
          .pipe(sourcemaps.init({ loadMaps: true }))
            // Add transformation tasks to the pipeline here.
            .pipe(uglify())
          .pipe(sourcemaps.write('./'))
          .pipe(gulp.dest('./dist/js/'));
    };

    return bundle();
});

var getBundleName = function () {
    var version = require('./package.json').version;
    var name = require('./package.json').name;
    return version + '.' + name + '.' + 'min';
};

gulp.task('css', function () {
    gulp.src('web/scss/*.scss')
        .pipe(sass({ onError: function (e) { console.log(e); } }))
        .pipe(autoprefixer("last 2 versions", "> 1%", "ie 8"))
        .pipe(gulp.dest('dist/css/'))
        //.pipe(refresh(lrserver));
});

gulp.task('html', function () {
    gulp.src('web/index.html')
        .pipe(gulp.dest('dist/'));
});

gulp.task('watch', ['html', 'javascript', 'css'], function () {
    gulp.watch(['web/*.html', 'web/**/*.js'], [
      'html'
    ]);
    gulp.watch(['web/scss/*.scss', 'web/scss/**/*.scss'], [
      'css'
    ]);
    gulp.watch(['web/js/*.js', 'web/js/**/*.js'], [
      'javascript'
    ]);
});