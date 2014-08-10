'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var cleanhtml = require('gulp-cleanhtml');
var footer = require('gulp-footer');
var header = require('gulp-header');

gulp.task('geomicons', function () {

    var stream = gulp.src('assets/geomicons/enabled/*.svg')
        .pipe(concat('geomicons.svg'))
        .pipe(header('<svg xmlns="http://www.w3.org/2000/svg">'))
        .pipe(footer('</svg>'))
        .pipe(cleanhtml())
        .pipe(gulp.dest('site/assets'));

    return stream;
});
