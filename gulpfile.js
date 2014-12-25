'use strict';

var gulp = require('gulp');

//  for 'javascript' task
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');

//  for 'css' task
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

//  for 'html' task
var inject = require("gulp-inject");

gulp.task('default', function () {
    // place code for your default task here
});

gulp.task('javascript', function () {

    var bundler = browserify({
        entries: ['./web/js/main.js'],
        debug: true
    });

    var bundle = function (src, name) {
        return browserify('./web/js/main.js')
                      .bundle()
                      .pipe(source(getVersion() + '.' + getName() + '.min.js'))
                      .pipe(buffer())
                      //.pipe(sourcemaps.init({ loadMaps: true }))
                      //  // Add transformation tasks to the pipeline here.
                      //  .pipe(uglify())
                      //.pipe(sourcemaps.write('./'))
                      .pipe(gulp.dest('./dist/js/'));
    };

    var namePart = getVersion() + '.' + getName(),
        bundleName = namePart + '.min.js',
        libsBundleName = namePart + 'libs.min.js'

    //gulp.src(['web/js/libs/require.js'])
    //    .pipe(concat(libsBundleName))
    //    .pipe(gulp.dest('./dist/js/'));

    return bundle(bundleName);
});

var getVersion = function () {
    return require('./package.json').version;
}

var getName = function () {
    return require('./package.json').name;
}

gulp.task('css', function () {
    gulp.src('web/scss/*.scss')
        .pipe(sass({ onError: function (e) { console.log(e); } }))
        .pipe(autoprefixer("last 2 versions", "> 1%", "ie 8"))
        .pipe(gulp.dest('dist/css/'))
    //.pipe(refresh(lrserver));
});

gulp.task('html', function () {
    var sources = gulp.src(['css/*.css', 'js/' + getVersion() + '.*.js'], { read: false, cwd: 'dist' });

    return gulp.src('web/index.html')
               .pipe(inject(sources, { addRootSlash: false }))
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