'use strict';

var gulp = require('gulp');
var argh = require('argh');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('js', function() {

    var stream = gulp.src([
        'assets/js/prism.js',
        'assets/js/turbolinks.min.js',
        'assets/js/geomicons.min.js',
        'assets/js/ender.min.js',
        'assets/js/site.js'
    ])
        .pipe(concat("site.js"));

    if (!argh.argv.dev) {

        stream.pipe(uglify({
            preserveComments: 'some'
        }))
    }

    stream.pipe(gulp.dest('site/assets'));

    return stream;
});
