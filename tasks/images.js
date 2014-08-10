'use strict';

var gulp = require('gulp');
var imageresize = require('gulp-image-resize');
var changed = require('gulp-changed');

gulp.task('images', function() {

    var stream = gulp.src('content/uploads/*.jpg')
        .pipe(changed('site/uploads'))
        .pipe(gulp.dest('site/uploads'))
        .pipe(imageresize({
            width: 688,
            height: 0,
            imageMagick: true
        }))
        .pipe(gulp.dest('site/uploads/thumbnails'));

    return stream;
});
