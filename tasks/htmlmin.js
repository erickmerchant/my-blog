'use strict';

var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');

gulp.task('htmlmin', ['site'], function() {

    var stream = gulp.src('site/**/**.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('site'));

    return stream;
});
