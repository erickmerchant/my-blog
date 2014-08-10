'use strict';

var gulp = require('gulp');
var argh = require('argh');
var chalk = require('chalk');
var moment = require('moment');
var slug = require('slug');
var fs = require('fs');
var trimmer = require('trimmer');
var mkdirp = require('mkdirp');
var path = require('path');

gulp.task('make', function (cb) {

    var file;
    var format;
    var ext = 'md';
    var content;

    if (!argh.argv.title) {

        console.error(chalk.red('You must provide a title.'));

        cb();

        return;
    }

    file = slug(argh.argv.title).toLowerCase();

    if (argh.argv.date) {

        format = argh.argv.date;

        if (format === true) {

            format = "YYYY-MM-DD";
        }

        file = moment().format(format) + '.' + file;
    }

    if (argh.argv.ext) {

        ext = argh.argv.ext;
    }

    file = file + '.' + ext;

    if (argh.argv. in ) {

        file = trimmer(argh.argv. in , '/') + '/' + file;
    }

    content = "---\ntitle: \"" + argh.argv.title + "\"\n---";

    var directory = path.dirname(file);

    mkdirp(directory, function (err) {

        if (err) throw err;

        fs.writeFile(file, content, function (err) {

            if (err) throw err;

            console.log(chalk.green(file + ' saved.'));

            cb();
        });
    });
});
