'use strict';

var gulp = require('gulp');

gulp.task('base', function () {

    var stream = gulp.src('base/**').pipe(gulp.dest('site'));

    return stream;
});
