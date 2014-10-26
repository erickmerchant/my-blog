'use strict';

var gulp = require('gulp');
var argh = require('argh');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var js_files = require('./settings.json').js_files;
var build_directory = require('./settings.json').build_directory;

gulp.task('js', function() {

    var stream = gulp.src(js_files)
        .pipe(concat("index.js"));

    if (!argh.argv.dev) {

        stream.pipe(uglify({
            preserveComments: 'some'
        }))
    }

    stream.pipe(gulp.dest(build_directory));

    return stream;
});
