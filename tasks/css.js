'use strict';

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var gulp = require('gulp');
var uncss = require('gulp-uncss');
var minifycss = require('gulp-minify-css');
var tap = require('gulp-tap');
var glob = require('glob');
var basswork = require('gulp-basswork');
var css_files = require('./settings.json').css_files;
var concat = require('gulp-concat');

gulp.task('css', function () {

    var stream = gulp.src(css_files)
        .pipe(basswork())
        .pipe(autoprefixer('> 1%', 'last 2 versions'))
        .pipe(concat("site.css"))
        .pipe(gulp.dest('site/assets'));

    return stream;
});

gulp.task('css-minify', ['css', 'html-minify'], function (cb) {

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
