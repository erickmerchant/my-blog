'use strict';

var gulp = require('gulp');
var argh = require('argh');

gulp.task('watch', ['default'], function () {

    gulp.watch('base/**', ['base']);
    gulp.watch('content/uploads/*.jpg', ['images']);
    gulp.watch('assets/js/**/**.js', ['js']);
    gulp.watch('assets/geomicons/**/**.svg', ['icons']);

    if (!argh.argv.dev) {

        gulp.watch('assets/scss/**/**.scss', ['css-prod']);
        gulp.watch('templates/**/**.html', ['html-prod', 'css-prod']);
        gulp.watch('content/**', ['html-prod', 'css-prod']);

    } else {

        gulp.watch('assets/scss/**/**.scss', ['css']);
        gulp.watch('templates/**/**.html', ['html']);
        gulp.watch('content/**', ['html']);
    }
});
