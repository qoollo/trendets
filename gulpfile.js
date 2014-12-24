'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

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