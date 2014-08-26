'use strict';

var gulp = require('gulp');
var cheerio = require('gulp-cheerio');
var cleanhtml = require('gulp-cleanhtml');
var concat = require('gulp-concat');
var footer = require('gulp-footer');
var header = require('gulp-header');
var fs = require('fs');
var Q = require('q');
var icon_files = require('./settings.json').icon_files;

gulp.task('geomicons', function () {

    var stream = gulp.src(icon_files)
        .pipe(cheerio(function ($) {
            var $path = $('svg').children('path');
            var id = $('svg').attr('id');
            $path.attr('id', id);
            $('svg').replaceWith($path[0]);
        }))
        .pipe(concat('geomicons-defs.svg'))
        .pipe(header(
            '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>'
        ))
        .pipe(footer('</defs></svg>'))
        .pipe(cleanhtml())
        .pipe(gulp.dest('site/assets'));

    return stream;
});

gulp.task('geomicons-append', ['geomicons', 'site'], function (cb) {

    var geomicon_deferred = Q.defer();

    fs.readFile('./site/assets/geomicons-defs.svg', {encoding: 'utf-8'}, function (err, data) {

        geomicon_deferred.resolve(data);
    });

    var stream = gulp.src('site/**/**.html').pipe(cheerio(function ($, done) {

        geomicon_deferred.promise.then(function(data){

            $('body').append(data);

            done();
        });
    }))
    .pipe(gulp.dest('site'));

    return stream;
});
