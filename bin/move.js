#!/usr/bin/env node

'use strict';

var program = require('commander');
var chalk = require('chalk');
var moment = require('moment');
var mkslug = require('slug');
var fs = require('fs');
var trimmer = require('trimmer');
var mkdirp = require('mkdirp');
var path = require('path');
var date_formats = ["YYYY-MM-DD", "YYYY-MM-DD-HHmmss"];
var file;
var newFile;
var ext;
var args
var parts;
var slug;
var date;
var format;
var destination;
var directory;

program
    .usage('[options] <file> <target>')
    .description('Move content')
    .option('--title', 'change the title')
    .option('--date', 'prepend the date YYYY-MM-DD')
    .option('--datetime', 'prepend the datetime YYYY-MM-DD-HHmmss')
    .parse(process.argv);

args = program.args;

if (!args[0]) {

    console.error(chalk.red('You must provide a file to move.'));
}
else {

    file = trimmer(args[0], '/');

    destination = args[1] ? trimmer(args[1], '/') : trimmer(path.dirname(file), '/');

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

    if (program.title) {

        slug = mkslug(program.title).toLowerCase();
    }

    newFile = slug + ext;

    if (program.date) {

        newFile = date.format("YYYY-MM-DD") + '.' + newFile;
    }

    if (program.datetime) {

        newFile = date.format("YYYY-MM-DD-HHmmss") + '.' + newFile;
    }

    newFile = destination + '/' + newFile;

    directory = path.dirname(newFile);

    mkdirp(directory, function (err) {

        if(err) console.log(err);
        else
        {
            fs.rename(file, newFile, function (err) {

                if(err) console.log(err);
                else
                {
                    console.log(chalk.green(file + ' moved to ' + newFile + '.'));
                }
            });
        }
    });
}
