'use strict';

var gulp = require('gulp');
var imageresize = require('gulp-image-resize');
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');

gulp.task('images', function () {

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

gulp.task('images-minify', ['images'], function () {
    return gulp.src('site/uploads/**/**')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('site/uploads'));
});
