'use strict';

var gulp = require('gulp');
var argh = require('argh');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var scss_files = require('./settings.json').scss_files;
var gulp = require('gulp');
var uncss = require('gulp-uncss');
var minifycss = require('gulp-minify-css');
var tap = require('gulp-tap');
var glob = require('glob');

gulp.task('css', function () {

    var outputStyle = argh.argv.dev ? 'nested' : 'compressed';

    var stream = gulp.src(scss_files)
        .pipe(sass({
            outputStyle: outputStyle
        }))
        .pipe(autoprefixer('> 1%', 'last 2 versions'))
        .pipe(gulp.dest('site/assets'));

    return stream;
});

gulp.task('css-prod', ['css', 'html-prod'], function (cb) {

    var ignore = [
        /\.token.*/,
        /\.style.*/,
        /\.namespace.*/
    ];

    glob('site/**/**.html', function (err, files) {

        gulp.src('site/assets/site.css')
            .pipe(uncss({
                html: files,
                ignore: ignore
            }))
            .pipe(minifycss())
            .pipe(gulp.dest('site/assets'))
            .pipe(tap(function () {
                cb();
            }));
    });

});
