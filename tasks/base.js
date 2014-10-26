'use strict';

var gulp = require('gulp');
var build_directory = require('./settings.json').build_directory;

gulp.task('base', function () {

    var stream = gulp.src('base/**').pipe(gulp.dest(build_directory));

    return stream;
});
