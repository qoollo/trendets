'use strict';

var gulp = require('gulp');
var prettify = require('gulp-jsbeautifier');
var gulpif = require('gulp-if');
var argv = require('yargs').argv;

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

//  for 'data' task
var dataGenerator = require('./server/data-generator');
var TrendetsDb = require('./server/db');
var quotesRetriever = require('./server/quotes-retriever');
require('date-utils');
var q = require('q');
//var DbMigrator = require('./server/db-migrator/db-migrator.js');

//  for 'develop' task
var browserSync = require('browser-sync');
var open = require('open');
var settings = require('./server/settings');

settings.debug = true;

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
                      .pipe(gulpif(settings.debug, prettify(), uglify()))
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
    return gulp.src('./web/scss/*.scss')
               .pipe(sass({ onError: function (e) { console.log(e); } }))
               .pipe(autoprefixer("last 2 versions", "> 1%", "ie 8"))
               .pipe(prettify())
               .pipe(gulp.dest('./dist/css/'))
               .pipe(browserSync.reload({ stream: true }));
});

gulp.task('html', function () {
    var sources = gulp.src(['css/*.css', 'js/' + getVersion() + '.*.js'], { read: false, cwd: './dist' });

    return gulp.src('web/index.html')
               .pipe(inject(sources, { addRootSlash: false }))
               .pipe(prettify())
               .pipe(gulp.dest('dist/'))
               .pipe(browserSync.reload({ stream: true }));
});

gulp.task('img', function () {
    return gulp.src('./web/img/*')
               .pipe(gulp.dest('./dist/img/'))
               .pipe(browserSync.reload({ stream: true }));
});

gulp.task('data', function () {
    var db = new TrendetsDb(),
        startPromise = db.exists() ? 'ok' : db.create();
    //db.delete();
    return q(startPromise).then(db.connect)
                          .then(function () {
                              return db.Quotes.all();
                          })
                          .then(function (quotes) {
                              var lastQuote = quotes.sort(function (a, b) { return b.date - a.date })[0];
                              return lastQuote;
                          })
                          .then(function (lastQuote) {
                              var from = lastQuote ? lastQuote.date.addDays(1).clearTime() : new Date(2014, 0, 1),
                                  to = Date.today();
                              if (from < to) {
                                  console.log('Requesting quotes from', from, 'to', to);
                                  return quotesRetriever.getQuotes(from, to)
                              } else {
                                  console.log('Quotes are up to date');
                                  return []
                              }
                          })
                          .then(function (newQuotes) {
                              var promises = [];
                              if (newQuotes.length > 0)
                                  console.log(newQuotes.length + ' Quotes received.');
                              for (var i = 0; i < newQuotes.length; i++) {
                                  promises.push(db.Quotes.create(newQuotes[i]));
                              }
                              return q.all(promises).then(function () {
                                  console.log(newQuotes.length + ' Quotes inserted into db.');
                              }, console.error);
                          })
                          .then(function () {
                              console.log('Generating data file.');
                              return dataGenerator.generate('./web/js/data.js', true);
                          }, console.error);
});

gulp.task('create-migration', function () {
    var migrator = new TrendetsDb().getMigrator();
    migrator.createMigration(argv.name);
});

gulp.task('develop', ['html', 'javascript', 'css', 'img', 'data'], function () {
    browserSync({
        server: {
            baseDir: './dist'
        }
    }, function (err, bs) {
        if (err)
            console.error(err);
        else {
            require('./server/server');
            open('http://localhost:' + settings.port + '/admin');
        }
    });

    gulp.watch(['./web/*.html'], [
      'html'
    ]);
    gulp.watch(['./web/img/*'], [
      'img'
    ]);
    gulp.watch(['./web/scss/*.scss', './web/scss/**/*.scss'], [
      'css'
    ]);
    gulp.watch(['./web/js/*.js', './web/js/**/*.js'], [
      'javascript'
    ]);
    //  doesn't work - does not refresh required data-generator
    //gulp.watch(['./server/data-generator.js'], [
    //  'data'
    //]);

});

gulp.task('release', ['_set-release-mode', 'html', 'javascript', 'css', 'data']);

gulp.task('_set-release-mode', function () {
    settings.debug = false;
});