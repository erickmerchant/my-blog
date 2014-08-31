'use strict';

var gulp = require('gulp');
var argh = require('argh');

var default_task_deps = ['base', 'html', 'icons', 'css', 'js', 'images'];

if (!argh.argv.dev) {

    default_task_deps.push('html-prod', 'css-prod');
}

gulp.task('default', default_task_deps);
