'use strict';

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var uncss = require('gulp-uncss');
var minifycss = require('gulp-minify-css');
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
var stream_to_promise = require('stream-to-promise');
var build_directory = require('./settings.json').build_directory;

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
        .pipe(concat("index.css"))
        .pipe(gulp.dest(build_directory));

    stream_to_promise(stream).then(function(){

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

            glob(build_directory + '**/**.html', function (err, files) {

                var stream = gulp.src(build_directory + 'index.css')
                    .pipe(uncss({
                        html: files,
                        ignore: ignore
                    }))
                    .pipe(minifycss())
                    .pipe(gulp.dest(build_directory));

                stream_to_promise(stream).then(function() { cb(); });
            });
        }
    });
});
