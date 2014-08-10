'use strict';

var gulp = require('gulp');
var node_static = require('node-static');
var chalk = require('chalk');
var moment = require('moment');
var fs = require('fs');

gulp.task('serve', function() {

    var server = new node_static.Server('./site/');

    require('http').createServer(function(request, response) {
        request.addListener('end', function() {
            server.serve(request, response, function(err, result) {

                var color;
                var status;
                var end = true;

                if (err) {

                    if (err.status === 404 && fs.existsSync(
                        './site/404.html')) {

                        end = false;

                        server.serveFile('404.html', 404, {},
                            request, response);

                    } else {
                        response.writeHead(err.status, err.headers);
                    }

                    color = err.status < 500 ? chalk.yellow :
                        chalk.red;
                    status = err.status;
                } else {

                    color = chalk.green;
                    status = response.statusCode;
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
