'use strict';

var gulp = require('gulp');
var cheerio = require('gulp-cheerio');
var cleanhtml = require('gulp-cleanhtml');
var concat = require('gulp-concat');
var footer = require('gulp-footer');
var header = require('gulp-header');

gulp.task('geomicons', function () {

  var stream = gulp.src('assets/geomicons/enabled/*.svg')
    .pipe(cheerio({
      run: function($) {
        var $path = $('svg').children('path');
        var id = $('svg').attr('id');
        $path.attr('id', id);
        $('svg').replaceWith($path[0]);
      }
    }))
    .pipe(concat('geomicons-defs.svg'))
    .pipe(header('<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>'))
    .pipe(footer('</defs></svg>'))
    .pipe(cleanhtml())
    .pipe(gulp.dest('site/assets'));

    return stream;
});
