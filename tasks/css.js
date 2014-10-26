'use strict';

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var uncss = require('gulp-uncss');
var minifycss = require('gulp-minify-css');
var tap = require('gulp-tap');
var glob = require('glob');
var rework = require('gulp-rework');
var css_files = require('./settings.json').css_files;
var concat = require('gulp-concat');
var calc = require('rework-calc');
var media = require('rework-custom-media');
var npm = require('rework-npm');
var vars = require('rework-vars');
var colors = require('rework-plugin-colors');
var argv = require('argh').argv;

gulp.task('css', (argv.dev ? [] : ['html']), function (cb) {

    var stream = gulp.src(css_files)
        .pipe(rework(
            npm(),
            vars(),
            media(),
            calc,
            colors()
        ))
        .pipe(autoprefixer('> 1%', 'last 2 versions'))
        .pipe(concat("site.css"))
        .pipe(gulp.dest('site/assets'))
        .pipe(tap(function(){

            if(argv.dev) {

                cb();
            }
            else {

                var ignore = [
                    /\.token.*/,
                    /\.style.*/,
                    /\.namespace.*/,
                    /code\[class\*\=\"language\-\"\]/,
                    /pre\[class\*="language-"\]/
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
            }
        }));
});
