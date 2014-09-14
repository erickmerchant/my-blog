'use strict';

var gulp = require('gulp');
var _ = require('lodash');
var nunjucks = require('nunjucks');
var engine = require('static-engine');
var content = engine.plugins.content;
var defaults = engine.plugins.defaults;
var pager = engine.plugins.pager;
var first = engine.plugins.first;
var collection = engine.plugins.collection;
var marked = engine.converters.marked;
var date_formats = require('./settings.json').date_formats;
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');

content.configure('./content/', {
    converters: {
        md: marked()
    },
    date_formats: date_formats
});

nunjucks.configure('./templates/', {
    autoescape: true
});

gulp.task('html', function (cb) {

    var site = engine.site('./site/', nunjucks.render);

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

    return site.build();
});

gulp.task('html-minify', ['html', 'icons-append'], function () {

    var stream = gulp.src('site/**/**.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('site'));

    return stream;
});
