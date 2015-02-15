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
var args;
var file;
var title;
var content;

program
    .usage('[options] <title>')
    .description('Make a new piece of content.')
    .option('--date', 'prepend the date YYYY-MM-DD')
    .option('--datetime', 'prepend the datetime YYYY-MM-DD-HHmmss')
    .option('--ext [ext]', 'file extension to use [md]', 'md')
    .option('--target <target>', 'target directory')
    .parse(process.argv);

args = program.args;

if (!args[0]) {

    console.error(chalk.red('You must provide a title.'));
}
else {

    title = args[0];

    file = mkslug(args[0]).toLowerCase();

    if (program.date) {

        file = moment().format("YYYY-MM-DD") + '.' + file;
    }

    if (program.datetime) {

        file = moment().format("YYYY-MM-DD-HHmmss") + '.' + file;
    }

    file = file + '.' + program.ext;

    if (program.target ) {

        file = trimmer(program.target, '/') + '/' + file;
    }

    content = "---\ntitle: \"" + args[0] + "\"\n---";

    var directory = path.dirname(file);

    mkdirp(directory, function (err) {

        if(err) console.log(err);
        else
        {
            fs.writeFile(file, content, function (err) {

                if(err) console.log(err);
                else
                {
                    console.log(chalk.green(file + ' saved.'));
                }
            });
        }
    });
}
