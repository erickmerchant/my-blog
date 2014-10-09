'use strict';

var gulp = require('gulp');
var argh = require('argh');

var default_task_deps = ['base', 'html', 'icons-append', 'css', 'js', 'images'];

if (!argh.argv.dev) {

    default_task_deps.push('html-minify', 'css-minify', 'images-minify');
}

gulp.task('default', default_task_deps);
