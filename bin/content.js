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
var cson = require('cson-parser');
var dateFormats = ["YYYY-MM-DD", "YYYY-MM-DD-HHmmss"];

var orig = console.error;

console.error = function(error) {

    var args = [].slice.call(arguments);

    if(error) {

        args[0] = chalk.red(error);
    }

    orig.apply(undefined, args);
}

console.success = function(message) {

    var args = [].slice.call(arguments);

    if(message) {

        args[0] = chalk.green(message);
    }

    console.log.apply(undefined, args);
}

program
    .command('make <title>')
    .description('Make new content.')
    .option('--date', 'prepend the date YYYY-MM-DD')
    .option('--datetime', 'prepend the datetime YYYY-MM-DD-HHmmss')
    .option('--ext [ext]', 'file extension to use [md]', 'md')
    .option('--target <target>', 'target directory')
    .action(function(title, options) {

        var file;
        var content;

        file = mkslug(title).toLowerCase();

        if (options.date) {

            file = moment().format("YYYY-MM-DD") + '.' + file;
        }

        if (options.datetime) {

            file = moment().format("YYYY-MM-DD-HHmmss") + '.' + file;
        }

        file = file + '.' + options.ext;

        if (options.target ) {

            file = trimmer(options.target, '/') + '/' + file;
        }

        content = ["---", cson.stringify({title: title}, null, "  "), '---', ''].join("\n");

        var directory = path.dirname(file);

        mkdirp(directory, function (err) {

            if(err) console.error(err);
            else
            {
                fs.writeFile(file, content, function (err) {

                    if(err) console.error(err);
                    else
                    {
                        console.success('%s saved.', file);
                    }
                });
            }
        });
    });

program
    .command('move <file> <target>')
    .description('Move content')
    .option('--title', 'change the title')
    .option('--date', 'prepend the date YYYY-MM-DD')
    .option('--datetime', 'prepend the datetime YYYY-MM-DD-HHmmss')
    .action(function(file, target, options) {

        var newFile;
        var ext;
        var parts;
        var slug;
        var date;
        var destination;
        var directory;

        file = trimmer(file, '/');

        destination = target ? trimmer(target, '/') : trimmer(path.dirname(file), '/');

        ext = path.extname(file);

        parts = path.basename(file, ext).split('.');

        slug = path.basename(file, ext);

        date = moment();

        if (parts.length >= 2) {

            if (moment(parts[0], dateFormats).isValid()) {

                date = moment(parts[0], dateFormats);

                slug = parts.slice(1).join('.');
            }
        }

        if (options.title) {

            slug = mkslug(options.title).toLowerCase();
        }

        newFile = slug + ext;

        if (options.date) {

            newFile = date.format("YYYY-MM-DD") + '.' + newFile;
        }

        if (options.datetime) {

            newFile = date.format("YYYY-MM-DD-HHmmss") + '.' + newFile;
        }

        newFile = destination + '/' + newFile;

        directory = path.dirname(newFile);

        mkdirp(directory, function (err) {

            if(err) console.error(err);
            else
            {
                fs.rename(file, newFile, function (err) {

                    if(err) console.error(err);
                    else
                    {
                        console.success('%s moved to %s.', file, newFile);
                    }
                });
            }
        });
    });

program.parse(process.argv);
