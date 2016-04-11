'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('gulp-browserify');
var autoprefixer = require('gulp-autoprefixer');
var gutil = require('gulp-util');
var debug = require('gulp-debug');
var concat = require('gulp-concat');
var browserSync = require('browser-sync');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');


//var sourcemaps = require('gulp-sourcemaps');
//var del = require('del');

//var superstatic = require('superstatic');
//var postcss = require('gulp-postcss');
//var source = require('vinyl-source-stream');
//var globby = require('globby');
//var through = require('through2');
//var reactify = require('reactify');

// Load config
var Config = require('./gulpfile.config');
var config = new Config();

/*
 * Browserifies the app javascript
 */

gulp.task('browserify-js-app', function () {
    process.stdout.write('browserify-js...\n');
    return gulp.src(config.sourceJavaScript, {read: false})
            .pipe(browserify({
                insertGlobals: true,
                debug: true
            }))
            .pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
            .pipe(uglify()) // now gulp-uglify works 
            .pipe(rename('javascript.js'))
            .pipe(gulp.dest('./public_html/assets/javascript/'));
});

/*
 * Browserifies the libraries
 */

gulp.task('browserify-js-lib', function () {
    process.stdout.write('browserify-js...\n');
    return gulp.src(config.sourceJavaScriptLib, {read: false})
            .pipe(browserify({
                insertGlobals: true,
                debug: true
            }))
            .pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
            //.pipe(uglify()) // now gulp-uglify works 
            .pipe(rename('lib.js'))
            .pipe(gulp.dest('./public_html/assets/javascript/'));
});

/*
 * static server - serves during dev-development
 */

gulp.task('serve', ['browserify-js-lib', 'sass-compile', 'concat-js'], function () {
    process.stdout.write('Starting browserSync and superstatic...\n');
    browserSync({
        port: 3000,
        ui: false,
        socket: {
            domain: 'http://localhost:3000'
        },
        https: false,
        files: ['public_html/index.html',
            config.destJavaScriptAll,
            config.destCssAll],
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'angular',
        notify: true,
        reloadDelay: 0,
        server: {
            baseDir: './public_html/',
            index: "index.html",
            directory: false
        }
    });

    gulp.watch(config.sourceHTMLAll).on('change', browserSync.reload);
    gulp.watch(config.sourceJavaScriptAll, ['concat-js']).on('change', browserSync.reload);
    gulp.watch([config.sourceSassAll], ['sass-compile']);
});

gulp.task('concat-js', function () {
    process.stdout.write('concat-js...\n');
    return gulp.src(config.sourceJavaScriptAllNoIndex)
            .pipe(concat('javascript.js'))
            .pipe(gulp.dest(config.destJavaScript, {
                basename: 'javascript',
                ext: 'js'
            }));
});

/*
 * Sass compile
 */

gulp.task('sass-compile', function () {
    return gulp.src(config.sourceSassAll)
            .pipe(sass())
            .pipe(autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false
            })).pipe(gulp.dest(config.destCss))
            .pipe(browserSync.stream());
});

// Watch task
gulp.task('watch', function () {
    process.stdout.write('Starting watching...\n');
    gulp.watch([config.sourceTypeScriptAll], ['typeScript-lint', 'typeScript-compile']);
    gulp.watch([config.sourceSassAll], ['sass-compile']);
    gulp.watch([config.sourceJavaScriptAll], ['concat-js']);

});

// Dignostics
gulp.task('config', function () {

    gutil.log('Gulp is running!');

    gutil.log('config.rootFolder = ' + config.rootFolder);
    gutil.log('config.destFolder = ' + config.destFolder);

    gutil.log('config.sourceHTMLAll = ' + config.sourceHTMLAll);

    gutil.log('config.sourceJavaScript = ' + config.sourceJavaScript);
    gutil.log('config.sourceJavaScriptAll = ' + config.sourceJavaScriptAll);

    gutil.log('config.destJavaScript = ' + config.destJavaScript);
    gutil.log('config.destJavaScriptFile = ' + config.destJavaScriptFile);
    gutil.log('config.destJavaScriptAll = ' + config.destJavaScriptAll);

    gutil.log('config.sourceTypeScript = ' + config.sourceTypeScript);
    gutil.log('config.sourceTypeScriptAll = ' + config.sourceTypeScriptAll);

    gutil.log('config.destTypeScript = ' + config.destTypeScript);
    gutil.log('config.destTypeScriptAll = ' + config.destTypeScriptAll);
    gutil.log('config.destTypeScriptMapAll = ' + config.destTypeScriptMapAll);

    gutil.log('config.sourceSass = ' + config.sourceSass);
    gutil.log('config.sourceSassAll = ' + config.sourceSassAll);

    gutil.log('config.destCss = ' + config.destCss);
    gutil.log('config.destCssFile = ' + config.destCssFile);
    gutil.log('config.destCssAll = ' + config.destCssAll);

    gutil.log('config.typings = ' + config.typings);
    gutil.log('config.libraryTypeScriptDefinitions = ' + config.libraryTypeScriptDefinitions);

});


// Default task
gulp.task('default', ['concat-js', 'sass-compile']);