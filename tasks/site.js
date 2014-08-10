'use strict';

var gulp = require('gulp');
var site = require('../lib/site.js');
var defaults = require('../lib/plugins/defaults.js');
var content = require('../lib/plugins/content.js');
var pager = require('../lib/plugins/pager.js');
var marked_converter = require('../lib/converters/marked.js');
var nunjucks = require('nunjucks');
var _ = require('lodash');
var date_formats = ["YYYY-MM-DD", "YYYY-MM-DD-X"];

gulp.task('site', function(cb) {

    pager = pager();

    content.configure('./content/', {
        converters: {
            md: marked_converter()
        },
        date_formats: date_formats
    });

    nunjucks.configure('./templates/', {
        autoescape: true
    })

    site = site('./site/');

    site.engine(nunjucks.render);

    site.route('/')
        .use(content('posts/*'))
        .use(pager)
        .use(function(pages, next) {

            next([_.last(pages)]);
        })
        .render('post.html');

    site.route('/posts/{slug}/')
        .alias('post')
        .use(content('posts/*'))
        .use(pager)
        .render('post.html');

    site.route('/posts/')
        .use(content('posts.md'))
        .use(function(pages, next) {

            var posts = content('posts/*');

            posts([], function(posts) {

                _.map(posts, function(v, k) {

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
        .use(pager)
        .render('draft.html');

    site.route('/drafts/')
        .use(content('drafts/*'))
        .use(pager)
        .use(function(pages, next) {

            next([_.last(pages)]);
        })
        .render('draft.html');

    site.route('/404.html').use(content('404.md')).render('404.html');

    site.after(defaults(site, './content/defaults.yml'));

    return site.build();
});
