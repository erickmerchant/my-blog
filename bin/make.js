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
var Promise = require('es6-promise').Promise;

var file;
var format;
var ext = 'md';
var content;

if (!args[0]) {

    console.error(chalk.red('You must provide a title.'));

    return Promise.reject(false);
}

return new Promise(function(resolve, reject){

    file = mkslug(args[0]).toLowerCase();

    if (argv.date) {

        file = moment().format("YYYY-MM-DD") + '.' + file;
    }

    if (argv.datetime) {

        file = moment().format("YYYY-MM-DD-HHmmss") + '.' + file;
    }

    if (argv.ext) {

        ext = argv.ext;
    }

    file = file + '.' + ext;

    if (argv.in ) {

        file = trimmer(argv.in , '/') + '/' + file;
    }

    content = "---\ntitle: \"" + args[0] + "\"\n---";

    var directory = path.dirname(file);

    mkdirp(directory, function (err) {

        if (err) throw err;

        fs.writeFile(file, content, function (err) {

            if (err) throw err;

            console.log(chalk.green(file + ' saved.'));

            resolve();
        });
    });
});
