'use strict';

var gulp = require('gulp');
var prettify = require('gulp-jsbeautifier');

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

//  for 'develop' task
var browserSync = require('browser-sync');

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
                        // Add transformation tasks to the pipeline here.
                      //  .pipe(uglify())
                      //.pipe(sourcemaps.write('./'))
                      .pipe(prettify())
                      .pipe(gulp.dest('./dist/js/'))
                      .pipe(browserSync.reload({ stream: true }));
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
    return gulp.src('web/scss/*.scss')
               .pipe(sass({ onError: function (e) { console.log(e); } }))
               .pipe(autoprefixer("last 2 versions", "> 1%", "ie 8"))
               .pipe(prettify())
               .pipe(gulp.dest('dist/css/'))
               .pipe(browserSync.reload({ stream: true }));
});

gulp.task('html', function () {
    var sources = gulp.src(['css/*.css', 'js/' + getVersion() + '.*.js'], { read: false, cwd: 'dist' });

    return gulp.src('web/index.html')
               .pipe(inject(sources, { addRootSlash: false }))
               .pipe(prettify())
               .pipe(gulp.dest('dist/'))
               .pipe(browserSync.reload({ stream: true }));
});

gulp.task('develop', ['html', 'javascript', 'css'], function () {

    browserSync({
        server: {
            baseDir: './dist'
        }
    });

    gulp.watch(['web/*.html'], [
      'html'
    ]);
    gulp.watch(['web/scss/*.scss', 'web/scss/**/*.scss'], [
      'css'
    ]);
    gulp.watch(['web/js/*.js', 'web/js/**/*.js'], [
      'javascript'
    ]);
});