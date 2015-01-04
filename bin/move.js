'use strict';

var argv = require('argh').argv;
var args = argv.argv;
var chalk = require('chalk');
var moment = require('moment');
var mkslug = require('slug');
var fs = require('fs');
var trimmer = require('trimmer');
var mkdirp = require('mkdirp');
var path = require('path');
var date_formats = ["YYYY-MM-DD", "YYYY-MM-DD-HHmmss"];
var Promise = require('es6-promise').Promise;

var file;
var newFile;
var ext;
var parts;
var slug;
var date;
var format;
var destination;
var directory;

if (!args[0]) {

    console.error(chalk.red(
        'You must provide a file to move.'));

    return Promise.reject(false);
}

return new Promise(function(resolve, reject){

    file = trimmer(args[0], '/');

    ext = path.extname(file);

    parts = path.basename(file, ext).split('.');

    slug = path.basename(file, ext);

    date = moment();

    if (parts.length >= 2) {

        if (moment(parts[0], date_formats).isValid()) {

            date = moment(parts[0], date_formats);

            slug = parts.slice(1).join('.');
        }
    }

    if (argv.title) {

        slug = mkslug(argv.title).toLowerCase();
    }

    newFile = slug + ext;

    if (argv.date) {

        newFile = date.format("YYYY-MM-DD") + '.' + newFile;
    }

    if (argv.datetime) {

        newFile = date.format("YYYY-MM-DD-HHmmss") + '.' + newFile;
    }

    destination = args[1] ? trimmer(args[1], '/') : trimmer(path.dirname(file), '/');

    newFile = destination + '/' + newFile;

    directory = path.dirname(newFile);

    mkdirp(directory, function (err) {

        if (err) throw err;

        fs.rename(file, newFile, function (err) {

            if (err) throw err;

            console.log(chalk.green(file + ' moved to ' + newFile +
                '.'));

            resolve(true);
        });
    });
});
