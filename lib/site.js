'use strict';

var _ = require('lodash');
var moment = require('moment');
var yaml = require('js-yaml');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var trim = require('trimmer');
var Q = require('q');
var delim = "---\n";
var interpolate = require('interpolate');
var mkdirp = require('mkdirp');

function Site(settings) {

    this.settings = _.assign({
        content_directory: './content/',
        site_directory: './site/',
        date_formats: ["YYYY-MM-DD"],
        converters: {}
    }, settings||{});

    this.routes = {};

    this.befores = [];

    this.afters = [];
};

Site.prototype.route = function(name, settings) {

    this.routes[name] = settings || {};
};

Site.prototype.before = function(fn) {

    this.befores.push(fn);
};

Site.prototype.after = function(fn) {

    this.afters.push(fn);
};

Site.prototype.build = function(fn) {

    var handle_promises = [];

    var run_deferred = Q.defer();

    _.forOwn(this.routes, function(settings, name) {

        var handle_deferred = Q.defer();

        handle_promises.push(handle_deferred.promise);

        this.handle(name, settings, function(err){

            if(err) throw err;

            handle_deferred.resolve();
        });

    }, this);

    Q.all(handle_promises).then(function(){

        run_deferred.resolve();
    });

    return run_deferred.promise;
};

Site.prototype.handle = function(name, settings, done_callback) {

    var app = this;

    var model_promises = [];

    var pages = [];

    var glob_deferred = Q.defer();

    var glob_directory = app.settings.content_directory + settings.content;

    if(settings.content) {

        glob(glob_directory, {}, function (err, files) {

            _.each(files, function(file, current) {

                var ext = path.extname(file);

                var conv = trim.left(ext, '.');

                var parts;

                var model_deferred = Q.defer();

                var page = {};

                page.slug = path.basename(file, ext);

                model_promises[current] = model_deferred.promise;

                if(_.has(app.settings.converters, conv)) {

                    parts = path.basename(file, ext).split('.');

                    if(parts.length >= 2) {

                        page.date = moment(parts[0], app.settings.date_formats);

                        page.slug = parts.slice(1).join('.');
                    }

                    if(!(page.date && page.date.isValid())) {

                        page.date = moment();
                    }

                    fs.readFile(file, {encoding: 'utf-8'}, function(err, data){

                        if (err) throw err;

                        data = data.split(delim);

                        page = _.assign(page, yaml.load(data[1]));

                        app.settings.converters[conv](data.slice(2).join(delim), function(err, content){

                            page.content = content;

                            page.url = interpolate(settings.route || name, page);

                            pages[current] = {page: page};

                            model_deferred.resolve();
                        });

                    });
                }

            });

            glob_deferred.resolve();

        });
    }
    else {
        pages = [{page:{url: settings.route || name}}];

        glob_deferred.resolve();
    }

    Q.when(glob_deferred.promise).then(function(){

        Q.all(model_promises).then(function(){

            var middleware = settings.middleware ? [settings.middleware] : [];

            var i = -1;

            var next;

            var final;

            Array.prototype.unshift.apply(middleware, app.befores);

            Array.prototype.push.apply(middleware, app.afters);

            next = function(pages) {

                if(++i < middleware.length) {

                    middleware[i](pages, next);

                    return;
                }

                final(pages);
            };

            final = function(pages) {

                var render_promises = [];

                if(settings.template) {

                    _.each(pages, function(page) {

                        var render_deferred = Q.defer();

                        render_promises.push(render_deferred.promise);

                        app.settings.nunjucks.render(settings.template, page, function(err, html) {

                            var file = app.settings.site_directory + trim.left(page.page.url, '/');

                            var directory;

                            if(file.substr(-1) == '/') {

                                file += 'index.html';
                            }
                            else {

                                file += '.html';
                            }

                            directory = path.dirname(file);

                            mkdirp(directory, function (err) {

                                if (err) throw err;

                                fs.writeFile(file, html, function (err, data) {

                                    if (err) throw err;

                                    render_deferred.resolve();
                                });
                            });
                        });
                    });
                }

                Q.all(render_promises).then(function(){

                    done_callback();
                });
            };

            next(pages);
        });
    });
};

module.exports = function(settings) {

    return new Site(settings);
};
