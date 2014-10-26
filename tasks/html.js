'use strict';

var gulp = require('gulp');
var _ = require('lodash');
var nunjucks = require('nunjucks');
var engine = require('static-engine');
var content = require('static-engine-content');
var defaults = require('static-engine-defaults');
var pager = require('static-engine-pager');
var first = require('static-engine-first');
var collection = require('static-engine-collection');
var marked = require('static-engine-converter-marked');
var date_formats = require('./settings.json').date_formats;
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var tap = require('gulp-tap');
var argv = require('argh').argv;

content.configure('./content/', {
    converters: {
        md: marked()
    },
    date_formats: date_formats
});

nunjucks.configure('./templates/', {
    autoescape: true
});

gulp.task('html', ['icons'], function (cb) {

    var cb_once = function () {

        cb();

        cb_once = function() {};
    };

    var site = engine('./site/', nunjucks.render);

    site.route('/')
        .use(content('posts/*'))
        .use(pager())
        .use(first())
        .render('post.html');

    site.route('/posts/{slug}/')
        .alias('post')
        .use(content('posts/*'))
        .use(pager())
        .render('post.html');

    site.route('/posts/')
        .use(content('posts.md'))
        .use(collection('posts', content('posts/*')))
        .render('posts.html');

    site.route('/404.html')
        .use(content('404.md'))
        .render('404.html');

    site.after(defaults(site, './content/defaults.yml'));

    site.build().then(function(){

        if(argv.dev) {

            cb();
        }
        else {

            gulp.src('site/**/**.html')
                .pipe(htmlmin({
                    collapseWhitespace: true
                }))
                .pipe(gulp.dest('site'))
                .pipe(tap(function () {
                    cb_once();
                }));
        }
    });
});
