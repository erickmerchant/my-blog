'use strict';

var gulp = require('gulp');
var uncss = require('gulp-uncss');
var minifycss = require('gulp-minify-css');
var tap = require('gulp-tap');
var glob = require('glob');

gulp.task('uncss', ['htmlmin', 'scss'], function (cb) {

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
