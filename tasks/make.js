'use strict';

var gulp = require('gulp');
var argv = require('argh').argv;
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

    if (!argv.title) {

        console.error(chalk.red('You must provide a title.'));

        cb();

        return;
    }

    file = slug(argv.title).toLowerCase();

    if (argv.date) {

        format = argv.date;

        if (format === true) {

            format = "YYYY-MM-DD";
        }

        file = moment().format(format) + '.' + file;
    }

    if (argv.ext) {

        ext = argv.ext;
    }

    file = file + '.' + ext;

    if (argv. in ) {

        file = trimmer(argv. in , '/') + '/' + file;
    }

    content = "---\ntitle: \"" + argv.title + "\"\n---";

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
