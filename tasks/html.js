'use strict';

var gulp = require('gulp');
var _ = require('lodash');
var nunjucks = require('nunjucks');
var engine = require('static-engine');
var content = engine.plugins.content;
var defaults = engine.plugins.defaults;
var pager = engine.plugins.pager;
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

gulp.task('site', function (cb) {

    var site = engine.site('./site/', nunjucks.render);

    site.route('/')
        .use(content('posts/*'))
        .use(pager())
        .use(function (pages, next) {

            next([_.last(pages)]);
        })
        .render('post.html');

    site.route('/posts/{slug}/')
        .alias('post')
        .use(content('posts/*'))
        .use(pager())
        .render('post.html');

    site.route('/posts/')
        .use(content('posts.md'))
        .use(function (pages, next) {

            var posts = content('posts/*');

            posts([], function (posts) {

                _.map(posts, function (v, k) {

                    var page = v.page;

                    page.year_month = page.date.format(
                        'MMMM YYYY');

                    posts[k] = page;
                });

                pages[0].page.posts = posts.reverse();

                next(pages);
            });
        })
        .render('posts.html');

    site.route('/drafts/{slug}/')
        .alias('draft')
        .use(content('drafts/*'))
        .use(pager())
        .render('draft.html');

    site.route('/drafts/')
        .use(content('drafts/*'))
        .use(pager())
        .use(function (pages, next) {

            next([_.last(pages)]);
        })
        .render('draft.html');

    site.route('/404.html')
        .use(content('404.md'))
        .render('404.html');

    site.after(defaults(site, './content/defaults.yml'));

    return site.build();
});

gulp.task('htmlmin', ['geomicons-append'], function () {

    var stream = gulp.src('site/**/**.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('site'));

    return stream;
});
