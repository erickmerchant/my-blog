'use strict';

var gulp = require('gulp');
var argh = require('argh');

var default_task_deps = ['base', 'scss', 'images', 'js', 'geomicons', 'site'];

if (!argh.argv.dev) {

    default_task_deps.push('uncss', 'htmlmin');
}

gulp.task('default', default_task_deps);
