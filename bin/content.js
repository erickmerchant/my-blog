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

        content = "---\ntitle: \"" + title + "\"\n---";

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

        var new_file;
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

            if (moment(parts[0], date_formats).isValid()) {

                date = moment(parts[0], date_formats);

                slug = parts.slice(1).join('.');
            }
        }

        if (options.title) {

            slug = mkslug(options.title).toLowerCase();
        }

        new_file = slug + ext;

        if (options.date) {

            new_file = date.format("YYYY-MM-DD") + '.' + new_file;
        }

        if (options.datetime) {

            new_file = date.format("YYYY-MM-DD-HHmmss") + '.' + new_file;
        }

        new_file = destination + '/' + new_file;

        directory = path.dirname(new_file);

        mkdirp(directory, function (err) {

            if(err) console.error(err);
            else
            {
                fs.rename(file, new_file, function (err) {

                    if(err) console.error(err);
                    else
                    {
                        console.success('%s moved to %s.', file, new_file);
                    }
                });
            }
        });
    });

program.parse(process.argv);
