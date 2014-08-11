'use strict';

var gulp = require('gulp');
var _ = require('lodash');
var nunjucks = require('nunjucks');
var lib = require('../lib/');
var date_formats = ["YYYY-MM-DD", "YYYY-MM-DD-HHmmss"];

lib.plugins.content.configure('./content/', {
    converters: {
        md: lib.converters.marked()
    },
    date_formats: date_formats
});

nunjucks.configure('./templates/', {
    autoescape: true
});

gulp.task('site', function (cb) {

    var site = lib.site('./site/');

    site.engine(nunjucks.render);

    site.route('/')
        .use(lib.plugins.content('posts/*'))
        .use(lib.plugins.pager())
        .use(function (pages, next) {

            next([_.last(pages)]);
        })
        .render('post.html');

    site.route('/posts/{slug}/')
        .alias('post')
        .use(lib.plugins.content('posts/*'))
        .use(lib.plugins.pager())
        .render('post.html');

    site.route('/posts/')
        .use(lib.plugins.content('posts.md'))
        .use(function (pages, next) {

            var posts = lib.plugins.content('posts/*');

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
        .use(lib.plugins.content('drafts/*'))
        .use(lib.plugins.pager())
        .render('draft.html');

    site.route('/drafts/')
        .use(lib.plugins.content('drafts/*'))
        .use(lib.plugins.pager())
        .use(function (pages, next) {

            next([_.last(pages)]);
        })
        .render('draft.html');

    site.route('/404.html')
        .use(lib.plugins.content('404.md'))
        .render('404.html');

    site.after(lib.plugins.defaults(site, './content/defaults.yml'));

    return site.build();
});
