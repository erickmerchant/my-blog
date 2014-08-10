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
var date_formats = ["YYYY-MM-DD", "YYYY-MM-DD-X"];

gulp.task('move', function (cb) {

    var file;

    var newFile = '';

    var ext;

    var parts;

    var slug;

    var date;

    var format

    if (!argh.argv.file || !argh.argv.to) {

        console.error(chalk.red(
            'You must provide a file to move and where to move it to.'));

        cb();

        return;
    }

    file = trimmer(argh.argv.file, '/');

    ext = path.extname(file);

    parts = path.basename(file, ext).split('.');

    slug = path.basename(file, ext);

    if (parts.length >= 2) {

        if (moment(parts[0], date_formats).isValid()) {

            date = parts[0];

            slug = parts.slice(1).join('.');
        }
    }

    if (argh.argv.date) {

        format = argh.argv.date;

        if (format === true) {

            format = "YYYY-MM-DD";
        }

        if (!date) {

            date = moment().format(format);
        } else {

            date = moment(date).format(format);
        }
    }

    if (argh.argv.date === false && date) {

        date = false;
    }

    if (date) {

        newFile = date + '.';
    }

    if (argh.argv.title) {

        slug = slug(argh.argv.title).toLowerCase();
    }

    newFile = newFile + slug + ext;

    newFile = trimmer(argh.argv.to, '/') + '/' + newFile;

    var directory = path.dirname(newFile);

    mkdirp(directory, function (err) {

        if (err) throw err;

        fs.rename(file, newFile, function (err) {

            if (err) throw err;

            console.log(chalk.green(file + ' moved to ' + newFile +
                '.'));

            cb();
        });
    });
});
