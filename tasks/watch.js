'use strict';

var gulp = require('gulp');
var argh = require('argh');

gulp.task('watch', ['default'], function () {

    gulp.watch('base/**', ['base']);
    gulp.watch('content/uploads/*.jpg', ['images']);
    gulp.watch('assets/js/**/**.js', ['js']);
    gulp.watch('assets/geomicons/**/**.svg', ['geomicons-append']);

    if (!argh.argv.dev) {

        gulp.watch('assets/scss/**/**.scss', ['scss', 'uncss']);
        gulp.watch('templates/**/**.html', ['site', 'htmlmin', 'uncss']);
        gulp.watch('content/**', ['site', 'htmlmin', 'uncss']);

    } else {

        gulp.watch('assets/scss/**/**.scss', ['scss']);
        gulp.watch('templates/**/**.html', ['site']);
        gulp.watch('content/**', ['site']);
    }
});
