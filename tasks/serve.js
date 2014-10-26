'use strict';

var gulp = require('gulp');
var node_static = require('node-static');
var chalk = require('chalk');
var moment = require('moment');
var fs = require('fs');
var build_directory = require('./settings.json').build_directory;

gulp.task('serve', function () {

    var server = new node_static.Server(build_directory);

    require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            server.serve(request, response, function (err, result) {

                var color;
                var status;
                var end = true;

                if (err) {

                    if (err.status === 404 && fs.existsSync(
                        build_directory + '404.html')) {

                        end = false;

                        server.serveFile('404.html', 404, {},
                            request, response);

                    } else {
                        response.writeHead(err.status, err.headers);
                    }

                    status = err.status;

                } else {
                    status = response.statusCode;
                }

                switch (true) {
                case status >= 500:
                    color = chalk.red;
                    break;
                case status >= 400:
                    color = chalk.yellow;
                    break;
                case status >= 300:
                    color = chalk.cyan;
                    break;
                case status >= 200:
                    color = chalk.green;
                    break;
                case status >= 100:
                    color = chalk.magenta;
                    break;
                }

                console.log('[' + chalk.gray(moment().format(
                        'HH:mm:ss')) + '] [' + color(status) +
                    '] ' + color(request.url));

                if (end) {

                    response.end();
                }
            });

        }).resume();

    }).listen(8080);
});
