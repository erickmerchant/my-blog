var _ = require('lodash');
var moment = require('moment');
var yaml = require('js-yaml');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var trim = require('trimmer');
var Q = require('q');
var delim = "---\n";

var plugin = function (content) {

    return function (pages, next) {

        var read_promises = [];

        var pages = [];

        var glob_deferred = Q.defer();

        var glob_directory = plugin.content_directory + content;

        glob(glob_directory, {}, function (err, files) {

            _.each(files, function (file, current) {

                var ext = path.extname(file);

                var conv = trim.left(ext, '.');

                var parts;

                var read_deferred = Q.defer();

                var page = {};

                page.slug = path.basename(file, ext);

                read_promises[current] = read_deferred.promise;

                if (_.has(plugin.config.converters, conv)) {

                    parts = path.basename(file, ext).split('.');

                    if (parts.length >= 2) {

                        page.date = moment(parts[0], plugin.config.date_formats);

                        if (page.date && page.date.isValid()) {

                            page.slug = parts.slice(1).join('.');
                        }
                    }

                    if (!(page.date && page.date.isValid())) {

                        page.date = moment();
                    }

                    fs.readFile(file, {
                        encoding: 'utf-8'
                    }, function (err, data) {

                        if (err) throw err;

                        data = data + "\n";

                        data = data.split(delim);

                        page = _.assign(page, yaml.load(data[1]));

                        plugin.config.converters[conv](data.slice(2)
                            .join(delim), function (err, content) {

                                page.content = content;

                                pages[current] = {
                                    page: page
                                };

                                read_deferred.resolve();
                            });

                    });
                }

            });

            glob_deferred.resolve();

        });

        Q.when(glob_deferred.promise).then(function () {

            Q.all(read_promises).then(function () {

                next(pages);
            });
        });
    };
};

plugin.configure = function (content_directory, config) {

    plugin.content_directory = content_directory;

    plugin.config = config;
};

module.exports = plugin;
