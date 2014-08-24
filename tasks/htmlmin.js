'use strict';

var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');

gulp.task('htmlmin', ['geomicons-append'], function () {

    var stream = gulp.src('site/**/**.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('site'));

    return stream;
});
