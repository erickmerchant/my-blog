'use strict';

var gulp = require('gulp');
var imageresize = require('gulp-image-resize');
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
var argv = require('argh').argv;
var merge = require('merge-stream');
var build_directory = require('./settings.json').build_directory;

gulp.task('images', function () {

    var uploads = gulp.src('content/uploads/*.jpg')
        .pipe(changed(build_directory + 'uploads'));

    if(!argv.dev) {

        uploads = uploads.pipe(imagemin({
            progressive: true
        }));
    }

    uploads.pipe(gulp.dest(build_directory + 'uploads'));

    var thumbnails = gulp.src('content/uploads/*.jpg')
        .pipe(changed(build_directory + 'uploads'))
        .pipe(imageresize({
            width: 608,
            height: 0,
            imageMagick: true
        }));

    if(!argv.dev) {

        thumbnails = thumbnails.pipe(imagemin({
            progressive: true
        }));
    }

    thumbnails.pipe(gulp.dest(build_directory + 'uploads/thumbnails'));

    return merge(uploads, thumbnails);
});
