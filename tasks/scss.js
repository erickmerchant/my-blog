'use strict';

var gulp = require('gulp');
var argh = require('argh');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('scss', function () {

    var outputStyle = argh.argv.dev ? 'nested' : 'compressed';

    var stream = gulp.src('assets/scss/site.scss')
        .pipe(sass({
            outputStyle: outputStyle
        }))
        .pipe(autoprefixer('> 1%', 'last 2 versions'))
        .pipe(gulp.dest('site/assets'));

    return stream;
});
