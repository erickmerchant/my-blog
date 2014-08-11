'use strict';

var gulp = require('gulp');
var _ = require('lodash');
var nunjucks = require('nunjucks');
var engine = require('static-engine');
var date_formats = ["YYYY-MM-DD", "YYYY-MM-DD-HHmmss"];

engine.plugins.content.configure('./content/', {
    converters: {
        md: engine.converters.marked()
    },
    date_formats: date_formats
});

nunjucks.configure('./templates/', {
    autoescape: true
});

gulp.task('site', function (cb) {

    var site = engine.site('./site/');

    site.engine(nunjucks.render);

    site.route('/')
        .use(engine.plugins.content('posts/*'))
        .use(engine.plugins.pager())
        .use(function (pages, next) {

            next([_.last(pages)]);
        })
        .render('post.html');

    site.route('/posts/{slug}/')
        .alias('post')
        .use(engine.plugins.content('posts/*'))
        .use(engine.plugins.pager())
        .render('post.html');

    site.route('/posts/')
        .use(engine.plugins.content('posts.md'))
        .use(function (pages, next) {

            var posts = engine.plugins.content('posts/*');

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
        .use(engine.plugins.content('drafts/*'))
        .use(engine.plugins.pager())
        .render('draft.html');

    site.route('/drafts/')
        .use(engine.plugins.content('drafts/*'))
        .use(engine.plugins.pager())
        .use(function (pages, next) {

            next([_.last(pages)]);
        })
        .render('draft.html');

    site.route('/404.html')
        .use(engine.plugins.content('404.md'))
        .render('404.html');

    site.after(engine.plugins.defaults(site, './content/defaults.yml'));

    return site.build();
});
